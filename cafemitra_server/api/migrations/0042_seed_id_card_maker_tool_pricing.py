from decimal import Decimal

from django.db import migrations


def seed_tool_pricing(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")

    # Unlike id_card_print/photo_print_sheet (seeded free, flipped on later
    # in admin), this one is requested live from day one: Rs. 5 per card
    # generated (Print Card or Download PDF, whichever happens first for a
    # given upload - see id_card_maker_charge).
    ToolPricing.objects.update_or_create(
        tool_key="id_card_maker",
        defaults={"label": "ID Card Maker", "unit": "per card", "price": Decimal("5.00"), "is_billable": True},
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0041_customernote'),
    ]

    operations = [
        migrations.RunPython(seed_tool_pricing, noop_reverse),
    ]
