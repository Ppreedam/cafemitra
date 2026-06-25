import json
import re
import secrets
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, get_user_model
from django.db.models import Max
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import AuthToken, PrintOrder, ServicePricing, ShopProfile, UserProfile

User = get_user_model()

ACCESS_TOKEN_TTL = timedelta(hours=1)
REFRESH_TOKEN_TTL = timedelta(days=30)

DEFAULT_SERVICE_PRICING = {
    "auto_document_print": {
        "serviceName": "CafeMitra PrintPilot",
        "settings": {
            "paymentMode": "Online Payment",
            "priceItems": [
                {"id": "black_white", "label": "Black & White", "rate": 2},
                {"id": "color", "label": "Color", "rate": 10},
            ],
        },
    },
    "passport_photo": {
        "serviceName": "Passport Size Photo",
        "settings": {
            "paymentMode": "Online Payment",
            "priceItems": [{"id": "six_pcs", "label": "6 pcs", "rate": 30}],
        },
    },
}


def parse_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


def public_user(user):
    profile = getattr(user, "profile", None)
    return {
        "id": str(user.id),
        "email": user.email,
        "fullName": user.get_full_name(),
        "phone": profile.phone if profile else "",
        "balance": float(profile.balance) if profile else 0,
        "profilePhoto": profile.profile_photo if profile else "",
    }


def public_shop(shop):
    return {
        "shopName": shop.shop_name,
        "address": shop.address,
        "city": shop.city,
        "state": shop.state,
        "pinCode": shop.pin_code,
        "mobile": shop.mobile,
        "whatsapp": shop.whatsapp,
        "email": shop.email,
        "logo": shop.logo,
        "banner": shop.banner,
    }


def ensure_service_pricing(user):
    for service_key, service in DEFAULT_SERVICE_PRICING.items():
        pricing, created = ServicePricing.objects.get_or_create(
            user=user,
            service_key=service_key,
            defaults={"service_name": service["serviceName"], "settings": service["settings"]},
        )
        if not created and pricing.service_name != service["serviceName"]:
            pricing.service_name = service["serviceName"]
            pricing.save(update_fields=["service_name", "updated_at"])


def public_pricing(pricing):
    return {
        "serviceKey": pricing.service_key,
        "serviceName": pricing.service_name,
        "settings": pricing.settings,
        "updatedAt": pricing.updated_at.isoformat(),
    }


def public_order(order):
    token_id = order.token_id or f"{order.shop_code}-T{order.token_number:03d}"
    return {
        "id": order.id,
        "orderNumber": f"{order.shop_code}-{order.id:05d}",
        "tokenId": token_id,
        "tokenNumber": order.token_number,
        "shopCode": order.shop_code,
        "serviceKey": order.service_key,
        "serviceName": order.service_name,
        "priceLabel": order.price_label,
        "rate": float(order.rate),
        "pages": order.pages,
        "copies": order.copies,
        "totalAmount": float(order.total_amount),
        "paymentMode": order.payment_mode,
        "paymentStatus": order.payment_status,
        "status": order.status,
        "fileName": order.original_filename,
        "fileUrl": order.document.url if order.document else "",
        "createdAt": order.created_at.isoformat(),
        "paidAt": order.paid_at.isoformat() if order.paid_at else "",
        "printedAt": order.printed_at.isoformat() if order.printed_at else "",
    }


def agent_order(order, request):
    payload = public_order(order)
    payload["downloadUrl"] = request.build_absolute_uri(order.document.url) if order.document else ""
    return payload


def positive_int(value, default=1):
    try:
      return max(int(value), 1)
    except (TypeError, ValueError):
      return default


def money(value):
    try:
        return Decimal(str(value)).quantize(Decimal("0.01"))
    except (InvalidOperation, TypeError, ValueError):
        return Decimal("0.00")


def next_order_token(user):
    latest = PrintOrder.objects.filter(user=user).aggregate(max_token=Max("token_number"))["max_token"] or 0
    token_number = int(latest) + 1
    return token_number, f"{cafe_code_for_user(user)}-T{token_number:03d}"


def cafe_code_for_user(user):
    return f"CM{int(user.id):04d}"


