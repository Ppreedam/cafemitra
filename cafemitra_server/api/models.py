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
    # Per-cafe override for how negative the wallet is allowed to go before
    # paid tools are blocked. Null means "use the global WalletSetting
    # credit_limit" - only set from Django admin, on a case-by-case basis.
    credit_limit_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # Platform-granted permission to offer Cash Counter as a customer
    # payment option. Even when permitted, it's further auto-locked live
    # whenever the wallet balance drops to/below the effective credit limit
    # (see cash_counter_available in views.py) - a cafe already owing the
    # platform money can't also start collecting untracked cash.
    cash_counter_permitted = models.BooleanField(default=True)
    # Stamped on every GET /agent/jobs/ poll (see views.agent_jobs) - the
    # simplest possible "is this shop's desktop Print Agent alive" signal,
    # since the agent doesn't report its version or send a dedicated
    # heartbeat today.
    agent_last_seen_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return self.user.get_full_name() or self.user.email


class Agent(models.Model):
    """A referral partner (typically a cybercafe already on RepetiGo) who
    refers new shops and earns a commission on their printed orders. Distinct
    from the "Print Agent" desktop software - this is a business partner, not
    an app. Full onboarding/commission-accrual/payout flow ships in the admin
    dashboard's Referral Agent Program phase; this model exists ahead of that
    so ShopProfile.referred_by_agent doesn't need a later backfill migration.
    """

    COMMISSION_PERCENTAGE = "percentage"
    COMMISSION_FIXED = "fixed"

    COMMISSION_TYPE_CHOICES = [
        (COMMISSION_PERCENTAGE, "Percentage"),
        (COMMISSION_FIXED, "Fixed amount"),
    ]

    STATUS_PENDING = "pending"
    STATUS_ACTIVE = "active"
    STATUS_SUSPENDED = "suspended"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_SUSPENDED, "Suspended"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="agent_profiles")
    referral_code = models.CharField(max_length=32, unique=True)
    commission_type = models.CharField(max_length=20, choices=COMMISSION_TYPE_CHOICES, default=COMMISSION_PERCENTAGE)
    commission_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    special_offer_note = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Agent {self.referral_code} ({self.user_id})"


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
    # Set at signup if the shop used a referral code (or by admin later) -
    # dormant until the Referral Agent Program phase wires up commission
    # accrual, but modeled now so it doesn't need a backfill migration then.
    referred_by_agent = models.ForeignKey(Agent, null=True, blank=True, on_delete=models.SET_NULL, related_name="referred_shops")

    def __str__(self) -> str:
        return self.shop_name or f"Shop for {self.user_id}"


class UpiPayee(models.Model):
    """A shop's saved UPI collection account (VPA + display name) for the
    UPI QR Generator tool. A shop can save multiple - e.g. one VPA for the
    front counter, one for a second branch - and switch between them when
    generating a QR. Pure convenience/persistence; the tool itself has no
    per-use backend cost (the QR is built client-side), so it is NOT wired
    into ToolPricing.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="upi_payees")
    label = models.CharField(max_length=160)
    vpa = models.CharField(max_length=120)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self) -> str:
        return f"{self.label} ({self.vpa})"


class UpiQrRecord(models.Model):
    """One generated UPI QR the shop chose to keep (not every QR generated -
    only ones the user explicitly saves from the UPI QR Generator tool), so
    they can reopen/reprint a past QR (e.g. a recurring fixed-amount QR)
    without retyping the amount/note each time. Only the field values are
    stored, not the rendered image - the QR/branded card is rebuilt
    client-side from these on demand.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="upi_qr_records")
    label = models.CharField(max_length=160)
    vpa = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    note = models.CharField(max_length=50, blank=True)
    order_ref = models.CharField(max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.label} QR ({self.vpa})"


