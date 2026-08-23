import csv
import secrets
import string
import threading
from decimal import Decimal
from datetime import datetime, timedelta

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, JsonResponse

from .admin_activity import log_admin_activity
from .admin_auth import get_admin_role, require_admin, require_section
from .lead_scraper_runner import run_scrape_job
from .models import AdminActivityLog, AdminRole, Agent, ContactMessage, GooglePlace, PrintOrder, ScrapeRun, ServicePricing, ShopProfile, ToolPricing, ToolVisibility, UserProfile, WalletSetting, WalletTransaction, WalletTopup, WithdrawalRequest
from .views import (
    create_password_reset,
    create_wallet_transaction,
    delete_user_files,
    ensure_service_pricing,
    issue_tokens,
    money,
    order_list_queryset,
    parse_body,
    public_order,
    public_pricing,
    public_shop,
    public_user,
    public_wallet_transaction,
    public_withdrawal,
    wallet_collection_summary,
)
from cafemitra_server.product_setting import active_payment_gateway

User = get_user_model()
MAX_PAGE_SIZE = 50


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_login(request):
    """Separate from /auth/login/ on purpose: a wrong/non-staff password here
    must never hand out a usable token, even though the same account can log
    into the cafe-owner side just fine with the same credentials.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))

    user = authenticate(username=email, password=password)
    if not user:
        return JsonResponse({"message": "Invalid email or password."}, status=401)
    if not user.is_staff:
        return JsonResponse({"message": "Not authorized for admin access."}, status=403)

    token = issue_tokens(user)
    return JsonResponse(
        {
            "token": token.key,
            "refreshToken": token.refresh_key,
            "accessTokenExpiresAt": token.access_expires_at.isoformat(),
            "refreshTokenExpiresAt": token.refresh_expires_at.isoformat(),
            "user": public_user(user),
        }
    )


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_me(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user, err = require_admin(request)
    if err:
        return err

    return JsonResponse({"user": public_user(user), "role": get_admin_role(user)})


def merged_activity_events(fetch_limit):
    """Orders/topups/withdrawals merged into one chronological feed - each
    source is fetched at `fetch_limit` size (cheap, indexed on created_at)
    and the merge+sort happens in Python since the three come from
    different tables (no single SQL query can page across them).
    """
    events = []

    for order in PrintOrder.objects.order_by("-created_at")[:fetch_limit]:
        events.append(
            {
                "type": "order",
                "id": order.id,
                "label": f"{order.service_name} - {order.shop_code}",
                "amount": float(order.total_amount),
                "status": order.status,
                "createdAt": order.created_at.isoformat(),
            }
        )

    for topup in WalletTopup.objects.filter(status=WalletTopup.STATUS_PAID).select_related("user").order_by("-created_at")[:fetch_limit]:
        events.append(
            {
                "type": "topup",
                "id": topup.id,
                "label": f"Top-up by {topup.user.email}",
                "amount": float(topup.amount),
                "status": topup.status,
                "createdAt": topup.created_at.isoformat(),
            }
        )

    for withdrawal in WithdrawalRequest.objects.select_related("user").order_by("-created_at")[:fetch_limit]:
        events.append(
            {
                "type": "withdrawal",
                "id": withdrawal.id,
                "label": f"Withdrawal by {withdrawal.user.email}",
                "amount": float(withdrawal.amount),
                "status": withdrawal.status,
                "createdAt": withdrawal.created_at.isoformat(),
            }
        )

    events.sort(key=lambda event: event["createdAt"], reverse=True)
    return events


def recent_activity_feed(limit=15):
    return merged_activity_events(limit)[:limit]


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_overview(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_admin(request)
    if err:
        return err

    now = timezone.now()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_week = now - timedelta(days=7)
    start_of_month = now - timedelta(days=30)

    # The "revenue" block is the only date-range-scoped part of this endpoint
    # - everything else (shop counts, pending withdrawals, stuck orders) is
    # current STATE, not historical activity, so it stays unscoped on
    # purpose: a defaulting shop's balance doesn't stop being negative just
    # because it happened outside the selected range.
    range_from = parse_date(request.GET.get("from", "").strip()) or (now - timedelta(days=30)).date()
    range_to = parse_date(request.GET.get("to", "").strip()) or now.date()

    # Everything below used to be 25+ separate .count()/.aggregate() calls
    # (each its own DB round-trip) - collapsed into one conditional-aggregate
    # query per table (Count/Sum with `filter=`) so a single Overview load
    # is ~8 queries instead of ~28. Same JSON shape out, just fewer trips in.
    shop_stats = User.objects.filter(is_staff=False, shop__isnull=False).aggregate(
        total=Count("id"),
        active=Count("id", filter=Q(is_active=True)),
        inactive=Count("id", filter=Q(is_active=False)),
        signups_today=Count("id", filter=Q(date_joined__gte=start_of_today)),
        signups_week=Count("id", filter=Q(date_joined__gte=start_of_week)),
        signups_month=Count("id", filter=Q(date_joined__gte=start_of_month)),
        signups_range=Count("id", filter=Q(date_joined__date__gte=range_from, date_joined__date__lte=range_to)),
    )

    order_stats = PrintOrder.objects.aggregate(
        today=Count("id", filter=Q(created_at__gte=start_of_today)),
        week=Count("id", filter=Q(created_at__gte=start_of_week)),
        stuck_awaiting_approval=Count(
            "id", filter=Q(status=PrintOrder.STATUS_AWAITING_APPROVAL, created_at__lte=now - timedelta(minutes=30))
        ),
        stuck_photo_jobs=Count(
            "id",
            filter=Q(
                photo_status__in=[PrintOrder.PHOTO_STATUS_PENDING, PrintOrder.PHOTO_STATUS_CLAIMED],
                created_at__lte=now - timedelta(seconds=60),
            ),
        ),
        range_count=Count("id", filter=Q(created_at__date__gte=range_from, created_at__date__lte=range_to)),
        range_value=Sum("total_amount", filter=Q(created_at__date__gte=range_from, created_at__date__lte=range_to)),
    )

    topup_stats = WalletTopup.objects.filter(status=WalletTopup.STATUS_PAID).aggregate(
        today_count=Count("id", filter=Q(paid_at__gte=start_of_today)),
        today_amount=Sum("amount", filter=Q(paid_at__gte=start_of_today)),
        range_count=Count("id", filter=Q(paid_at__date__gte=range_from, paid_at__date__lte=range_to)),
        range_amount=Sum("amount", filter=Q(paid_at__date__gte=range_from, paid_at__date__lte=range_to)),
    )

    withdrawal_stats = WithdrawalRequest.objects.filter(status=WithdrawalRequest.STATUS_PENDING).aggregate(
        count=Count("id"), amount=Sum("amount")
    )

    revenue_stats = WalletTransaction.objects.filter(
        created_at__date__gte=range_from, created_at__date__lte=range_to
    ).aggregate(
        platform_fee=Sum(
            "amount", filter=Q(kind=WalletTransaction.KIND_TOOL_USAGE, direction=WalletTransaction.DIRECTION_DEBIT)
        ),
        commissions=Sum(
            "amount",
            filter=Q(kind=WalletTransaction.KIND_REFERRAL_COMMISSION, direction=WalletTransaction.DIRECTION_CREDIT),
        ),
    )
    platform_fee_revenue = revenue_stats["platform_fee"] or Decimal("0.00")
    commissions_paid = revenue_stats["commissions"] or Decimal("0.00")

    agent_stats = Agent.objects.aggregate(
        active=Count("id", filter=Q(status=Agent.STATUS_ACTIVE)),
        pending=Count("id", filter=Q(status=Agent.STATUS_PENDING)),
    )

    gateway_name, _gateway_config = active_payment_gateway()

    return JsonResponse(
        {
            "shops": {
                "total": shop_stats["total"],
                "active": shop_stats["active"],
                "inactive": shop_stats["inactive"],
                "signupsToday": shop_stats["signups_today"],
                "signupsWeek": shop_stats["signups_week"],
                "signupsMonth": shop_stats["signups_month"],
            },
            "orders": {
                "today": order_stats["today"],
                "week": order_stats["week"],
                "stuckAwaitingApproval": order_stats["stuck_awaiting_approval"],
                "stuckPhotoJobs": order_stats["stuck_photo_jobs"],
            },
            "wallet": {
                "totalBalance": float(UserProfile.objects.aggregate(total=Sum("balance"))["total"] or 0),
                "topupsToday": topup_stats["today_count"],
                "topupsTodayAmount": float(topup_stats["today_amount"] or 0),
                "pendingWithdrawals": withdrawal_stats["count"] or 0,
                "pendingWithdrawalsAmount": float(withdrawal_stats["amount"] or 0),
            },
            "agents": {
                "active": agent_stats["active"],
                "pending": agent_stats["pending"],
            },
            "support": {
                "unreadMessages": ContactMessage.objects.filter(is_read=False).count(),
            },
            "activePaymentGateway": gateway_name,
            "recentActivity": recent_activity_feed(),
            "range": {"from": range_from.isoformat(), "to": range_to.isoformat()},
            "revenue": {
                "platformFeeRevenue": float(platform_fee_revenue),
                "commissionsPaid": float(commissions_paid),
                "netRevenue": float(platform_fee_revenue - commissions_paid),
                "ordersValue": float(order_stats["range_value"] or 0),
                "ordersCount": order_stats["range_count"],
                "newSignups": shop_stats["signups_range"],
                "topupsAmount": float(topup_stats["range_amount"] or 0),
                "topupsCount": topup_stats["range_count"],
            },
        }
    )


# Deep pagination on the merged activity feed only stays correct up to this
# many fetched-per-source rows (see merged_activity_events) - "recent
# activity" is a glance-feed, not a full audit trail (that's Activity Log),
# so paging past this cap is intentionally out of scope.
RECENT_ACTIVITY_FETCH_CAP = 200


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_recent_activity(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_admin(request)
    if err:
        return err

    try:
        page = max(1, int(request.GET.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = min(MAX_PAGE_SIZE, max(1, int(request.GET.get("pageSize", 15))))
    except (TypeError, ValueError):
        page_size = 15

    fetch_limit = min(RECENT_ACTIVITY_FETCH_CAP, page * page_size)
    events = merged_activity_events(fetch_limit)

    total_count = (
        PrintOrder.objects.count()
        + WalletTopup.objects.filter(status=WalletTopup.STATUS_PAID).count()
        + WithdrawalRequest.objects.count()
    )

    start = (page - 1) * page_size
    page_events = events[start : start + page_size]

    return JsonResponse({"count": total_count, "page": page, "pageSize": page_size, "events": page_events})


def shops_queryset():
    return User.objects.filter(is_staff=False, shop__isnull=False).select_related("profile", "shop", "shop__referred_by_agent")


def public_admin_shop(user):
    profile = getattr(user, "profile", None)
    shop = getattr(user, "shop", None)
    agent = getattr(shop, "referred_by_agent", None) if shop else None
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.get_full_name(),
        "phone": profile.phone if profile else "",
        "shopName": shop.shop_name if shop else "",
        "balance": float(profile.balance) if profile else 0,
        "creditLimitOverride": float(profile.credit_limit_override) if profile and profile.credit_limit_override is not None else None,
        "cashCounterPermitted": profile.cash_counter_permitted if profile else False,
        "isActive": user.is_active,
        "dateJoined": user.date_joined.isoformat(),
        "referredByAgent": {"id": agent.id, "referralCode": agent.referral_code} if agent else None,
    }


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_shops(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "shops")
    if err:
        return err

    shops = shops_queryset()

    search = request.GET.get("search", "").strip()
    if search:
        shops = shops.filter(
            Q(email__icontains=search)
            | Q(username__icontains=search)
            | Q(shop__shop_name__icontains=search)
            | Q(profile__phone__icontains=search)
        )

    balance_filter = request.GET.get("balanceFilter", "").strip()
    if balance_filter == "negative":
        shops = shops.filter(profile__balance__lt=0)

    cash_counter = request.GET.get("cashCounter", "").strip()
    if cash_counter == "true":
        shops = shops.filter(profile__cash_counter_permitted=True)
    elif cash_counter == "false":
        shops = shops.filter(profile__cash_counter_permitted=False)

    status = request.GET.get("status", "").strip()
    if status == "active":
        shops = shops.filter(is_active=True)
    elif status == "inactive":
        shops = shops.filter(is_active=False)

    try:
        page = max(1, int(request.GET.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = min(MAX_PAGE_SIZE, max(1, int(request.GET.get("pageSize", 20))))
    except (TypeError, ValueError):
        page_size = 20

    shops = shops.order_by("-date_joined")
    count = shops.count()
    start = (page - 1) * page_size
    page_items = shops[start : start + page_size]

    return JsonResponse(
        {
            "count": count,
            "page": page,
            "pageSize": page_size,
            "shops": [public_admin_shop(user) for user in page_items],
        }
    )


def get_shop_user(shop_id):
    return User.objects.filter(id=shop_id, is_staff=False, shop__isnull=False).select_related("profile", "shop", "shop__referred_by_agent").first()


@csrf_exempt
@require_http_methods(["GET", "PUT", "OPTIONS"])
def admin_shop_detail(request, shop_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    if request.method == "PUT":
        body = parse_body(request)
        profile, _ = UserProfile.objects.get_or_create(user=shop_user, defaults={"phone": ""})
        if "creditLimitOverride" in body:
            raw = body.get("creditLimitOverride")
            profile.credit_limit_override = money(raw) if raw not in (None, "") else None
        if "cashCounterPermitted" in body:
            profile.cash_counter_permitted = bool(body.get("cashCounterPermitted"))
        profile.save()
        log_admin_activity(
            admin_user,
            "shop.update_settings",
            "shop",
            shop_user.id,
            f"creditLimitOverride={profile.credit_limit_override}, cashCounterPermitted={profile.cash_counter_permitted}",
        )
        # get_shop_user() select_related() cached the pre-update profile onto
        # shop_user - swap in the just-saved instance so the response below
        # (built from shop_user.profile) reflects what was actually written,
        # not the stale snapshot from before this PUT.
        shop_user.profile = profile
    else:
        profile, _ = UserProfile.objects.get_or_create(user=shop_user, defaults={"phone": ""})

    ensure_service_pricing(shop_user)
    pricing = ServicePricing.objects.filter(user=shop_user)
    recent_orders = order_list_queryset(PrintOrder.objects.filter(user=shop_user).order_by("-created_at"))[:20]
    recent_transactions = WalletTransaction.objects.filter(user=shop_user).order_by("-created_at")[:20]

    return JsonResponse(
        {
            "shop": public_admin_shop(shop_user),
            "profile": public_shop(shop_user.shop),
            "pricing": [public_pricing(item) for item in pricing],
            "recentOrders": [public_order(order, include_media=False) for order in recent_orders],
            "walletSummary": {k: float(v) for k, v in wallet_collection_summary(shop_user).items()},
            "recentTransactions": [
                {
                    "id": txn.id,
                    "kind": txn.kind,
                    "direction": txn.direction,
                    "amount": float(txn.amount),
                    "balanceAfter": float(txn.balance_after) if txn.balance_after is not None else None,
                    "note": txn.note,
                    "createdAt": txn.created_at.isoformat(),
                }
                for txn in recent_transactions
            ],
        }
    )


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_adjust_balance(request, shop_id):
    """Manual wallet correction (refunds, goodwill credit, error fixes). Every
    call MUST carry a reason - it lands directly in the ledger note so a later
    audit can see why an admin moved money, not just that one did.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    body = parse_body(request)
    amount = money(body.get("amount"))
    reason = str(body.get("reason", "")).strip()

    if amount == 0:
        return JsonResponse({"message": "Enter a non-zero amount."}, status=400)
    if len(reason) < 5:
        return JsonResponse({"message": "Enter a reason (at least 5 characters) for this adjustment."}, status=400)

    direction = WalletTransaction.DIRECTION_CREDIT if amount > 0 else WalletTransaction.DIRECTION_DEBIT
    txn = create_wallet_transaction(
        shop_user,
        WalletTransaction.KIND_ADMIN_ADJUSTMENT,
        abs(amount),
        direction,
        True,
        note=f"Admin adjustment by {admin_user.email}: {reason}",
    )
    if not txn:
        return JsonResponse({"message": "Could not record the adjustment."}, status=400)

    log_admin_activity(admin_user, "shop.adjust_balance", "shop", shop_user.id, f"amount={amount}, reason={reason}")

    profile, _ = UserProfile.objects.get_or_create(user=shop_user, defaults={"phone": ""})
    return JsonResponse({"balance": float(profile.balance), "transactionId": txn.id}, status=201)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_set_active(request, shop_id, active):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    shop_user.is_active = active
    shop_user.save(update_fields=["is_active"])
    log_admin_activity(admin_user, "shop.reactivate" if active else "shop.suspend", "shop", shop_user.id)
    return JsonResponse({"id": shop_user.id, "isActive": shop_user.is_active})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_suspend(request, shop_id):
    return admin_shop_set_active(request, shop_id, False)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_reactivate(request, shop_id):
    return admin_shop_set_active(request, shop_id, True)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_delete(request, shop_id):
    """Permanently delete a shop account. Irreversible - the caller must echo
    the shop's own email back as confirmation, and the User row's CASCADE FKs
    take the profile, pricing, orders, wallet transactions, withdrawals and
    topups down with it. Recorded in the activity log with a snapshot of the
    shop's identity since the row itself won't exist to look up afterward.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    body = parse_body(request)
    confirm_email = str(body.get("confirmEmail", "")).strip().lower()
    if confirm_email != shop_user.email.strip().lower():
        return JsonResponse({"message": "Confirmation email does not match this shop's email."}, status=400)

    shop_name = shop_user.shop.shop_name if getattr(shop_user, "shop", None) else ""
    snapshot = f"email={shop_user.email}, shopName={shop_name}, balance={shop_user.profile.balance if hasattr(shop_user, 'profile') else ''}"

    with transaction.atomic():
        log_admin_activity(admin_user, "shop.delete", "shop", shop_user.id, snapshot)
        delete_user_files(shop_user)
        shop_user.delete()

    return JsonResponse({"deleted": True})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_shop_orders(request, shop_id):
    """Paginated, status/date-filterable order history for one shop - split
    out from admin_shop_detail's fixed 20-row recentOrders so the Orders tab
    can filter/page. Gated on the "shops" section (not "orders") so a finance
    or support admin browsing a shop's profile doesn't need separate
    "orders" access just to see that shop's own order history.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    orders = order_list_queryset(PrintOrder.objects.filter(user=shop_user)).order_by("-created_at")

    status = request.GET.get("status", "").strip()
    if status:
        orders = orders.filter(status=status)

    date_from = parse_date(request.GET.get("from", "").strip())
    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)
    date_to = parse_date(request.GET.get("to", "").strip())
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    page_items, meta = paginate(orders, request)
    return JsonResponse({**meta, "orders": [public_order(order, include_media=False) for order in page_items]})