def user_from_cafe_code(code):
    match = re.match(r"^CM0*(\d+)$", str(code).strip().upper())
    if not match:
        return None
    return User.objects.filter(id=int(match.group(1))).first()


def issue_tokens(user, rotate_refresh=False):
    now = timezone.now()
    token, _ = AuthToken.objects.get_or_create(user=user, defaults={"key": secrets.token_hex(32)})
    token.key = secrets.token_hex(32)
    token.access_expires_at = now + ACCESS_TOKEN_TTL
    update_fields = ["key", "access_expires_at"]
    if rotate_refresh or not token.refresh_key or not token.refresh_expires_at or token.refresh_expires_at <= now:
        token.refresh_key = secrets.token_hex(48)
        token.refresh_expires_at = now + REFRESH_TOKEN_TTL
        update_fields.extend(["refresh_key", "refresh_expires_at"])
    token.save(update_fields=update_fields)
    return token


def token_response(user, status=200, rotate_refresh=False):
    token = issue_tokens(user, rotate_refresh=rotate_refresh)
    shop, _ = ShopProfile.objects.get_or_create(user=user)
    return JsonResponse(
        {
            "token": token.key,
            "refreshToken": token.refresh_key,
            "accessTokenExpiresAt": token.access_expires_at.isoformat(),
            "refreshTokenExpiresAt": token.refresh_expires_at.isoformat() if token.refresh_expires_at else "",
            "user": public_user(user),
            "shop": public_shop(shop),
        },
        status=status,
    )


