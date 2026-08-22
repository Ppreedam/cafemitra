from decimal import Decimal

from django.db import migrations


def seed_withdrawal_fee_percent(apps, schema_editor):
    WalletSetting = apps.get_model("api", "WalletSetting")

    WalletSetting.objects.get_or_create(
        key="withdrawal_fee_percent",
        defaults={
            "label": "Withdrawal Fee (%)",
            "value": Decimal("2.00"),
            "description": "Percentage deducted from every withdrawal request as a transaction/processing fee. The shop owner's requested amount is capped by their withdrawable balance; the fee is subtracted from that request before it's debited from the wallet and recorded.",
            "is_active": True,
        },
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_withdrawalrequest_fee_amount'),
    ]

    operations = [
        migrations.RunPython(seed_withdrawal_fee_percent, noop_reverse),
    ]
