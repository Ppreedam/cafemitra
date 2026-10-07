from decimal import Decimal

from django.db import migrations


def seed_referral_trigger(apps, schema_editor):
    WalletSetting = apps.get_model("api", "WalletSetting")
    WalletSetting.objects.get_or_create(
        key="referral_trigger",
        defaults={
            "label": "Referral bonus trigger",
            "value": Decimal("0.00"),
            "description": "is_active off = pay referral bonus when the referred email is verified; on = pay on the referred shop's first top-up of at least this amount.",
            "is_active": False,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("api", "0049_seed_referral_bonus_50")]
    operations = [migrations.RunPython(seed_referral_trigger, migrations.RunPython.noop)]
