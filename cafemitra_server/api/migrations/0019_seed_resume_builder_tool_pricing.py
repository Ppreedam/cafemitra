from decimal import Decimal

from django.db import migrations


def seed_resume_builder_tool_pricing(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")

    tool_prices = [
        ("resume_builder_classic", "Resume Builder - Classic template", "per download"),
        ("resume_builder_modern", "Resume Builder - Modern template", "per download"),
        ("resume_builder_minimal", "Resume Builder - Minimal template", "per download"),
    ]
    # is_billable=False and price=0 by default - downloads stay free until a
    # price is set and is_billable is flipped on in Django admin, per template.
    for tool_key, label, unit in tool_prices:
        ToolPricing.objects.get_or_create(
            tool_key=tool_key,
            defaults={"label": label, "unit": unit, "price": Decimal("0.00"), "is_billable": False},
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_scraperun'),
    ]

    operations = [
        migrations.RunPython(seed_resume_builder_tool_pricing, noop_reverse),
    ]