# --- Phase 4: Orders monitoring (platform-wide) -----------------------------

def paginate(queryset, request, default_size=20):
    try:
        page = max(1, int(request.GET.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = min(MAX_PAGE_SIZE, max(1, int(request.GET.get("pageSize", default_size))))
    except (TypeError, ValueError):
        page_size = default_size
    count = queryset.count()
    start = (page - 1) * page_size
    return queryset[start : start + page_size], {"count": count, "page": page, "pageSize": page_size}


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_orders(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "orders")
    if err:
        return err

    orders = order_list_queryset(PrintOrder.objects.select_related("user", "user__shop")).order_by("-created_at")

    shop_id = request.GET.get("shop", "").strip()
    if shop_id:
        orders = orders.filter(user_id=shop_id)

    service = request.GET.get("service", "").strip()
    if service:
        orders = orders.filter(service_key=service)

    payment_mode = request.GET.get("paymentMode", "").strip()
    if payment_mode:
        orders = orders.filter(payment_mode=payment_mode)

    status = request.GET.get("status", "").strip()
    if status:
        orders = orders.filter(status=status)

    date_from = parse_date(request.GET.get("from", "").strip())
    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)
    date_to = parse_date(request.GET.get("to", "").strip())
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    page_items, meta = paginate(orders, request)

    def public_admin_order(order):
        payload = public_order(order, include_media=False)
        payload["shopId"] = order.user_id
        payload["shopName"] = order.user.shop.shop_name if hasattr(order.user, "shop") else ""
        payload["shopEmail"] = order.user.email
        return payload

    return JsonResponse({**meta, "orders": [public_admin_order(order) for order in page_items]})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_order_detail(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "orders")
    if err:
        return err

    order = PrintOrder.objects.select_related("user", "user__shop").filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    payload = public_order(order)
    payload["shopId"] = order.user_id
    payload["shopName"] = order.user.shop.shop_name if hasattr(order.user, "shop") else ""
    payload["shopEmail"] = order.user.email
    return JsonResponse({"order": payload})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_stuck_orders(request):
    """Proactive alert list: cash-counter orders sitting unapproved too long,
    and passport-photo AI jobs stuck pending/claimed - the same thresholds
    the Overview stuck-order tile counts against.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "orders")
    if err:
        return err

    now = timezone.now()
    awaiting_approval = order_list_queryset(PrintOrder.objects.select_related("user", "user__shop")).filter(
        status=PrintOrder.STATUS_AWAITING_APPROVAL,
        created_at__lte=now - timedelta(minutes=30),
    ).order_by("created_at")
    # A cash-counter order sitting at STATUS_AWAITING_APPROVAL is correctly
    # waiting on the shop owner (already surfaced by the `awaiting_approval`
    # alert above), not actually stuck - excluded here so this alert doesn't
    # cry wolf for however long that approval legitimately takes.
    stuck_photo = order_list_queryset(PrintOrder.objects.select_related("user", "user__shop")).filter(
        photo_status__in=[PrintOrder.PHOTO_STATUS_PENDING, PrintOrder.PHOTO_STATUS_CLAIMED],
        created_at__lte=now - timedelta(seconds=60),
    ).exclude(status=PrintOrder.STATUS_AWAITING_APPROVAL).order_by("created_at")

    def summarize(order):
        return {
            "id": order.id,
            "orderNumber": f"{order.shop_code}-{order.id:05d}",
            "shopId": order.user_id,
            "shopName": order.user.shop.shop_name if hasattr(order.user, "shop") else "",
            "serviceName": order.service_name,
            "status": order.status,
            "photoStatus": order.photo_status,
            "createdAt": order.created_at.isoformat(),
        }

    return JsonResponse(
        {
            "awaitingApproval": [summarize(order) for order in awaiting_approval[:50]],
            "stuckPhotoJobs": [summarize(order) for order in stuck_photo[:50]],
        }
    )


# --- Phase 5: Wallet & Finance ----------------------------------------------

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_ledger(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    ledger = WalletTransaction.objects.select_related("user", "user__shop").order_by("-created_at")

    shop_id = request.GET.get("shop", "").strip()
    if shop_id:
        ledger = ledger.filter(user_id=shop_id)

    kind = request.GET.get("type", "").strip()
    if kind:
        ledger = ledger.filter(kind=kind)

    date_from = parse_date(request.GET.get("from", "").strip())
    if date_from:
        ledger = ledger.filter(created_at__date__gte=date_from)
    date_to = parse_date(request.GET.get("to", "").strip())
    if date_to:
        ledger = ledger.filter(created_at__date__lte=date_to)

    page_items, meta = paginate(ledger, request)

    def public_admin_txn(txn):
        payload = public_wallet_transaction(txn)
        payload["shopId"] = txn.user_id
        payload["shopName"] = txn.user.shop.shop_name if hasattr(txn.user, "shop") else ""
        payload["shopEmail"] = txn.user.email
        return payload

    return JsonResponse({**meta, "transactions": [public_admin_txn(txn) for txn in page_items]})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_ledger_summary(request):
    """Lifetime credit/debit totals + current balance for one shop, used to
    sanity-check a withdrawal request against the shop's actual wallet
    history without the admin having to page through the full ledger."""
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    shop_id = request.GET.get("shop", "").strip()
    if not shop_id:
        return JsonResponse({"message": "shop is required."}, status=400)

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    totals = WalletTransaction.objects.filter(user_id=shop_id, affects_balance=True).aggregate(
        totalCredit=Sum("amount", filter=Q(direction=WalletTransaction.DIRECTION_CREDIT)),
        totalDebit=Sum("amount", filter=Q(direction=WalletTransaction.DIRECTION_DEBIT)),
        # What RepetiGo itself earned from this shop's tool usage - the same
        # metric admin_wallet_earnings_summary uses platform-wide, scoped to
        # one shop so "profit from this shop" has a concrete number.
        platformRevenue=Sum(
            "amount",
            filter=Q(kind=WalletTransaction.KIND_TOOL_USAGE, direction=WalletTransaction.DIRECTION_DEBIT),
        ),
    )

    profile = getattr(shop_user, "profile", None)

    return JsonResponse(
        {
            "shopId": int(shop_id),
            "currentBalance": float(profile.balance) if profile else 0,
            "totalCredit": float(totals["totalCredit"] or 0),
            "totalDebit": float(totals["totalDebit"] or 0),
            "platformRevenue": float(totals["platformRevenue"] or 0),
        }
    )


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_topups(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    topups = WalletTopup.objects.select_related("user", "user__shop").order_by("-created_at")

    gateway = request.GET.get("gateway", "").strip()
    if gateway:
        topups = topups.filter(payment_gateway=gateway)

    status = request.GET.get("status", "").strip()
    if status:
        topups = topups.filter(status=status)

    page_items, meta = paginate(topups, request)

    return JsonResponse(
        {
            **meta,
            "topups": [
                {
                    "id": topup.id,
                    "shopId": topup.user_id,
                    "shopName": topup.user.shop.shop_name if hasattr(topup.user, "shop") else "",
                    "shopEmail": topup.user.email,
                    "amount": float(topup.amount),
                    "paymentGateway": topup.payment_gateway,
                    "status": topup.status,
                    "createdAt": topup.created_at.isoformat(),
                    "paidAt": topup.paid_at.isoformat() if topup.paid_at else None,
                }
                for topup in page_items
            ],
        }
    )


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_withdrawals(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    withdrawals = WithdrawalRequest.objects.select_related("user", "user__shop").order_by("-created_at")

    status = request.GET.get("status", "").strip()
    if status:
        withdrawals = withdrawals.filter(status=status)

    email = request.GET.get("email", "").strip()
    if email:
        withdrawals = withdrawals.filter(user__email__icontains=email)

    page_items, meta = paginate(withdrawals, request)

    def public_admin_withdrawal(withdrawal):
        payload = public_withdrawal(withdrawal)
        payload["shopId"] = withdrawal.user_id
        payload["shopName"] = withdrawal.user.shop.shop_name if hasattr(withdrawal.user, "shop") else ""
        payload["shopEmail"] = withdrawal.user.email
        # There's no direct FK from WithdrawalRequest to the WalletTransaction
        # request_withdrawal() creates for it, so match on user+kind+amount at
        # or after the request's timestamp. This gives balance_after AT THE
        # MOMENT the withdrawal was requested - unlike the shop's *current*
        # balance, it isn't skewed by tool-usage debits that happened later.
        debit_txn = (
            WalletTransaction.objects.filter(
                user_id=withdrawal.user_id,
                kind=WalletTransaction.KIND_WITHDRAWAL,
                amount=withdrawal.amount,
                created_at__gte=withdrawal.created_at,
            )
            .order_by("created_at")
            .first()
        )
        payload["balanceAfterRequest"] = float(debit_txn.balance_after) if debit_txn and debit_txn.balance_after is not None else None
        return payload

    return JsonResponse({**meta, "withdrawals": [public_admin_withdrawal(w) for w in page_items]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_withdrawal_approve(request, withdrawal_id):
    """Marks a withdrawal as paid. The wallet was already debited when the
    shop requested it (see request_withdrawal in views.py) - approval here
    just records that the admin has actually sent the money externally
    (UPI/bank transfer), it doesn't move any more wallet balance.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "wallet")
    if err:
        return err

    with transaction.atomic():
        withdrawal = WithdrawalRequest.objects.select_for_update().filter(id=withdrawal_id).first()
        if not withdrawal:
            return JsonResponse({"message": "Withdrawal not found."}, status=404)
        if withdrawal.status != WithdrawalRequest.STATUS_PENDING:
            return JsonResponse({"message": "This withdrawal has already been processed."}, status=409)

        withdrawal.status = WithdrawalRequest.STATUS_PAID
        withdrawal.save(update_fields=["status", "updated_at"])
        log_admin_activity(admin_user, "withdrawal.approve", "withdrawal", withdrawal.id, f"amount={withdrawal.amount}, shop={withdrawal.user_id}")

    return JsonResponse({"withdrawal": public_withdrawal(withdrawal)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_withdrawal_reject(request, withdrawal_id):
    """Rejects a withdrawal AND reverses the debit that request_withdrawal
    applied up front - otherwise the shop's money would just vanish (debited
    on request, never paid out, never returned).
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "wallet")
    if err:
        return err

    body = parse_body(request)
    reason = str(body.get("reason", "")).strip()

    with transaction.atomic():
        withdrawal = WithdrawalRequest.objects.select_for_update().filter(id=withdrawal_id).first()
        if not withdrawal:
            return JsonResponse({"message": "Withdrawal not found."}, status=404)
        if withdrawal.status != WithdrawalRequest.STATUS_PENDING:
            return JsonResponse({"message": "This withdrawal has already been processed."}, status=409)

        withdrawal.status = WithdrawalRequest.STATUS_REJECTED
        withdrawal.save(update_fields=["status", "updated_at"])

        note = f"Withdrawal request #{withdrawal.id} rejected by {admin_user.email}."
        if reason:
            note += f" Reason: {reason}"
        create_wallet_transaction(
            withdrawal.user,
            WalletTransaction.KIND_WITHDRAWAL_REVERSAL,
            withdrawal.amount,
            WalletTransaction.DIRECTION_CREDIT,
            True,
            note=note,
        )
        log_admin_activity(admin_user, "withdrawal.reject", "withdrawal", withdrawal.id, f"amount={withdrawal.amount}, shop={withdrawal.user_id}, reason={reason}")

    return JsonResponse({"withdrawal": public_withdrawal(withdrawal)})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_settings(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    settings_qs = WalletSetting.objects.order_by("key")
    return JsonResponse(
        {
            "settings": [
                {
                    "key": s.key,
                    "label": s.label,
                    "value": float(s.value),
                    "description": s.description,
                    "isActive": s.is_active,
                    "updatedAt": s.updated_at.isoformat(),
                }
                for s in settings_qs
            ]
        }
    )


@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def admin_wallet_setting_detail(request, key):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "wallet")
    if err:
        return err

    setting = WalletSetting.objects.filter(key=key).first()
    if not setting:
        return JsonResponse({"message": "Setting not found."}, status=404)

    body = parse_body(request)
    if "value" in body:
        setting.value = money(body.get("value"))
    if "isActive" in body:
        setting.is_active = bool(body.get("isActive"))
    setting.save()
    log_admin_activity(admin_user, "wallet_setting.update", "wallet_setting", key, f"value={setting.value}, isActive={setting.is_active}")

    return JsonResponse(
        {
            "key": setting.key,
            "label": setting.label,
            "value": float(setting.value),
            "description": setting.description,
            "isActive": setting.is_active,
            "updatedAt": setting.updated_at.isoformat(),
        }
    )


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_tool_pricing(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    pricing_qs = ToolPricing.objects.order_by("tool_key")
    return JsonResponse(
        {
            "pricing": [
                {
                    "toolKey": p.tool_key,
                    "label": p.label,
                    "unit": p.unit,
                    "price": float(p.price),
                    "priceB2b": float(p.price_b2b) if p.price_b2b is not None else None,
                    "priceB2c": float(p.price_b2c) if p.price_b2c is not None else None,
                    "isBillable": p.is_billable,
                    "updatedAt": p.updated_at.isoformat(),
                }
                for p in pricing_qs
            ]
        }
    )


@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def admin_tool_pricing_detail(request, tool_key):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "wallet")
    if err:
        return err

    pricing = ToolPricing.objects.filter(tool_key=tool_key).first()
    if not pricing:
        return JsonResponse({"message": "Tool pricing not found."}, status=404)

    body = parse_body(request)
    if "price" in body:
        pricing.price = money(body.get("price"))
    if "priceB2b" in body:
        raw = body.get("priceB2b")
        pricing.price_b2b = money(raw) if raw not in (None, "") else None
    if "priceB2c" in body:
        raw = body.get("priceB2c")
        pricing.price_b2c = money(raw) if raw not in (None, "") else None
    if "isBillable" in body:
        pricing.is_billable = bool(body.get("isBillable"))
    pricing.save()
    log_admin_activity(admin_user, "tool_pricing.update", "tool_pricing", tool_key, f"price={pricing.price}, isBillable={pricing.is_billable}")

    return JsonResponse(
        {
            "toolKey": pricing.tool_key,
            "label": pricing.label,
            "unit": pricing.unit,
            "price": float(pricing.price),
            "priceB2b": float(pricing.price_b2b) if pricing.price_b2b is not None else None,
            "priceB2c": float(pricing.price_b2c) if pricing.price_b2c is not None else None,
            "isBillable": pricing.is_billable,
            "updatedAt": pricing.updated_at.isoformat(),
        }
    )


def public_tool_visibility(item):
    return {"toolKey": item.tool_key, "label": item.label, "isEnabled": item.is_enabled, "updatedAt": item.updated_at.isoformat()}


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_tool_visibility(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    return JsonResponse({"tools": [public_tool_visibility(item) for item in ToolVisibility.objects.all()]})


@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def admin_tool_visibility_detail(request, tool_key):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "wallet")
    if err:
        return err

    item = ToolVisibility.objects.filter(tool_key=tool_key).first()
    if not item:
        return JsonResponse({"message": "Tool not found."}, status=404)

    body = parse_body(request)
    if "isEnabled" in body:
        item.is_enabled = bool(body.get("isEnabled"))
    item.save()
    log_admin_activity(admin_user, "tool_visibility.update", "tool_visibility", tool_key, f"isEnabled={item.is_enabled}")

    return JsonResponse(public_tool_visibility(item))


# --- Phase 6: Referral Agent / Partner Program -------------------------------

def generate_referral_code():
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "RG-" + "".join(secrets.choice(alphabet) for _ in range(6))
        if not Agent.objects.filter(referral_code=code).exists():
            return code
    raise RuntimeError("Could not generate a unique referral code.")


def public_admin_agent(agent):
    commission_total = (
        WalletTransaction.objects.filter(user=agent.user, kind=WalletTransaction.KIND_REFERRAL_COMMISSION)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )
    profile = getattr(agent.user, "profile", None)
    return {
        "id": agent.id,
        "referralCode": agent.referral_code,
        "userId": agent.user_id,
        "email": agent.user.email,
        "fullName": agent.user.get_full_name(),
        "commissionType": agent.commission_type,
        "commissionRate": float(agent.commission_rate),
        "status": agent.status,
        "specialOfferNote": agent.special_offer_note,
        "referredShopsCount": ShopProfile.objects.filter(referred_by_agent=agent).count(),
        "totalCommissionEarned": float(commission_total),
        "currentBalance": float(profile.balance) if profile else 0,
        "createdAt": agent.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_agents(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "agents")
    if err:
        return err

    if request.method == "POST":
        body = parse_body(request)
        email = str(body.get("email", "")).strip().lower()
        commission_type = str(body.get("commissionType", Agent.COMMISSION_PERCENTAGE)).strip()
        commission_rate = money(body.get("commissionRate", 0))

        if not email:
            return JsonResponse({"message": "Enter the email of the account to onboard as an agent."}, status=400)
        target_user = User.objects.filter(username=email).first()
        if not target_user:
            return JsonResponse({"message": "No account found with that email. The agent must already have a RepetiGo account."}, status=404)
        if commission_type not in {Agent.COMMISSION_PERCENTAGE, Agent.COMMISSION_FIXED}:
            return JsonResponse({"message": "commissionType must be 'percentage' or 'fixed'."}, status=400)
        if Agent.objects.filter(user=target_user, status__in=[Agent.STATUS_PENDING, Agent.STATUS_ACTIVE]).exists():
            return JsonResponse({"message": "This account is already an agent."}, status=409)

        agent = Agent.objects.create(
            user=target_user,
            referral_code=generate_referral_code(),
            commission_type=commission_type,
            commission_rate=commission_rate,
            status=Agent.STATUS_PENDING,
        )
        log_admin_activity(admin_user, "agent.onboard", "agent", agent.id, f"email={email}, commissionType={commission_type}, commissionRate={commission_rate}")
        return JsonResponse({"agent": public_admin_agent(agent)}, status=201)

    agents = Agent.objects.select_related("user", "user__profile").order_by("-created_at")
    status = request.GET.get("status", "").strip()
    if status:
        agents = agents.filter(status=status)

    return JsonResponse({"count": agents.count(), "agents": [public_admin_agent(agent) for agent in agents]})


@csrf_exempt
@require_http_methods(["GET", "PUT", "OPTIONS"])
def admin_agent_detail(request, agent_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "agents")
    if err:
        return err

    agent = Agent.objects.select_related("user", "user__profile").filter(id=agent_id).first()
    if not agent:
        return JsonResponse({"message": "Agent not found."}, status=404)

    if request.method == "PUT":
        body = parse_body(request)
        if "commissionType" in body:
            value = str(body.get("commissionType", "")).strip()
            if value not in {Agent.COMMISSION_PERCENTAGE, Agent.COMMISSION_FIXED}:
                return JsonResponse({"message": "commissionType must be 'percentage' or 'fixed'."}, status=400)
            agent.commission_type = value
        if "commissionRate" in body:
            agent.commission_rate = money(body.get("commissionRate"))
        if "status" in body:
            value = str(body.get("status", "")).strip()
            if value not in {Agent.STATUS_PENDING, Agent.STATUS_ACTIVE, Agent.STATUS_SUSPENDED}:
                return JsonResponse({"message": "status must be 'pending', 'active', or 'suspended'."}, status=400)
            agent.status = value
        if "specialOfferNote" in body:
            agent.special_offer_note = str(body.get("specialOfferNote", ""))
        agent.save()
        log_admin_activity(
            admin_user, "agent.update", "agent", agent.id,
            f"commissionType={agent.commission_type}, commissionRate={agent.commission_rate}, status={agent.status}",
        )

    referred_shops = ShopProfile.objects.filter(referred_by_agent=agent).select_related("user")
    commission_ledger = WalletTransaction.objects.filter(user=agent.user, kind=WalletTransaction.KIND_REFERRAL_COMMISSION).order_by("-created_at")[:30]

    return JsonResponse(
        {
            "agent": public_admin_agent(agent),
            "referredShops": [
                {"id": shop.user_id, "shopName": shop.shop_name, "email": shop.user.email}
                for shop in referred_shops
            ],
            "commissionLedger": [public_wallet_transaction(txn) for txn in commission_ledger],
        }
    )


# --- Phase 7: Support Inbox (Contact-Us) -------------------------------------

def public_admin_contact_message(message):
    return {
        "id": message.id,
        "fullName": message.full_name,
        "email": message.email,
        "phone": message.phone,
        "subject": message.subject,
        "message": message.message,
        "isRead": message.is_read,
        "adminNote": message.admin_note,
        "createdAt": message.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_contact_messages(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "support")
    if err:
        return err

    messages = ContactMessage.objects.order_by("-created_at")
    status = request.GET.get("status", "").strip()
    if status == "unread":
        messages = messages.filter(is_read=False)
    elif status == "resolved":
        messages = messages.filter(is_read=True)

    page_items, meta = paginate(messages, request, default_size=25)
    return JsonResponse({**meta, "messages": [public_admin_contact_message(m) for m in page_items]})


@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def admin_contact_message_detail(request, message_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "support")
    if err:
        return err

    message = ContactMessage.objects.filter(id=message_id).first()
    if not message:
        return JsonResponse({"message": "Contact message not found."}, status=404)

    body = parse_body(request)
    if "isRead" in body:
        message.is_read = bool(body.get("isRead"))
    if "adminNote" in body:
        message.admin_note = str(body.get("adminNote", ""))
    message.save()
    log_admin_activity(admin_user, "contact_message.update", "contact_message", message.id, f"isRead={message.is_read}")

    return JsonResponse({"contactMessage": public_admin_contact_message(message)})


# --- Phase 9: Desktop Print Agent monitoring ---------------------------------

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_print_agent_stats(request):
    """No version-per-shop signal exists yet - the desktop agent doesn't
    report its version anywhere today (see PRINT_AGENT_PYTHON_ROADMAP.md /
    API_DOCUMENTATION.md agent/version-check, which only serves the LATEST
    version, it doesn't receive the caller's). last-seen is derived from the
    job-poll stamp added in views.agent_jobs; version distribution is left
    out until the agent itself is updated to report one.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "print_agent")
    if err:
        return err

    now = timezone.now()
    online_cutoff = now - timedelta(minutes=5)

    shops = shops_queryset().filter(profile__agent_last_seen_at__isnull=False).order_by("-profile__agent_last_seen_at")

    recent_failed = PrintOrder.objects.select_related("user", "user__shop").filter(
        status=PrintOrder.STATUS_FAILED,
        created_at__gte=now - timedelta(days=7),
    ).order_by("-created_at")[:30]

    return JsonResponse(
        {
            "onlineCount": shops.filter(profile__agent_last_seen_at__gte=online_cutoff).count(),
            "shops": [
                {
                    "id": shop.id,
                    "shopName": shop.shop.shop_name if hasattr(shop, "shop") else "",
                    "email": shop.email,
                    "lastSeenAt": shop.profile.agent_last_seen_at.isoformat() if shop.profile.agent_last_seen_at else None,
                    "online": shop.profile.agent_last_seen_at is not None and shop.profile.agent_last_seen_at >= online_cutoff,
                }
                for shop in shops[:100]
            ],
            "recentFailedJobs": [
                {
                    "id": order.id,
                    "orderNumber": f"{order.shop_code}-{order.id:05d}",
                    "shopName": order.user.shop.shop_name if hasattr(order.user, "shop") else "",
                    "serviceName": order.service_name,
                    "agentMessage": order.agent_message,
                    "createdAt": order.created_at.isoformat(),
                }
                for order in recent_failed
            ],
        }
    )


# --- Phase 11: Reporting (CSV export) ----------------------------------------

EXPORT_ROW_CAP = 5000


def csv_response(filename, header, rows):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(header)
    writer.writerows(rows)
    return response


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_ledger_export(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    ledger = WalletTransaction.objects.select_related("user", "user__shop").order_by("-created_at")

    shop_id = request.GET.get("shop", "").strip()
    if shop_id:
        ledger = ledger.filter(user_id=shop_id)
    kind = request.GET.get("type", "").strip()
    if kind:
        ledger = ledger.filter(kind=kind)
    date_from = parse_date(request.GET.get("from", "").strip())
    if date_from:
        ledger = ledger.filter(created_at__date__gte=date_from)
    date_to = parse_date(request.GET.get("to", "").strip())
    if date_to:
        ledger = ledger.filter(created_at__date__lte=date_to)

    rows = (
        [
            txn.created_at.isoformat(),
            txn.user.shop.shop_name if hasattr(txn.user, "shop") else "",
            txn.user.email,
            txn.kind,
            txn.direction,
            str(txn.amount),
            str(txn.balance_after) if txn.balance_after is not None else "",
            txn.note,
        ]
        for txn in ledger[:EXPORT_ROW_CAP]
    )
    return csv_response(
        "wallet-ledger.csv",
        ["Date", "Shop", "Email", "Kind", "Direction", "Amount", "Balance After", "Note"],
        rows,
    )


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_orders_export(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "orders")
    if err:
        return err

    orders = order_list_queryset(PrintOrder.objects.select_related("user", "user__shop")).order_by("-created_at")

    shop_id = request.GET.get("shop", "").strip()
    if shop_id:
        orders = orders.filter(user_id=shop_id)
    service = request.GET.get("service", "").strip()
    if service:
        orders = orders.filter(service_key=service)
    payment_mode = request.GET.get("paymentMode", "").strip()
    if payment_mode:
        orders = orders.filter(payment_mode=payment_mode)
    status = request.GET.get("status", "").strip()
    if status:
        orders = orders.filter(status=status)
    date_from = parse_date(request.GET.get("from", "").strip())
    if date_from:
        orders = orders.filter(created_at__date__gte=date_from)
    date_to = parse_date(request.GET.get("to", "").strip())
    if date_to:
        orders = orders.filter(created_at__date__lte=date_to)

    rows = (
        [
            order.created_at.isoformat(),
            f"{order.shop_code}-{order.id:05d}",
            order.user.shop.shop_name if hasattr(order.user, "shop") else "",
            order.user.email,
            order.service_name,
            str(order.total_amount),
            order.payment_mode,
            order.payment_status,
            order.status,
        ]
        for order in orders[:EXPORT_ROW_CAP]
    )
    return csv_response(
        "orders.csv",
        ["Date", "Order", "Shop", "Email", "Service", "Amount", "Payment Mode", "Payment Status", "Status"],
        rows,
    )


# --- V2-A: Notification badges -----------------------------------------------

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_notifications(request):
    """Cheap, poll-friendly counts for the sidebar badges - deliberately
    smaller than admin_overview() (no recent-activity feed, no per-shop
    aggregates) since the frontend hits this every ~30s.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_admin(request)
    if err:
        return err

    now = timezone.now()
    order_stats = PrintOrder.objects.aggregate(
        stuck_awaiting_approval=Count(
            "id", filter=Q(status=PrintOrder.STATUS_AWAITING_APPROVAL, created_at__lte=now - timedelta(minutes=30))
        ),
        stuck_photo_jobs=Count(
            "id",
            filter=Q(
                photo_status__in=[PrintOrder.PHOTO_STATUS_PENDING, PrintOrder.PHOTO_STATUS_CLAIMED],
                created_at__lte=now - timedelta(seconds=60),
            ),
        ),
    )
    stuck_orders = order_stats["stuck_awaiting_approval"] + order_stats["stuck_photo_jobs"]

    return JsonResponse(
        {
            "pendingWithdrawals": WithdrawalRequest.objects.filter(status=WithdrawalRequest.STATUS_PENDING).count(),
            "unreadMessages": ContactMessage.objects.filter(is_read=False).count(),
            "pendingAgents": Agent.objects.filter(status=Agent.STATUS_PENDING).count(),
            "stuckOrders": stuck_orders,
        }
    )


# --- V2-B: Signup / growth analytics -----------------------------------------

TRUNC_BY_GRANULARITY = {"day": TruncDate, "week": TruncWeek, "month": TruncMonth}


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_signup_analytics(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "analytics")
    if err:
        return err

    granularity = request.GET.get("granularity", "day").strip()
    trunc_fn = TRUNC_BY_GRANULARITY.get(granularity)
    if not trunc_fn:
        return JsonResponse({"message": "granularity must be day, week, or month."}, status=400)

    now = timezone.now()
    date_from = parse_date(request.GET.get("from", "").strip()) or (now - timedelta(days=30)).date()
    date_to = parse_date(request.GET.get("to", "").strip()) or now.date()

    shops = shops_queryset().filter(date_joined__date__gte=date_from, date_joined__date__lte=date_to)

    series = (
        shops.annotate(bucket=trunc_fn("date_joined"))
        .values("bucket")
        .annotate(count=Count("id"))
        .order_by("bucket")
    )

    referral_breakdown = (
        shops.values("shop__referred_by_agent__referral_code")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return JsonResponse(
        {
            "from": date_from.isoformat(),
            "to": date_to.isoformat(),
            "granularity": granularity,
            "totalSignups": shops.count(),
            "series": [{"date": row["bucket"].isoformat(), "count": row["count"]} for row in series],
            "byReferralAgent": [
                {"referralCode": row["shop__referred_by_agent__referral_code"] or "Direct (no agent)", "count": row["count"]}
                for row in referral_breakdown
            ],
        }
    )


# --- V2-C: Admin activity log -------------------------------------------

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_activity_log(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "activity_log")
    if err:
        return err

    logs = AdminActivityLog.objects.select_related("admin_user").order_by("-created_at")

    target_type = request.GET.get("targetType", "").strip()
    if target_type:
        logs = logs.filter(target_type=target_type)
    target_id = request.GET.get("targetId", "").strip()
    if target_id:
        # Matches an exact target OR a bulk-action log that included this
        # target among a comma-separated list of ids (see
        # admin_shops_bulk_set_active) - so a shop's timeline still shows up
        # for a bulk suspend/reactivate it was part of.
        logs = logs.filter(Q(target_id=target_id) | Q(target_id__regex=rf"(^|,){target_id}(,|$)"))
    action = request.GET.get("action", "").strip()
    if action:
        logs = logs.filter(action=action)

    page_items, meta = paginate(logs, request, default_size=50)
    return JsonResponse(
        {
            **meta,
            "logs": [
                {
                    "id": log.id,
                    "adminEmail": log.admin_user.email if log.admin_user else "(deleted admin)",
                    "action": log.action,
                    "targetType": log.target_type,
                    "targetId": log.target_id,
                    "detail": log.detail,
                    "createdAt": log.created_at.isoformat(),
                }
                for log in page_items
            ],
        }
    )


# --- V2-D: Admin-triggered password reset + impersonate ---------------------

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_send_password_reset(request, shop_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    try:
        create_password_reset(shop_user)
    except Exception:
        return JsonResponse({"message": "Could not send reset email. Try again later."}, status=500)

    log_admin_activity(admin_user, "shop.send_password_reset", "shop", shop_user.id, f"email={shop_user.email}")
    return JsonResponse({"message": "Password reset email sent."})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shop_impersonate(request, shop_id):
    """Issues a fresh token pair for the shop's OWN account so an admin can
    open the cafe-owner dashboard as that shop (support/debugging). This is
    one of the most sensitive actions in the whole admin panel - it hands out
    a usable session for someone else's account - so every call is logged
    with both the admin's and the shop's identity, unconditionally, before
    the token is even returned.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    shop_user = get_shop_user(shop_id)
    if not shop_user:
        return JsonResponse({"message": "Shop not found."}, status=404)

    token = issue_tokens(shop_user)
    log_admin_activity(
        admin_user,
        "shop.impersonate",
        "shop",
        shop_user.id,
        f"admin={admin_user.email} started an impersonated session for shop={shop_user.email}",
    )

    return JsonResponse(
        {
            "token": token.key,
            "refreshToken": token.refresh_key,
            "accessTokenExpiresAt": token.access_expires_at.isoformat(),
            "refreshTokenExpiresAt": token.refresh_expires_at.isoformat(),
            "user": public_user(shop_user),
            "shop": public_shop(shop_user.shop) if hasattr(shop_user, "shop") else {},
        }
    )


# --- V2-E: Bulk shop actions --------------------------------------------

@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shops_bulk_set_active(request, active):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "shops")
    if err:
        return err

    body = parse_body(request)
    shop_ids = body.get("shopIds")
    if not isinstance(shop_ids, list) or not shop_ids:
        return JsonResponse({"message": "Provide shopIds as a non-empty array."}, status=400)

    updated = list(shops_queryset().filter(id__in=shop_ids).values_list("id", flat=True))
    User.objects.filter(id__in=updated).update(is_active=active)
    log_admin_activity(
        admin_user,
        "shop.bulk_reactivate" if active else "shop.bulk_suspend",
        "shop",
        ",".join(str(i) for i in updated),
        f"{len(updated)} shop(s)",
    )

    return JsonResponse({"updated": updated, "isActive": active})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shops_bulk_suspend(request):
    return admin_shops_bulk_set_active(request, False)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_shops_bulk_reactivate(request):
    return admin_shops_bulk_set_active(request, True)


# --- V2-G: Staff / role management (super_admin only) ------------------

def require_super_admin(request):
    user, err = require_admin(request)
    if err:
        return None, err
    if get_admin_role(user) != AdminRole.ROLE_SUPER_ADMIN:
        return None, JsonResponse({"message": "Only super admins can manage staff roles."}, status=403)
    return user, None


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def admin_staff(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_super_admin(request)
    if err:
        return err

    if request.method == "POST":
        body = parse_body(request)
        email = str(body.get("email", "")).strip().lower()
        role = str(body.get("role", AdminRole.ROLE_SUPPORT)).strip()
        valid_roles = {choice for choice, _ in AdminRole.ROLE_CHOICES}
        if not email:
            return JsonResponse({"message": "Enter the email of an existing RepetiGo account."}, status=400)
        if role not in valid_roles:
            return JsonResponse({"message": f"role must be one of {sorted(valid_roles)}."}, status=400)

        target_user = User.objects.filter(username=email).first()
        if not target_user:
            return JsonResponse(
                {"message": "No RepetiGo account found with that email. They need to register (or verify their email) first."},
                status=404,
            )
        if target_user.is_staff:
            return JsonResponse({"message": "This account is already staff."}, status=409)

        target_user.is_staff = True
        target_user.save(update_fields=["is_staff"])
        AdminRole.objects.update_or_create(user=target_user, defaults={"role": role})
        log_admin_activity(admin_user, "staff.add", "staff", target_user.id, f"email={email}, role={role}")

        return JsonResponse(
            {"id": target_user.id, "email": target_user.email, "fullName": target_user.get_full_name(), "role": role, "isActive": target_user.is_active},
            status=201,
        )

    staff = User.objects.filter(is_staff=True).select_related("admin_role").order_by("email")
    return JsonResponse(
        {
            "staff": [
                {
                    "id": member.id,
                    "email": member.email,
                    "fullName": member.get_full_name(),
                    "role": get_admin_role(member),
                    "isActive": member.is_active,
                }
                for member in staff
            ]
        }
    )


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_staff_revoke(request, staff_id):
    """Demotes a staff account back to a regular account (is_staff=False).
    Kept as its own POST action (not DELETE-the-user) - revoking admin
    access should never delete the underlying RepetiGo/shop account.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_super_admin(request)
    if err:
        return err

    staff_user = User.objects.filter(id=staff_id, is_staff=True).first()
    if not staff_user:
        return JsonResponse({"message": "Staff account not found."}, status=404)
    if staff_user.id == admin_user.id:
        return JsonResponse({"message": "You cannot revoke your own staff access."}, status=400)

    staff_user.is_staff = False
    staff_user.save(update_fields=["is_staff"])
    log_admin_activity(admin_user, "staff.revoke", "staff", staff_user.id, f"email={staff_user.email}")

    return JsonResponse({"id": staff_user.id, "email": staff_user.email, "isStaff": False})


@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def admin_staff_set_role(request, staff_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_super_admin(request)
    if err:
        return err

    staff_user = User.objects.filter(id=staff_id, is_staff=True).first()
    if not staff_user:
        return JsonResponse({"message": "Staff account not found."}, status=404)

    body = parse_body(request)
    role = str(body.get("role", "")).strip()
    valid_roles = {choice for choice, _ in AdminRole.ROLE_CHOICES}
    if role not in valid_roles:
        return JsonResponse({"message": f"role must be one of {sorted(valid_roles)}."}, status=400)

    AdminRole.objects.update_or_create(user=staff_user, defaults={"role": role})
    log_admin_activity(admin_user, "staff.set_role", "staff", staff_user.id, f"email={staff_user.email}, role={role}")

    return JsonResponse({"id": staff_user.id, "email": staff_user.email, "role": role})


# --- Wallet Ledger earnings comparison ---------------------------------

def pct_change(current, previous):
    """None when there's nothing to compare against (previous period was
    zero) - a "% change from zero" number is meaningless/infinite, so the
    frontend shows "new" instead of a bogus percentage.
    """
    if previous == 0:
        return None
    return float((current - previous) / previous * 100)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_wallet_earnings_summary(request):
    """RepetiGo's own earning (the per-page/per-photo usage fee, KIND_TOOL_USAGE
    debits) for today/this-week/this-month, each compared against the
    matching prior period - the Ledger tab's comparison boxes. One
    conditional-aggregate query for all six numbers rather than six separate
    ones (see admin_overview for the same pattern).
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "wallet")
    if err:
        return err

    now = timezone.now()
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    start_of_yesterday = start_of_today - timedelta(days=1)
    start_of_this_week = now - timedelta(days=7)
    start_of_last_week = now - timedelta(days=14)
    start_of_this_month = now - timedelta(days=30)
    start_of_last_month = now - timedelta(days=60)

    earning_filter = Q(kind=WalletTransaction.KIND_TOOL_USAGE, direction=WalletTransaction.DIRECTION_DEBIT)
    stats = WalletTransaction.objects.aggregate(
        today=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_today)),
        yesterday=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_yesterday, created_at__lt=start_of_today)),
        this_week=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_this_week)),
        last_week=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_last_week, created_at__lt=start_of_this_week)),
        this_month=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_this_month)),
        last_month=Sum("amount", filter=earning_filter & Q(created_at__gte=start_of_last_month, created_at__lt=start_of_this_month)),
    )
    today = stats["today"] or Decimal("0.00")
    yesterday = stats["yesterday"] or Decimal("0.00")
    this_week = stats["this_week"] or Decimal("0.00")
    last_week = stats["last_week"] or Decimal("0.00")
    this_month = stats["this_month"] or Decimal("0.00")
    last_month = stats["last_month"] or Decimal("0.00")

    return JsonResponse(
        {
            "today": {"amount": float(today), "comparisonAmount": float(yesterday), "changePercent": pct_change(today, yesterday)},
            "thisWeek": {"amount": float(this_week), "comparisonAmount": float(last_week), "changePercent": pct_change(this_week, last_week)},
            "thisMonth": {"amount": float(this_month), "comparisonAmount": float(last_month), "changePercent": pct_change(this_month, last_month)},
        }
    )