def auth_user(request):
    header = request.headers.get("Authorization", "")
    key = header.replace("Bearer ", "", 1).strip()
    if not key:
        return None
    token = AuthToken.objects.select_related("user").filter(key=key).first()
    if token and token.access_expires_at and token.access_expires_at <= timezone.now():
        return None
    return token.user if token else None


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def register_user(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    full_name = str(body.get("fullName", "")).strip()
    phone = str(body.get("phone", "")).strip()
    password = str(body.get("password", ""))

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return JsonResponse({"message": "Enter a valid email address."}, status=400)
    if len(full_name) < 2:
        return JsonResponse({"message": "Enter your full name."}, status=400)
    if not re.match(r"^\d{10}$", phone):
        return JsonResponse({"message": "Mobile number must be exactly 10 digits."}, status=400)
    if len(password) < 8:
        return JsonResponse({"message": "Password must be at least 8 characters."}, status=400)
    if User.objects.filter(username=email).exists():
        return JsonResponse({"message": "Account already exists. Please login."}, status=409)

    user = User.objects.create_user(username=email, email=email, password=password)
    user.first_name = full_name
    user.save(update_fields=["first_name"])
    UserProfile.objects.create(user=user, phone=phone)
    ShopProfile.objects.create(user=user, shop_name="Cyber Cafe Shankar", mobile=phone, whatsapp=phone, email=email)
    return token_response(user, status=201, rotate_refresh=True)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def login_user(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    user = authenticate(username=email, password=password)
    if not user:
        return JsonResponse({"message": "Invalid email or password."}, status=401)

    return token_response(user, rotate_refresh=True)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def refresh_token(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    refresh_key = str(body.get("refreshToken", "")).strip()
    if not refresh_key:
        return JsonResponse({"message": "Refresh token is required."}, status=401)

    token = AuthToken.objects.select_related("user").filter(refresh_key=refresh_key).first()
    if not token or not token.refresh_expires_at or token.refresh_expires_at <= timezone.now():
        return JsonResponse({"message": "Session expired. Please login again."}, status=401)

    token.key = secrets.token_hex(32)
    token.access_expires_at = timezone.now() + ACCESS_TOKEN_TTL
    token.save(update_fields=["key", "access_expires_at"])
    shop, _ = ShopProfile.objects.get_or_create(user=token.user)
    return JsonResponse(
        {
            "token": token.key,
            "refreshToken": token.refresh_key,
            "accessTokenExpiresAt": token.access_expires_at.isoformat(),
            "refreshTokenExpiresAt": token.refresh_expires_at.isoformat(),
            "user": public_user(token.user),
            "shop": public_shop(shop),
        }
    )


@csrf_exempt
@require_http_methods(["GET", "PUT", "OPTIONS"])
def profile(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    profile_obj, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
    shop, _ = ShopProfile.objects.get_or_create(user=user)

    if request.method == "GET":
        return JsonResponse({"user": public_user(user), "shop": public_shop(shop)})

    body = parse_body(request)
    user_data = body.get("user", {})
    shop_data = body.get("shop", {})

    user.first_name = str(user_data.get("fullName", user.get_full_name())).strip()
    user.email = str(user_data.get("email", user.email)).strip().lower()
    user.save(update_fields=["first_name", "email"])

    profile_obj.phone = str(user_data.get("phone", profile_obj.phone)).strip()
    profile_obj.profile_photo = str(user_data.get("profilePhoto", profile_obj.profile_photo))
    profile_obj.save()

    shop.shop_name = str(shop_data.get("shopName", shop.shop_name))
    shop.logo = str(shop_data.get("logo", shop.logo))
    shop.banner = str(shop_data.get("banner", shop.banner))
    shop.address = str(shop_data.get("address", shop.address))
    shop.city = str(shop_data.get("city", shop.city))
    shop.state = str(shop_data.get("state", shop.state))
    shop.pin_code = str(shop_data.get("pinCode", shop.pin_code))
    shop.mobile = str(shop_data.get("mobile", shop.mobile))
    shop.whatsapp = str(shop_data.get("whatsapp", shop.whatsapp))
    shop.email = str(shop_data.get("email", shop.email))
    shop.save()

    return JsonResponse({"user": public_user(user), "shop": public_shop(shop)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def change_password(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    current_password = str(body.get("currentPassword", ""))
    new_password = str(body.get("newPassword", ""))

    if not user.check_password(current_password):
        return JsonResponse({"message": "Current password is incorrect."}, status=400)
    if len(new_password) < 8:
        return JsonResponse({"message": "New password must be at least 8 characters."}, status=400)

    user.set_password(new_password)
    user.save(update_fields=["password"])
    return JsonResponse({"message": "Password changed successfully."})


@csrf_exempt
@require_http_methods(["GET", "PUT", "OPTIONS"])
def pricing_settings(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    ensure_service_pricing(user)

    if request.method == "GET":
        pricing = ServicePricing.objects.filter(user=user)
        return JsonResponse({"services": [public_pricing(item) for item in pricing]})

    body = parse_body(request)
    service_key = str(body.get("serviceKey", "")).strip()
    settings = body.get("settings", {})

    if service_key not in DEFAULT_SERVICE_PRICING:
        return JsonResponse({"message": "Unknown service."}, status=400)
    if not isinstance(settings, dict):
        return JsonResponse({"message": "Invalid pricing settings."}, status=400)

    default_service = DEFAULT_SERVICE_PRICING[service_key]
    pricing, _ = ServicePricing.objects.get_or_create(
        user=user,
        service_key=service_key,
        defaults={"service_name": default_service["serviceName"], "settings": default_service["settings"]},
    )
    pricing.service_name = default_service["serviceName"]
    pricing.settings = {**default_service["settings"], **settings}
    pricing.save(update_fields=["service_name", "settings", "updated_at"])

    return JsonResponse({"service": public_pricing(pricing)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_print_order(request, code):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = user_from_cafe_code(code)
    if not user:
        return JsonResponse({"message": "Cafe not found."}, status=404)

    document = request.FILES.get("document")
    if not document:
        return JsonResponse({"message": "Upload final printable document."}, status=400)

    ensure_service_pricing(user)
    service_key = str(request.POST.get("serviceKey", "")).strip()
    pricing = ServicePricing.objects.filter(user=user, service_key=service_key).first()
    if not pricing:
        return JsonResponse({"message": "Selected service is not available."}, status=400)

    pages = positive_int(request.POST.get("pages"), 1)
    copies = positive_int(request.POST.get("copies"), 1)
    rate = money(request.POST.get("rate"))
    total = money(request.POST.get("totalAmount"))
    calculated_total = (rate * pages * copies).quantize(Decimal("0.01"))
    if total != calculated_total:
        total = calculated_total

    payment_mode = str(request.POST.get("paymentMode", pricing.settings.get("paymentMode", "Online Payment"))).strip()
    if payment_mode == "No Payment":
        payment_status = PrintOrder.PAYMENT_NO_PAYMENT
        order_status = PrintOrder.STATUS_QUEUED
    elif payment_mode == "Cash Counter":
        payment_status = PrintOrder.PAYMENT_CASH_COUNTER
        order_status = PrintOrder.STATUS_AWAITING_APPROVAL
    else:
        payment_status = PrintOrder.PAYMENT_PENDING
        order_status = PrintOrder.STATUS_AWAITING_PAYMENT

    token_number, token_id = next_order_token(user)
    order = PrintOrder.objects.create(
        user=user,
        shop_code=cafe_code_for_user(user),
        token_number=token_number,
        token_id=token_id,
        service_key=service_key,
        service_name=pricing.service_name,
        price_item_id=str(request.POST.get("priceItemId", "")).strip(),
        price_label=str(request.POST.get("priceLabel", "")).strip() or "Print",
        rate=rate,
        pages=pages,
        copies=copies,
        total_amount=total,
        payment_mode=payment_mode,
        payment_status=payment_status,
        status=order_status,
        document=document,
        original_filename=document.name,
        customer_phone=str(request.POST.get("customerPhone", "")).strip(),
    )

    return JsonResponse({"order": public_order(order)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def order_history(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    orders = PrintOrder.objects.filter(user=user).order_by("-created_at")[:100]
    return JsonResponse({"orders": [public_order(order) for order in orders]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def approve_cash_order(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.payment_status != PrintOrder.PAYMENT_CASH_COUNTER:
        return JsonResponse({"message": "Only cash counter orders need approval."}, status=400)
    if order.status != PrintOrder.STATUS_AWAITING_APPROVAL:
        return JsonResponse({"message": "This order is not waiting for approval."}, status=400)

    order.status = PrintOrder.STATUS_QUEUED
    order.agent_message = "Cash counter print approved by cafe owner."
    order.save(update_fields=["status", "agent_message"])
    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def reject_cash_order(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.payment_status != PrintOrder.PAYMENT_CASH_COUNTER:
        return JsonResponse({"message": "Only cash counter orders can be rejected here."}, status=400)

    order.status = PrintOrder.STATUS_FAILED
    order.agent_message = "Cash counter print rejected by cafe owner."
    order.save(update_fields=["status", "agent_message"])
    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_mark_order_paid(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    order.payment_status = PrintOrder.PAYMENT_PAID
    order.status = PrintOrder.STATUS_QUEUED
    order.paid_at = timezone.now()
    order.save(update_fields=["payment_status", "status", "paid_at"])
    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_jobs(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    jobs = PrintOrder.objects.filter(user=user, status=PrintOrder.STATUS_QUEUED).order_by("created_at")[:20]
    return JsonResponse({"jobs": [agent_order(job, request) for job in jobs]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def agent_job_status(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    body = parse_body(request)
    next_status = str(body.get("status", "")).strip()
    if next_status not in {PrintOrder.STATUS_PRINTING, PrintOrder.STATUS_PRINTED, PrintOrder.STATUS_FAILED}:
        return JsonResponse({"message": "Invalid print status."}, status=400)

    order.status = next_status
    order.agent_message = str(body.get("message", "")).strip()
    if next_status == PrintOrder.STATUS_PRINTED:
        order.printed_at = timezone.now()
        order.save(update_fields=["status", "agent_message", "printed_at"])
    else:
        order.save(update_fields=["status", "agent_message"])

    return JsonResponse({"order": public_order(order)})


@require_http_methods(["GET", "OPTIONS"])
def public_shop_by_code(request, code):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = user_from_cafe_code(code)
    if not user:
        return JsonResponse({"message": "Cafe not found."}, status=404)

    shop, _ = ShopProfile.objects.get_or_create(user=user)
    ensure_service_pricing(user)
    pricing = ServicePricing.objects.filter(user=user)

    return JsonResponse(
        {
            "code": cafe_code_for_user(user),
            "shop": public_shop(shop),
            "services": [public_pricing(item) for item in pricing],
            "status": {"verified": True, "open": True},
        }
    )
