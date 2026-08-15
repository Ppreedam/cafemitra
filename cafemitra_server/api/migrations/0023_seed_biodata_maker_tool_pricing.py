from decimal import Decimal

from django.db import migrations


def seed_biodata_maker_tool_pricing(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")

    tool_prices = [
        ("biodata_maker_classic", "Biodata Maker - Classic template", "per download"),
        ("biodata_maker_modern", "Biodata Maker - Modern template", "per download"),
        ("biodata_maker_simple", "Biodata Maker - Simple template", "per download"),
    ]
    # is_billable=False and price=0 by default - downloads stay free until a
    # price is set and is_billable is flipped on in Django admin, per
    # template. Same pattern as 0019_seed_resume_builder_tool_pricing.
    for tool_key, label, unit in tool_prices:
        ToolPricing.objects.get_or_create(
            tool_key=tool_key,
            defaults={"label": label, "unit": unit, "price": Decimal("0.00"), "is_billable": False},
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0022_printorder_biodata_data'),
    ]

    operations = [
        migrations.RunPython(seed_biodata_maker_tool_pricing, noop_reverse),
    ]
