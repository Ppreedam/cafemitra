from decimal import Decimal

from django.db import migrations


def seed_tool_pricing(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")

    tool_prices = [
        ("id_card_print", "ID Card Print", "per print"),
        ("photo_print_sheet", "Photo Print Sheet Maker", "per print"),
    ]
    # is_billable=False and price=0 by default - both tools stay free until a
    # price is set and is_billable is flipped on in Django admin. Same
    # pattern as 0023_seed_biodata_maker_tool_pricing.
    for tool_key, label, unit in tool_prices:
        ToolPricing.objects.get_or_create(
            tool_key=tool_key,
            defaults={"label": label, "unit": unit, "price": Decimal("0.00"), "is_billable": False},
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_printorder_admin_reviewed_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_tool_pricing, noop_reverse),
    ]
