from django.contrib import admin

from .models import ToolPricing, WalletSetting, WalletTransaction, WithdrawalRequest


@admin.register(WalletSetting)
class WalletSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "value", "is_active", "updated_at")
    list_editable = ("value", "is_active")
    search_fields = ("key", "label")


@admin.register(ToolPricing)
class ToolPricingAdmin(admin.ModelAdmin):
    list_display = ("tool_key", "label", "unit", "price", "is_billable", "updated_at")
    list_editable = ("price", "is_billable")
    search_fields = ("tool_key", "label")


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "method", "status", "created_at")
    list_editable = ("status",)
    list_filter = ("status", "method")
    search_fields = ("user__email", "user__username", "account_detail")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "kind", "tool_key", "direction", "amount", "balance_after", "created_at")
    list_filter = ("kind", "direction")
    search_fields = ("user__email", "user__username", "tool_key", "note")