# --- Leads: Selenium scrape-queue extractor ---------------------------------

MAX_SCRAPE_PLACES = 15  # hard cap per run - bounds worst-case Chrome/Selenium run time


def public_scrape_run(run):
    return {
        "id": run.id,
        "status": run.status,
        "maxPlaces": run.max_places,
        "processedCount": run.processed_count,
        "successCount": run.success_count,
        "failedCount": run.failed_count,
        "log": run.log,
        "errorMessage": run.error_message,
        "startedAt": run.started_at.isoformat(),
        "completedAt": run.completed_at.isoformat() if run.completed_at else None,
    }


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def admin_leads_scrape_run(request):
    """Starts the Selenium extractor in the background and returns
    immediately - Chrome+Selenium is far too slow (seconds per place) to run
    inside the request/response cycle. The frontend polls
    admin_leads_scrape_status for progress.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    admin_user, err = require_section(request, "leads")
    if err:
        return err

    if ScrapeRun.objects.filter(status=ScrapeRun.STATUS_RUNNING).exists():
        return JsonResponse({"message": "An extractor run is already in progress."}, status=409)

    pending_count = GooglePlace.objects.filter(extracted_status=False).count()
    if pending_count == 0:
        return JsonResponse({"message": "Nothing pending in the scrape queue."}, status=400)

    body = parse_body(request)
    try:
        max_places = min(MAX_SCRAPE_PLACES, max(1, int(body.get("maxPlaces", 5))))
    except (TypeError, ValueError):
        max_places = 5

    run = ScrapeRun.objects.create(started_by=admin_user, max_places=max_places)
    log_admin_activity(admin_user, "leads.run_scraper", "scrape_run", run.id, f"maxPlaces={max_places}")

    thread = threading.Thread(target=run_scrape_job, args=(run.id,), daemon=True)
    thread.start()

    return JsonResponse({"run": public_scrape_run(run)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def admin_leads_scrape_status(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    _, err = require_section(request, "leads")
    if err:
        return err

    run = ScrapeRun.objects.order_by("-started_at").first()
    if not run:
        return JsonResponse({"run": None})

    return JsonResponse({"run": public_scrape_run(run)})
