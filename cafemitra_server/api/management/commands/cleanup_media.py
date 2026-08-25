import shutil
import time

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import PrintOrder
from api.views import delete_order_document

# Files not touched for at least this long are safe to treat as orphaned -
# long enough that no in-flight upload request could still be writing them.
ORPHAN_MIN_AGE_SECONDS = 3600


class Command(BaseCommand):
    help = (
        "One-time/repeatable cleanup for media/ files left over from before automatic "
        "cleanup was added: (1) PrintOrder.document files on already-completed "
        "(printed/failed) orders that predate the auto-delete-on-completion change, "
        "(2) files under media/print_orders/ that no PrintOrder row references at all "
        "(e.g. an order that was later removed from the DB without its file being "
        "cleaned up - Django doesn't do that automatically), and (3) the orphaned "
        "media/passportsizephoto/ tree, output of a removed PassportPhotoJob model that "
        "no longer exists. Defaults to a dry run; pass --apply to actually delete."
    )

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="Actually delete files instead of just reporting what would be removed.")

    def handle(self, *args, **options):
        apply = options["apply"]

        orders = PrintOrder.objects.filter(status__in=[PrintOrder.STATUS_PRINTED, PrintOrder.STATUS_FAILED]).exclude(document="")
        order_count = orders.count()
        self.stdout.write(f"PrintOrder documents on completed orders: {order_count}")
        if apply:
            cleaned = 0
            for order in orders.iterator():
                delete_order_document(order)
                order.save(update_fields=["document"])
                cleaned += 1
            self.stdout.write(self.style.SUCCESS(f"Deleted {cleaned} order document file(s)."))
        elif order_count:
            self.stdout.write("  (dry run - re-run with --apply to delete these)")

        print_orders_dir = settings.MEDIA_ROOT / "print_orders"
        if print_orders_dir.exists():
            referenced = set(PrintOrder.objects.exclude(document="").values_list("document", flat=True))
            now = time.time()
            orphaned = []
            for path in print_orders_dir.rglob("*"):
                if not path.is_file():
                    continue
                rel = path.relative_to(settings.MEDIA_ROOT).as_posix()
                if rel in referenced:
                    continue
                if now - path.stat().st_mtime < ORPHAN_MIN_AGE_SECONDS:
                    continue  # too recent - could be an upload still in progress
                orphaned.append(path)
            self.stdout.write(f"Orphaned files under media/print_orders/ (no PrintOrder row references them): {len(orphaned)}")
            if apply:
                for path in orphaned:
                    path.unlink(missing_ok=True)
                self.stdout.write(self.style.SUCCESS(f"Deleted {len(orphaned)} orphaned file(s)."))
            elif orphaned:
                self.stdout.write("  (dry run - re-run with --apply to delete these)")

        legacy_dir = settings.MEDIA_ROOT / "passportsizephoto"
        if legacy_dir.exists():
            file_count = sum(1 for p in legacy_dir.rglob("*") if p.is_file())
            self.stdout.write(f"Legacy media/passportsizephoto/ folder: {file_count} file(s)")
            if apply:
                shutil.rmtree(legacy_dir)
                self.stdout.write(self.style.SUCCESS("Deleted media/passportsizephoto/."))
            else:
                self.stdout.write("  (dry run - re-run with --apply to delete this folder)")
        else:
            self.stdout.write("Legacy media/passportsizephoto/ folder: not present, nothing to do.")

        if not apply:
            self.stdout.write(self.style.WARNING("Dry run only - nothing was deleted. Re-run with --apply to actually delete."))
