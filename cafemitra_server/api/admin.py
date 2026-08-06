from django.contrib import admin

from .models import GooglePlace, GooglePlaceDetail, LeadActivity, ToolPricing, UserProfile, WalletSetting, WalletTopup, WalletTransaction, WithdrawalRequest


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "balance", "credit_limit_override", "cash_counter_permitted")
    list_editable = ("credit_limit_override", "cash_counter_permitted")
    search_fields = ("user__email", "user__username", "phone")


@admin.register(GooglePlace)
class GooglePlaceAdmin(admin.ModelAdmin):
    list_display = ("name", "link", "extracted_status", "extractedby", "created_at", "updated_at")
    list_editable = ("extracted_status",)
    list_filter = ("extracted_status",)
    search_fields = ("name", "link")


@admin.register(GooglePlaceDetail)
class GooglePlaceDetailAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "status", "next_follow_up_at", "rating", "reviews", "created_at", "updated_at")
    list_editable = ("status", "next_follow_up_at")
    list_filter = ("status",)
    search_fields = ("name", "address", "phone", "maps_url")


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ("lead", "kind", "from_status", "to_status", "created_at")
    list_filter = ("kind",)
    search_fields = ("lead__name", "note")


@admin.register(WalletSetting)
class WalletSettingAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "value", "is_active", "updated_at")
    list_editable = ("value", "is_active")
    search_fields = ("key", "label")


@admin.register(ToolPricing)
class ToolPricingAdmin(admin.ModelAdmin):
    list_display = ("tool_key", "label", "unit", "price", "price_b2b", "price_b2c", "is_billable", "updated_at")
    list_editable = ("price", "price_b2b", "price_b2c", "is_billable")
    search_fields = ("tool_key", "label")


@admin.register(WithdrawalRequest)
class WithdrawalRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "method", "status", "created_at")
    list_editable = ("status",)
    list_filter = ("status", "method")
    search_fields = ("user__email", "user__username", "account_detail")


@admin.register(WalletTopup)
class WalletTopupAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "amount", "payment_gateway", "status", "created_at", "paid_at")
    list_filter = ("status", "payment_gateway")
    search_fields = ("user__email", "user__username", "gateway_order_id", "gateway_payment_id")


@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "kind", "tool_key", "direction", "amount", "balance_after", "created_at")
    list_filter = ("kind", "direction")
    search_fields = ("user__email", "user__username", "tool_key", "note")
