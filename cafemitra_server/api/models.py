from django.conf import settings
from django.db import models


class AuthToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="api_token")
    key = models.CharField(max_length=128, unique=True)
    access_expires_at = models.DateTimeField(null=True, blank=True)
    refresh_key = models.CharField(max_length=128, unique=True, null=True, blank=True)
    refresh_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Token for {self.user_id}"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=10)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profile_photo = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.email


class ShopProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shop")
    shop_name = models.CharField(max_length=160, blank=True)
    logo = models.TextField(blank=True)
    banner = models.TextField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=80, blank=True)
    state = models.CharField(max_length=80, blank=True)
    pin_code = models.CharField(max_length=6, blank=True)
    mobile = models.CharField(max_length=10, blank=True)
    whatsapp = models.CharField(max_length=10, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self) -> str:
        return self.shop_name or f"Shop for {self.user_id}"


class ServicePricing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="service_pricing")
    service_key = models.CharField(max_length=80)
    service_name = models.CharField(max_length=160)
    settings = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "service_key")
        ordering = ["service_name"]

    def __str__(self) -> str:
        return f"{self.service_name} pricing for {self.user_id}"


class PrintOrder(models.Model):
    PAYMENT_PENDING = "pending"
    PAYMENT_PAID = "paid"
    PAYMENT_CASH_COUNTER = "cash_counter"
    PAYMENT_NO_PAYMENT = "no_payment"

    STATUS_AWAITING_PAYMENT = "awaiting_payment"
    STATUS_AWAITING_APPROVAL = "awaiting_approval"
    STATUS_QUEUED = "queued"
    STATUS_PRINTING = "printing"
    STATUS_PRINTED = "printed"
    STATUS_FAILED = "failed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="print_orders")
    shop_code = models.CharField(max_length=24)
    token_number = models.PositiveIntegerField(default=1)
    token_id = models.CharField(max_length=40, blank=True)
    service_key = models.CharField(max_length=80)
    service_name = models.CharField(max_length=160)
    price_item_id = models.CharField(max_length=120, blank=True)
    price_label = models.CharField(max_length=160)
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    pages = models.PositiveIntegerField(default=1)
    copies = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=80)
    payment_status = models.CharField(max_length=40, default=PAYMENT_PENDING)
    status = models.CharField(max_length=40, default=STATUS_AWAITING_PAYMENT)
    document = models.FileField(upload_to="print_orders/%Y/%m/%d/")
    original_filename = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    agent_message = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "token_number"])]

    def __str__(self) -> str:
        return f"Order #{self.id} - {self.service_name}"
