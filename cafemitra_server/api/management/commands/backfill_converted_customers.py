from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from api.models import GooglePlaceDetail

User = get_user_model()


def customer_address(shop):
    parts = [shop.address, shop.city, shop.state, shop.pin_code]
    return ", ".join(part.strip() for part in parts if part and part.strip())


class Command(BaseCommand):
    help = (
        "One-time sync: creates a Converted-status GooglePlaceDetail (Lead) record for "
        "every already-registered shop account that doesn't have one yet, so the Leads "
        "CRM > Converted Customers admin page - which is built on the Lead table so it "
        "can reuse tags/follow-up/notes - shows real signed-up customers, not just leads "
        "manually marked Converted from the Google Maps scraping pipeline. Safe to "
        "re-run: skips any user that already has a linked lead record. Defaults to a dry "
        "run; pass --apply to actually create the records."
    )

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="Actually create the records instead of just reporting what would be created.")

    def handle(self, *args, **options):
        apply = options["apply"]

        users = User.objects.select_related("shop", "profile").filter(shop__isnull=False).exclude(lead_detail__isnull=False)
        count = users.count()
        self.stdout.write(f"Registered shop accounts with no Converted Customer record yet: {count}")

        if not count:
            return

        if apply:
            created = 0
            for user in users.iterator():
                shop = user.shop
                profile = getattr(user, "profile", None)
                GooglePlaceDetail.objects.create(
                    name=shop.shop_name or user.get_full_name() or user.email or f"Shop #{user.id}",
                    address=customer_address(shop),
                    phone=(profile.phone if profile else "") or shop.mobile,
                    email=user.email or shop.email,
                    maps_url=f"internal://customers/{user.id}",
                    status=GooglePlaceDetail.STATUS_CONVERTED,
                    linked_user=user,
                )
                created += 1
            self.stdout.write(self.style.SUCCESS(f"Created {created} Converted Customer record(s)."))
        else:
            self.stdout.write("  (dry run - re-run with --apply to create these)")
