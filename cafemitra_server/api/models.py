from django.conf import settings
from django.db import models


class AuthToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="api_tokens")
    key = models.CharField(max_length=128, unique=True)
    access_expires_at = models.DateTimeField(null=True, blank=True)
    refresh_key = models.CharField(max_length=128, unique=True, null=True, blank=True)
    refresh_expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Token for {self.user_id}"


class EmailVerificationToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="email_verification_tokens")
    token = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["token", "expires_at"])]

    def __str__(self) -> str:
        return f"Email verification for {self.user_id}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="password_reset_tokens")
    token = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["token", "expires_at"])]

    def __str__(self) -> str:
        return f"Password reset for {self.user_id}"


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


class ContactMessage(models.Model):
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=24, blank=True)
    subject = models.CharField(max_length=120)
    message = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["created_at", "is_read"])]

    def __str__(self) -> str:
        return f"{self.subject} from {self.full_name}"


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
    payment_gateway = models.CharField(max_length=40, blank=True)
    gateway_order_id = models.CharField(max_length=120, blank=True)
    gateway_payment_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=40, default=STATUS_AWAITING_PAYMENT)
    document = models.FileField(upload_to="print_orders/%Y/%m/%d/")
    original_filename = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    agent_message = models.TextField(blank=True)
    attire_category = models.CharField(max_length=40, blank=True, default="")
    gemini_photo = models.CharField(max_length=255, blank=True, default="")

    PHOTO_STATUS_PENDING = "pending"
    PHOTO_STATUS_CLAIMED = "claimed"
    PHOTO_STATUS_DONE = "done"
    PHOTO_STATUS_FAILED = "failed"

    passport_prompt = models.TextField(blank=True, default="")
    photo_status = models.CharField(max_length=20, blank=True, default="")
    photo_error_message = models.TextField(blank=True, default="")
    photo_updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "token_number"])]

    def __str__(self) -> str:
        return f"Order #{self.id} - {self.service_name}"


class WalletTransaction(models.Model):
    KIND_SIGNUP_BONUS = "signup_bonus"
    KIND_REFERRAL_BONUS = "referral_bonus"
    KIND_ONLINE_ORDER_CREDIT = "online_order_credit"
    KIND_CASH_COUNTER_COLLECTION = "cash_counter_collection"
    KIND_TOOL_USAGE = "tool_usage"
    KIND_WITHDRAWAL = "withdrawal"
    KIND_TOPUP = "topup"

    DIRECTION_CREDIT = "credit"
    DIRECTION_DEBIT = "debit"
    DIRECTION_INFO = "info"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet_transactions")
    order = models.ForeignKey(PrintOrder, null=True, blank=True, on_delete=models.SET_NULL, related_name="wallet_transactions")
    tool_key = models.CharField(max_length=80, blank=True)
    kind = models.CharField(max_length=40)
    direction = models.CharField(max_length=12)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    affects_balance = models.BooleanField(default=True)
    # Snapshot of UserProfile.balance right after this transaction was applied.
    # Lets us answer "was the wallet already negative at this point" (needed
    # for the daily grace-usage limit) without replaying the whole ledger.
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "kind", "created_at"])]

    def __str__(self) -> str:
        return f"{self.kind} {self.amount} for {self.user_id}"


class WalletSetting(models.Model):
    """Admin-editable numbers that drive both wallet display and enforcement
    (signup bonus, referral bonus, grace-credit limit, daily grace-usage cap).

    A single source of truth: the public /api/wallet/config/ endpoint reads
    these same rows, so marketing pages and backend enforcement can never
    drift apart the way SIGNUP_BONUS_AMOUNT vs the pricing page did before.
    """

    key = models.CharField(max_length=60, unique=True)
    label = models.CharField(max_length=160)
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self) -> str:
        return f"{self.key} = {self.value}"


class ToolPricing(models.Model):
    """RepetiGo's own per-tool usage fee - separate from ServicePricing,
    which stores what a shop charges ITS customer at the counter. Editable
    from Django admin so prices can change without a frontend deploy.
    """

    tool_key = models.CharField(max_length=80, unique=True)
    label = models.CharField(max_length=160)
    unit = models.CharField(max_length=80, blank=True, default="per use")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_billable = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["tool_key"]

    def __str__(self) -> str:
        return f"{self.tool_key} - Rs. {self.price} ({self.unit})"


class WithdrawalRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_REJECTED = "rejected"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="withdrawal_requests")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=40)
    account_detail = models.CharField(max_length=180)
    note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Withdrawal {self.amount} for {self.user_id}"


class GooglePlace(models.Model):
    """A scraped Google Maps place link, tracked for later data extraction."""

    link = models.TextField()
    name = models.CharField(max_length=255, unique=True)
    extracted_status = models.BooleanField(default=False)
    extractedby = models.CharField(max_length=160, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["extracted_status"])]

    def __str__(self) -> str:
        return self.name


class GooglePlaceDetail(models.Model):
    """Full scraped detail record for a Google Maps place (post-extraction)."""

    STATUS_NEW = "new"
    STATUS_FOLLOW_UP = "follow_up"
    STATUS_DISCUSSION = "discussion"
    STATUS_INTERESTED = "interested"
    STATUS_CALL_DISCUSSED = "call_discussed"
    STATUS_CONVERTED = "converted"
    STATUS_NOT_INTERESTED = "not_interested"

    STATUS_CHOICES = [
        (STATUS_NEW, "New"),
        (STATUS_FOLLOW_UP, "Follow-up"),
        (STATUS_DISCUSSION, "In Discussion"),
        (STATUS_INTERESTED, "Interested"),
        (STATUS_CALL_DISCUSSED, "Call Discussed"),
        (STATUS_CONVERTED, "Converted"),
        (STATUS_NOT_INTERESTED, "Not Interested"),
    ]

    name = models.CharField(max_length=255)
    address = models.TextField(blank=True, default="")
    image = models.TextField(blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    maps_url = models.CharField(max_length=1000, unique=True)
    phone = models.CharField(max_length=40, blank=True, default="")
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    reviews = models.PositiveIntegerField(null=True, blank=True)
    website = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    notes = models.TextField(blank=True, default="")
    next_follow_up_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status"]), models.Index(fields=["next_follow_up_at"])]

    def __str__(self) -> str:
        return self.name


class LeadActivity(models.Model):
    """Timeline entry for a GooglePlaceDetail lead - an automatic status-change
    record or a manually added note, so the pipeline history isn't lost the
    way a single overwritable `notes` field would lose it.
    """

    KIND_STATUS_CHANGE = "status_change"
    KIND_NOTE = "note"

    KIND_CHOICES = [
        (KIND_STATUS_CHANGE, "Status change"),
        (KIND_NOTE, "Note"),
    ]

    lead = models.ForeignKey(GooglePlaceDetail, on_delete=models.CASCADE, related_name="activities")
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    from_status = models.CharField(max_length=20, blank=True, default="")
    to_status = models.CharField(max_length=20, blank=True, default="")
    note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["lead", "created_at"])]

    def __str__(self) -> str:
        return f"{self.kind} on lead #{self.lead_id}"