class ContactMessage(models.Model):
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    phone = models.CharField(max_length=24, blank=True)
    subject = models.CharField(max_length=120)
    message = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    admin_note = models.TextField(blank=True, default="")
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
    # Passport photo orders don't use a stored file - the raw upload and the
    # AI result live as base64 data URIs in original_filename/gemini_photo
    # instead, so document stays blank for that service.
    document = models.FileField(upload_to="print_orders/%Y/%m/%d/", blank=True)
    original_filename = models.TextField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    printed_at = models.DateTimeField(null=True, blank=True)
    # Stamped once settle_printed_order_wallet has actually run for this
    # order - guards against a retried `status=printed` call (slow-response
    # retry from the desktop Print Agent) re-running the wallet credit/fee
    # deduction. See agent_job_status: this check is done under a
    # select_for_update() row lock on the order itself, which the wallet
    # ledger's own (user, order, kind) dedupe can't guarantee alone since
    # that check-then-create isn't protected by the same lock as the balance
    # update, and can race under two concurrent calls.
    settled_at = models.DateTimeField(null=True, blank=True)
    agent_message = models.TextField(blank=True)
    attire_category = models.CharField(max_length=40, blank=True, default="")
    gemini_photo = models.TextField(blank=True, default="")

    # Admin-side triage flag for the Order Issues queue (unsuccessful orders
    # an admin has looked into and handled/contacted the shop about) -
    # independent of `status`, which reflects the print pipeline itself.
    admin_reviewed = models.BooleanField(default=False)
    admin_reviewed_at = models.DateTimeField(null=True, blank=True)

    PHOTO_STATUS_PENDING = "pending"
    PHOTO_STATUS_CLAIMED = "claimed"
    PHOTO_STATUS_DONE = "done"
    PHOTO_STATUS_FAILED = "failed"

    passport_prompt = models.TextField(blank=True, default="")
    photo_status = models.CharField(max_length=20, blank=True, default="")
    photo_error_message = models.TextField(blank=True, default="")
    photo_updated_at = models.DateTimeField(null=True, blank=True)

    # resume_builder-specific: the full structured resume (name, sections,
    # experience, etc.) as JSON, so a saved resume can be reopened and
    # edited later - not just re-downloaded. Reusing PrintOrder (rather than
    # a bespoke table) keeps this on the same wallet/order-history rails as
    # every other tool, so it stays reusable for a future B2C flow (a cafe
    # generating a resume for a walk-in customer) without a separate model.
    resume_data = models.JSONField(null=True, blank=True)

    # biodata_maker-specific: same reasoning as resume_data above - the full
    # structured biodata (personal, family, astrology details) as JSON, on
    # the same PrintOrder rails so it's reusable for both the owner's
    # authenticated builder and a future B2C flow.
    biodata_data = models.JSONField(null=True, blank=True)

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
    KIND_TOOL_USAGE_BLOCKED = "tool_usage_blocked"
    KIND_WITHDRAWAL = "withdrawal"
    KIND_WITHDRAWAL_REVERSAL = "withdrawal_reversal"
    KIND_TOPUP = "topup"
    KIND_ADMIN_ADJUSTMENT = "admin_adjustment"
    KIND_REFERRAL_COMMISSION = "referral_commission"
    KIND_COUPON_CREDIT = "coupon_credit"

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


class Coupon(models.Model):
    """Admin-issued promotional wallet credit. Redeeming one credits the
    shop's wallet balance immediately (spendable on tools) but the amount is
    excluded from wallet_collection_summary()'s net_withdrawable figure -
    the same "promotional, not withdrawable" treatment already given to the
    signup bonus (see ensure_signup_wallet_bonus / KIND_SIGNUP_BONUS)."""

    code = models.CharField(max_length=32, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    message = models.CharField(max_length=255, help_text="Shown to the shop when they redeem this coupon.")
    is_active = models.BooleanField(default=True)
    # Null = unlimited total redemptions across all shops.
    max_redemptions = models.PositiveIntegerField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_coupons")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Coupon {self.code} (Rs. {self.amount})"


class CouponRedemption(models.Model):
    """One shop's use of one coupon. unique_together is the DB-level
    guarantee a shop can't redeem the same code twice - checked under a
    row lock on the Coupon itself at redemption time (see
    public_redeem_coupon in views.py), so this is belt-and-suspenders
    against any race the lock might miss."""

    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="redemptions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coupon_redemptions")
    wallet_transaction = models.ForeignKey(WalletTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name="coupon_redemption")
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-redeemed_at"]
        constraints = [models.UniqueConstraint(fields=["coupon", "user"], name="unique_coupon_per_user")]

    def __str__(self) -> str:
        return f"{self.coupon.code} redeemed by {self.user_id}"


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
    # Optional per-context override on top of `price`: B2C = tool usage
    # triggered by serving a customer order (a PrintOrder is involved), B2B =
    # the cafe owner using the tool directly from their own dashboard. Null
    # means "fall back to `price`" so existing single-rate rows keep working.
    price_b2b = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_b2c = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_billable = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["tool_key"]

    def __str__(self) -> str:
        return f"{self.tool_key} - Rs. {self.price} ({self.unit})"


class ToolVisibility(models.Model):
    """Whether a tool shows up in the "Automation Tools" nav on the public
    site and in the shop-owner dashboard sidebar at all - distinct from
    ToolPricing.is_billable, which is about charging for an already-visible
    tool. `tool_key` is the same identifier the client apps already use as
    each nav item's serviceKey (see DEFAULT_SERVICE_PRICING and
    DashboardShell.tsx's navGroups), not the finer-grained per-template keys
    ToolPricing uses for resume_builder/biodata_maker.
    """

    tool_key = models.CharField(max_length=60, unique=True)
    label = models.CharField(max_length=160)
    is_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["label"]

    def __str__(self) -> str:
        return f"{self.tool_key}: {'on' if self.is_enabled else 'off'}"


class WithdrawalRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_REJECTED = "rejected"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="withdrawal_requests")
    # Net amount actually requested/debited from the wallet - the shop owner
    # typed a larger figure (up to their withdrawable balance) and this is
    # that figure minus the transaction fee below, frozen at request time so
    # a later change to WalletSetting "withdrawal_fee_percent" doesn't alter
    # past requests.
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
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


class WalletTopup(models.Model):
    """A gateway-backed wallet recharge (KIND_TOPUP once credited) - mirrors
    PrintOrder's payment fields but scoped to wallet top-ups instead of a
    print job, since a top-up isn't tied to any order.
    """

    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_FAILED = "failed"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wallet_topups")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_gateway = models.CharField(max_length=40, blank=True)
    gateway_order_id = models.CharField(max_length=120, blank=True)
    gateway_payment_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=20, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Topup {self.amount} for {self.user_id} ({self.status})"


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


class LeadTag(models.Model):
    """A sales-defined label (e.g. "VIP", "Needs Call") that can be applied to any
    number of converted leads, many-to-many, for follow-up tracking. `color` stores a
    palette key (e.g. "emerald"), not a hex value - the frontend's fixed color list
    (mirroring LEAD_STATUSES) is the source of truth for what it actually renders as."""

    name = models.CharField(max_length=60, unique=True)
    color = models.CharField(max_length=20, default="slate")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

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
    email = models.CharField(max_length=255, blank=True, default="")
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    reviews = models.PositiveIntegerField(null=True, blank=True)
    website = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    notes = models.TextField(blank=True, default="")
    next_follow_up_at = models.DateField(null=True, blank=True)
    tags = models.ManyToManyField(LeadTag, blank=True, related_name="leads")
    # Set only for a record that was backfilled from (or later matched to) an
    # already-registered shop account, instead of coming from the Google Maps
    # scraper - lets the one-time backfill command detect "already synced"
    # without having to parse the synthetic maps_url it assigns those rows.
    linked_user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="lead_detail"
    )
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


class AdminActivityLog(models.Model):
    """Audit trail for RepetiGo admin-dashboard actions - who did what to
    which object and when. Written by admin_activity.log_admin_activity(),
    called from every mutating admin_views.py endpoint. `target_type` +
    `target_id` are loose (no FK) on purpose: a single log format needs to
    reference shops, withdrawals, agents, contact messages, etc without a
    different column per type.
    """

    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="admin_activity_logs")
    action = models.CharField(max_length=80)
    target_type = models.CharField(max_length=40, blank=True, default="")
    target_id = models.CharField(max_length=40, blank=True, default="")
    detail = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["target_type", "target_id"]), models.Index(fields=["admin_user", "created_at"])]

    def __str__(self) -> str:
        return f"{self.action} by {self.admin_user_id} on {self.target_type}#{self.target_id}"


class AdminRole(models.Model):
    """Granular role for a platform-staff (is_staff=True) account. A staff
    user with NO row here defaults to super_admin (see
    admin_auth.get_admin_role) - existing staff accounts created before
    this model shipped keep full access rather than being locked out.
    """

    ROLE_SUPER_ADMIN = "super_admin"
    ROLE_FINANCE = "finance"
    ROLE_SUPPORT = "support"
    ROLE_SALES = "sales"

    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, "Super Admin"),
        (ROLE_FINANCE, "Finance"),
        (ROLE_SUPPORT, "Support"),
        (ROLE_SALES, "Sales"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_role")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_SUPER_ADMIN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.user_id}: {self.role}"


class ScrapeRun(models.Model):
    """One run of the Selenium Google-Maps extractor (see
    api.lead_scraper_runner) - tracks progress so the admin dashboard's
    "Run Extractor" button can poll status instead of blocking the HTTP
    request for however long Chrome+Selenium takes.
    """

    STATUS_RUNNING = "running"
    STATUS_COMPLETED = "completed"
    STATUS_FAILED = "failed"

    STATUS_CHOICES = [
        (STATUS_RUNNING, "Running"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_FAILED, "Failed"),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_RUNNING)
    started_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="scrape_runs")
    max_places = models.PositiveIntegerField(default=5)
    processed_count = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)
    log = models.TextField(blank=True, default="")
    error_message = models.TextField(blank=True, default="")
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"ScrapeRun #{self.id} ({self.status})"
