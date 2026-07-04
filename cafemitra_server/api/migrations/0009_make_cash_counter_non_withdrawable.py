from decimal import Decimal

from django.db import migrations
from django.db.models import Sum


def remove_cash_counter_from_balance(apps, schema_editor):
    UserProfile = apps.get_model("api", "UserProfile")
    WalletTransaction = apps.get_model("api", "WalletTransaction")

    credited_cash_transactions = WalletTransaction.objects.filter(
        kind="cash_counter_collection",
        affects_balance=True,
    )
    user_totals = credited_cash_transactions.values("user_id").annotate(total=Sum("amount"))

    for item in user_totals:
        total = item["total"] or Decimal("0.00")
        if total <= 0:
            continue

        profile = UserProfile.objects.filter(user_id=item["user_id"]).first()
        if not profile:
            continue
        profile.balance = max(profile.balance - total, Decimal("0.00")).quantize(Decimal("0.01"))
        profile.save(update_fields=["balance"])

    credited_cash_transactions.update(affects_balance=False, direction="info")


def add_cash_counter_back_to_balance(apps, schema_editor):
    UserProfile = apps.get_model("api", "UserProfile")
    WalletTransaction = apps.get_model("api", "WalletTransaction")

    cash_transactions = WalletTransaction.objects.filter(
        kind="cash_counter_collection",
        affects_balance=False,
    )
    user_totals = cash_transactions.values("user_id").annotate(total=Sum("amount"))

    for item in user_totals:
        total = item["total"] or Decimal("0.00")
        if total <= 0:
            continue

        profile, _ = UserProfile.objects.get_or_create(
            user_id=item["user_id"],
            defaults={"phone": "", "balance": Decimal("0.00")},
        )
        profile.balance = (profile.balance + total).quantize(Decimal("0.01"))
        profile.save(update_fields=["balance"])

    cash_transactions.update(affects_balance=True, direction="credit")


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0008_credit_cash_counter_wallet_transactions"),
    ]

    operations = [
        migrations.RunPython(remove_cash_counter_from_balance, add_cash_counter_back_to_balance),
    ]
