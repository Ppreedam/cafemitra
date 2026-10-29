from django.core.management.base import BaseCommand

from api.views import PHOTO_INPUT_RETENTION_HOURS, purge_expired_photo_inputs


class Command(BaseCommand):
    help = (
        f"Deletes the customer's uploaded photos from passport / family photo orders generated more than "
        f"{PHOTO_INPUT_RETENTION_HOURS} hours ago (only the generated photo is kept). Safe to run repeatedly - "
        "schedule it hourly with cron."
    )

    def handle(self, *args, **options):
        purged = purge_expired_photo_inputs(limit=None)
        self.stdout.write(self.style.SUCCESS(f"Purged uploads from {purged} order(s)."))
