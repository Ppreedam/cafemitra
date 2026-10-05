from decimal import Decimal

from django.db import migrations


def enable_referral_bonus(apps, schema_editor):
    WalletSetting = apps.get_model("api", "WalletSetting")
    WalletSetting.objects.update_or_create(
        key="referral_bonus",
        defaults={
            "label": "Referral Bonus",
            "value": Decimal("50.00"),
            "description": "Rs. credited to a shop when someone it referred verifies their email.",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("api", "0048_referral_system")]
    operations = [migrations.RunPython(enable_referral_bonus, migrations.RunPython.noop)]
