from decimal import Decimal

from django.db import migrations


def seed_resume_builder_tool_pricing(apps, schema_editor):
    ToolPricing = apps.get_model("api", "ToolPricing")

    tool_prices = [
        ("resume_builder_elegant", "Resume Builder - Elegant template", "per download"),
        ("resume_builder_bold", "Resume Builder - Bold template", "per download"),
        ("resume_builder_sidebar", "Resume Builder - Sidebar Photo template", "per download"),
        ("resume_builder_sidebar-right", "Resume Builder - Sidebar Photo (Right) template", "per download"),
        ("resume_builder_ats", "Resume Builder - ATS-Ultra template", "per download"),
        ("resume_builder_timeline", "Resume Builder - Timeline template", "per download"),
    ]
    # Same safe defaults as the first three templates (migration 0019):
    # is_billable=False and price=0 until a price is set in Django admin.
    for tool_key, label, unit in tool_prices:
        ToolPricing.objects.get_or_create(
            tool_key=tool_key,
            defaults={"label": label, "unit": unit, "price": Decimal("0.00"), "is_billable": False},
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_printorder_resume_data'),
    ]

    operations = [
        migrations.RunPython(seed_resume_builder_tool_pricing, noop_reverse),
    ]
