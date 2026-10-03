from decimal import Decimal

from django.db import migrations


def seed_family_passport_photo(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")
    ToolVisibility = apps.get_model("api", "ToolVisibility")

    # Costlier than the single passport_photo tool (Rs. 5/request) since a
    # family merge sends several images to the provider in one billed call.
    ToolPricing.objects.update_or_create(
        tool_key="family_passport_photo",
        defaults={"label": "Family Passport Photo", "unit": "per request", "price": Decimal("15.00"), "is_billable": True},
    )
    ToolVisibility.objects.get_or_create(
        tool_key="family_passport_photo", defaults={"label": "Family Passport Photo", "is_enabled": True},
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0044_printorder_family_photo_inputs'),
    ]

    operations = [
        migrations.RunPython(seed_family_passport_photo, noop_reverse),
    ]
