import base64
import json
import hashlib
import hmac
import ipaddress
import logging
import mimetypes
import os
import re
import secrets
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count, Max, Q, Sum
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.utils.html import escape
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .background_remover.remove_background import BackgroundRemovalError, remove_background_bytes
from .background_remover.passport_photo_processor import ProcessingError, enhance_transparent_bytes
from .background_remover.watermark_remover import remove_gemini_watermark
# from .models import AuthToken, ContactMessage, EmailVerificationToken, GooglePlace, GooglePlaceDetail, LeadActivity, PasswordResetToken, PrintOrder, ServicePricing, ShopProfile, ToolPricing, UserProfile, WalletSetting, WalletTopup, WalletTransaction, WithdrawalRequest
from .admin_roles import role_allows_section
from .models import Agent, AuthToken, ContactMessage, EmailVerificationToken, GooglePlace, GooglePlaceDetail, LeadActivity, PasswordResetToken, PrintOrder, ServicePricing, ShopProfile, ToolPricing, UserProfile, WalletSetting, WalletTopup, WalletTransaction, WithdrawalRequest
from cafemitra_server.product_setting import PAYMENT_GATEWAYS, active_payment_gateway

User = get_user_model()

logger = logging.getLogger("django")

ACCESS_TOKEN_TTL = timedelta(hours=1)
REFRESH_TOKEN_TTL = timedelta(days=30)
EMAIL_TOKEN_TTL = timedelta(hours=24)
PASSWORD_RESET_TOKEN_TTL = timedelta(minutes=30)
# WalletSetting keys read via get_wallet_setting() - values (and the numbers
# shown on the public pricing page) live in the DB / Django admin, not here,
# so a price change never requires a code deploy. Fallbacks below only apply
# if a row is somehow missing.
WALLET_SETTING_DEFAULTS = {
    "signup_bonus": Decimal("10.00"),
    "referral_bonus": Decimal("0.00"),
    "credit_limit": Decimal("-50.00"),
    "daily_grace_limit": Decimal("5.00"),
    "collection_commission_rate": Decimal("0.03"),
}
UPI_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9]{2,64}$")
UPI_PAYMENT_PA = "8298972939@okbizaxis"
UPI_PAYMENT_STATUS_URL = "https://otp.instadl.in/upi_payment/check_status"

DEFAULT_SERVICE_PRICING = {
    "auto_document_print": {
        "serviceName": "RepetiGo PrintPilot",
        "settings": {
            "paymentMode": "Online Payment",
            "selectedPrinter": "",
            "pricingSaved": False,
            "testPrintDone": False,
            "isOpen": True,
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
    "resume_builder": {
        "serviceName": "Resume Builder",
        "settings": {
            "paymentMode": "Online Payment",
            # One price item per resume template (RESUME_BUILDER_TEMPLATES) -
            # what THIS shop charges its own walk-in customer for that
            # template, separate from RepetiGo's own resume_builder_<template>
            # ToolPricing fee charged to the shop's wallet.
            "priceItems": [
                {"id": "classic", "label": "Classic template", "rate": 15},
                {"id": "modern", "label": "Modern template", "rate": 20},
                {"id": "minimal", "label": "Minimal template", "rate": 15},
                {"id": "elegant", "label": "Elegant template", "rate": 20},
                {"id": "bold", "label": "Bold template", "rate": 20},
                {"id": "sidebar", "label": "Sidebar Photo template", "rate": 25},
                {"id": "sidebar-right", "label": "Sidebar Photo (Right) template", "rate": 25},
                {"id": "ats", "label": "ATS-Ultra template", "rate": 15},
                {"id": "timeline", "label": "Timeline template", "rate": 20},
            ],
        },
    },
    "biodata_maker": {
        "serviceName": "Biodata Maker",
        "settings": {
            "paymentMode": "Online Payment",
            # One price item per biodata template (BIODATA_MAKER_TEMPLATES) -
            # what THIS shop charges its own walk-in customer for that
            # template, separate from RepetiGo's own biodata_maker_<template>
            # ToolPricing fee charged to the shop's wallet.
            "priceItems": [
                {"id": "classic", "label": "Classic template", "rate": 15},
                {"id": "modern", "label": "Modern template", "rate": 20},
                {"id": "simple", "label": "Simple template", "rate": 10},
            ],
        },
    },
}


def parse_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


@csrf_exempt
@require_http_methods(["POST"])
def ai_upscale_image(request):
    """Validate an image and relay it to the configured AI upscaling provider."""
    upload = request.FILES.get("image")
    if not upload:
        return JsonResponse({"message": "Select an image to upscale."}, status=400)
    if upload.size > 15 * 1024 * 1024:
        return JsonResponse({"message": "Images must be 15 MB or smaller."}, status=413)
    content_type = (upload.content_type or "").lower()
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        return JsonResponse({"message": "Only JPG, PNG, and WebP images are supported."}, status=400)
    scale = request.POST.get("scale", "2")
    output_format = request.POST.get("output_format", "webp").lower()
    if scale not in {"2", "4"}:
        return JsonResponse({"message": "Scale must be 2 or 4."}, status=400)
    if output_format not in {"webp", "png", "jpeg", "jpg"}:
        return JsonResponse({"message": "Output format must be webp, png, or jpeg."}, status=400)
    if not settings.AI_UPSCALE_API_URL:
        return JsonResponse({"message": "AI Image Upscaler is not configured on the server."}, status=503)

    image_bytes = upload.read()
    boundary = f"----RepetiGo{secrets.token_hex(16)}"
    body = _multipart_body(boundary, image_bytes, upload.name, content_type, scale, output_format)
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}", "Accept": "image/*"}
    if settings.AI_UPSCALE_API_KEY:
        headers["Authorization"] = f"Bearer {settings.AI_UPSCALE_API_KEY}"
    provider_request = urllib.request.Request(settings.AI_UPSCALE_API_URL, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(provider_request, timeout=settings.AI_UPSCALE_TIMEOUT) as provider_response:
            result = provider_response.read()
            result_type = provider_response.headers.get_content_type()
    except urllib.error.HTTPError as error:
        detail = error.read(2048).decode("utf-8", errors="replace")
        return JsonResponse({"message": "AI provider rejected the image.", "providerDetail": detail}, status=502)
    except (urllib.error.URLError, TimeoutError):
        return JsonResponse({"message": "AI upscaling service is currently unavailable."}, status=502)
    if not result or not result_type.startswith("image/"):
        return JsonResponse({"message": "AI provider did not return a valid image."}, status=502)

    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(result_type, output_format)
    base_name = re.sub(r"[^A-Za-z0-9._-]+", "-", upload.name.rsplit(".", 1)[0])[:80] or "image"
    response = HttpResponse(result, content_type=result_type)
    response["Content-Disposition"] = f'attachment; filename="{base_name}-{scale}x-ai-upscaled.{extension}"'
    response["Cache-Control"] = "no-store"
    return response


def _multipart_body(boundary, image_bytes, filename, content_type, scale, output_format):
    safe_filename = re.sub(r'[^A-Za-z0-9._-]+', '-', filename) or "image"
    chunks = []
    for name, value in (("scale", scale), ("output_format", output_format)):
        chunks.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode())
    chunks.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{safe_filename}\"\r\nContent-Type: {content_type}\r\n\r\n".encode())
    chunks.extend((image_bytes, f"\r\n--{boundary}--\r\n".encode()))
    return b"".join(chunks)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def extract_pdf_text(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    upload = request.FILES.get("pdf")
    if not upload:
        return JsonResponse({"message": "Select a PDF file."}, status=400)
    if upload.size > 30 * 1024 * 1024:
        return JsonResponse({"message": "PDF must be 30 MB or smaller."}, status=413)
    if (upload.content_type or "").lower() not in {"application/pdf", "application/x-pdf", ""} and not upload.name.lower().endswith(".pdf"):
        return JsonResponse({"message": "Only PDF files are supported."}, status=400)

    try:
        import fitz
    except ImportError:
        return JsonResponse({"message": "PDF text extraction is not available on this server."}, status=503)

    selected_pages = None
    raw_pages = request.POST.get("pages", "")
    if raw_pages:
        try:
            parsed = json.loads(raw_pages)
            selected_pages = {int(page) for page in parsed if int(page) > 0}
        except (TypeError, ValueError, json.JSONDecodeError):
            return JsonResponse({"message": "Page selection is invalid."}, status=400)

    try:
        document = fitz.open(stream=upload.read(), filetype="pdf")
    except Exception:
        return JsonResponse({"message": "This PDF could not be opened. It may be protected or damaged."}, status=400)

    try:
        page_texts = []
        for page_index in range(document.page_count):
            page_number = page_index + 1
            if selected_pages and page_number not in selected_pages:
                continue
            text = document.load_page(page_index).get_text("text").strip()
            page_texts.append({"page": page_number, "text": text})
    finally:
        document.close()

    combined = "\n\n".join(f"--- Page {item['page']} ---\n{item['text']}" for item in page_texts).strip()
    return JsonResponse({"text": combined, "pages": page_texts, "pageCount": len(page_texts)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def remove_image_background(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    upload = request.FILES.get("image")
    if not upload:
        return JsonResponse({"message": "Select an image."}, status=400)
    if upload.size > 15 * 1024 * 1024:
        return JsonResponse({"message": "Images must be 15 MB or smaller."}, status=413)
    content_type = (upload.content_type or "").lower()
    if content_type not in {"image/jpeg", "image/png", "image/webp"}:
        return JsonResponse({"message": "Only JPG, PNG, and WebP images are supported."}, status=400)

    enhance = str(request.POST.get("enhance", "true")).lower() not in {"false", "0", "no"}

    # Pattern for wiring wallet billing into any tool: resolve the caller
    # (anonymous visitors stay free either way), do the work, then charge on
    # success. This is a no-op today because ToolPricing has no billable
    # "background_remover" row - flip is_billable + set a price in Django
    # admin to start charging, no code change needed. Apply the same two
    # lines to other tools when they're ready to be monetized.
    user = auth_user(request)
    if user:
        allowed, limit_message = wallet_usage_gate(user, "background_remover")
        if not allowed:
            return JsonResponse({"message": limit_message}, status=402)

    try:
        result_bytes = remove_background_bytes(upload.read())
    except BackgroundRemovalError as error:
        return JsonResponse({"message": str(error)}, status=502)

    if user:
        charge_wallet_for_tool(user, "background_remover")

    if enhance:
        try:
            result_bytes = enhance_transparent_bytes(result_bytes)
        except ProcessingError:
            pass

    base_name = re.sub(r"[^A-Za-z0-9._-]+", "-", upload.name.rsplit(".", 1)[0])[:80] or "image"
    response = HttpResponse(result_bytes, content_type="image/png")
    response["Content-Disposition"] = f'attachment; filename="{base_name}-no-bg.png"'
    response["Cache-Control"] = "no-store"
    return response


# Keep in sync with TemplateId in cafemitra_client/app/resume-builder/templates.ts.
RESUME_BUILDER_TEMPLATES = {"classic", "modern", "minimal", "elegant", "bold", "sidebar", "sidebar-right", "ats", "timeline"}


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def resume_builder_charge(request):
    """Gate + charge a resume PDF download. Called by the client right before
    it generates the PDF (which happens entirely in the browser via pdf-lib -
    there's no server-side file to build here). Each template (see
    RESUME_BUILDER_TEMPLATES) is its own ToolPricing row
    (resume_builder_<template>) so prices can differ per template from
    Django admin without a code change. A tool with no row, is_billable=False,
    or price 0 stays free.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to download your resume."}, status=401)

    body = parse_body(request)
    template = body.get("template")
    if template not in RESUME_BUILDER_TEMPLATES:
        template = "classic"
    tool_key = f"resume_builder_{template}"

    allowed, limit_message = wallet_usage_gate(user, tool_key)
    if not allowed:
        return JsonResponse({"message": limit_message}, status=402)

    charged, charge_message, _txn = charge_wallet_for_tool(user, tool_key)
    if not charged:
        return JsonResponse({"message": charge_message}, status=402)

    return JsonResponse({"ok": True, "toolKey": tool_key})


def resume_order_summary(order):
    return {
        "id": order.id,
        "template": order.price_item_id,
        "label": order.price_label or "Untitled resume",
        "data": order.resume_data or {},
        "createdAt": order.created_at.isoformat(),
        "forCustomer": order.payment_mode in {"Cash", "Online"},
        "paymentMode": order.payment_mode,
        "paymentStatus": order.payment_status,
        "paymentGateway": order.payment_gateway,
        "gatewayOrderId": order.gateway_order_id,
        "totalAmount": float(order.total_amount),
        "customerPhone": order.customer_phone,
    }


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def resume_builder_save(request):
    """Save (or update) a resume draft as a PrintOrder row. Reusing PrintOrder
    rather than a bespoke table means a saved resume already rides the same
    order-history rails as every other tool.

    Two modes, chosen by the client's `forCustomer` flag:
    - Personal draft (default): free, no charge, `payment_mode="No Payment"`.
    - For a walk-in customer: looks up this shop's own resume_builder
      ServicePricing (what THEY charge their customer for that template -
      separate from RepetiGo's resume_builder_<template> ToolPricing fee,
      which is still charged separately via resume_builder_charge on
      download/print). `paymentMode` from the client picks "Cash" (awaiting
      the owner's Mark as Paid) or "Online" (awaiting Razorpay checkout via
      the existing public_create_razorpay_order/public_verify_razorpay_payment
      endpoints, which work off any PrintOrder id already).
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to save your resume."}, status=401)

    body = parse_body(request)
    data = body.get("data")
    if not isinstance(data, dict):
        return JsonResponse({"message": "No resume data received."}, status=400)

    template = data.get("template")
    if template not in RESUME_BUILDER_TEMPLATES:
        template = "classic"
    label = (str(data.get("fullName") or "").strip() or "Untitled resume")[:160]

    for_customer = bool(body.get("forCustomer"))
    customer_payment_mode = str(body.get("paymentMode", "")).strip().lower()

    if for_customer:
        ensure_service_pricing(user)
        pricing = ServicePricing.objects.filter(user=user, service_key="resume_builder").first()
        rate = pricing_rate(pricing.settings if pricing else {}, template, 1, Decimal("0.00"))
        payment_mode = "Online" if customer_payment_mode == "online" else "Cash"
        payment_status = PrintOrder.PAYMENT_PENDING if payment_mode == "Online" else PrintOrder.PAYMENT_NO_PAYMENT
        payment_gateway = (active_payment_gateway()[0] or "") if payment_mode == "Online" else ""
        customer_phone = str(data.get("phone") or "").strip()
    else:
        rate = Decimal("0.00")
        payment_mode = "No Payment"
        payment_status = PrintOrder.PAYMENT_NO_PAYMENT
        payment_gateway = ""
        customer_phone = ""

    order = None
    order_id = body.get("orderId")
    if order_id:
        order = PrintOrder.objects.filter(id=order_id, user=user, service_key="resume_builder").first()

    if order:
        order.resume_data = data
        order.price_item_id = template
        order.price_label = label
        update_fields = ["resume_data", "price_item_id", "price_label"]
        # Only a still-unpaid order can be re-priced/re-targeted - once a
        # customer has actually paid, editing the resume shouldn't silently
        # change what they were charged or who it was billed to.
        if for_customer and order.payment_status != PrintOrder.PAYMENT_PAID:
            order.rate = rate
            order.total_amount = rate
            order.payment_mode = payment_mode
            order.payment_status = payment_status
            order.payment_gateway = payment_gateway
            order.customer_phone = customer_phone
            update_fields += ["rate", "total_amount", "payment_mode", "payment_status", "payment_gateway", "customer_phone"]
        order.save(update_fields=update_fields)
    else:
        token_number, token_id = next_order_token(user)
        order = PrintOrder.objects.create(
            user=user,
            shop_code=cafe_code_for_user(user),
            token_number=token_number,
            token_id=token_id,
            service_key="resume_builder",
            service_name="Resume Builder",
            price_item_id=template,
            price_label=label,
            rate=rate,
            pages=1,
            copies=1,
            total_amount=rate,
            payment_mode=payment_mode,
            payment_status=payment_status,
            payment_gateway=payment_gateway,
            customer_phone=customer_phone,
            # Not STATUS_QUEUED on purpose - that status (and PAYMENT_PENDING
            # via public_verify_razorpay_payment) is what the desktop Print
            # Agent's job poll would otherwise pick up (agent_jobs already
            # excludes service_key="resume_builder" as a second guard). A
            # saved/paid-for resume isn't a print job; only the separate
            # "Print via PrintPilot" action ever queues physical printing.
            status=PrintOrder.STATUS_PRINTED,
            resume_data=data,
        )

    return JsonResponse(resume_order_summary(order))


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def mark_resume_order_paid(request, order_id):
    """Owner confirms cash was collected for a customer's resume - mirrors
    mark_passport_order_paid. Unlocks that order's clean (non-watermarked)
    download for the customer.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user, service_key="resume_builder").first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.payment_mode != "Cash" or order.payment_status != PrintOrder.PAYMENT_NO_PAYMENT:
        return JsonResponse({"message": "Only unpaid cash resume orders can be marked as paid."}, status=400)

    order.payment_status = PrintOrder.PAYMENT_PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["payment_status", "paid_at"])
    # RepetiGo's own per-template fee (separate from what the customer just
    # paid the shop) is charged exactly once, right here - the moment the
    # cash payment is actually confirmed, mirroring the online-payment path
    # in public_verify_razorpay_payment. charge_wallet_for_tool/
    # create_wallet_transaction dedupe on (user, order, kind), so a retried
    # click can't double-charge.
    charge_wallet_for_tool(order.user, f"resume_builder_{order.price_item_id}", order=order)
    return JsonResponse(resume_order_summary(order))


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_resume_order(request, code):
    """Anonymous equivalent of resume_builder_save's for_customer branch -
    lets a walk-in customer at /s/<code> build and pay for their own resume
    from their own phone, without a cafe login. Always for-customer (Cash or
    Online); there's no "personal draft" concept here since there's no
    account to save a draft against.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = user_from_cafe_code(code)
    if not user:
        return JsonResponse({"message": "Cafe not found."}, status=404)

    body = parse_body(request)
    data = body.get("data")
    if not isinstance(data, dict):
        return JsonResponse({"message": "No resume data received."}, status=400)

    template = data.get("template")
    if template not in RESUME_BUILDER_TEMPLATES:
        template = "classic"
    label = (str(data.get("fullName") or "").strip() or "Untitled resume")[:160]

    ensure_service_pricing(user)
    pricing = ServicePricing.objects.filter(user=user, service_key="resume_builder").first()
    rate = pricing_rate(pricing.settings if pricing else {}, template, 1, Decimal("0.00"))

    allowed, gate_message = wallet_usage_gate(user, f"resume_builder_{template}")
    if not allowed:
        return JsonResponse({"message": gate_message}, status=402)

    customer_payment_mode = str(body.get("paymentMode", "")).strip().lower()
    payment_mode = "Online" if customer_payment_mode == "online" else "Cash"
    payment_status = PrintOrder.PAYMENT_PENDING if payment_mode == "Online" else PrintOrder.PAYMENT_NO_PAYMENT
    payment_gateway = (active_payment_gateway()[0] or "") if payment_mode == "Online" else ""
    customer_phone = str(data.get("phone") or "").strip()

    order = None
    order_id = body.get("orderId")
    if order_id:
        # Scoped to this shop's own resume_builder orders that are already
        # for-customer (Cash/Online) - a bare id can't touch a personal draft
        # saved from the owner's authenticated dashboard.
        order = PrintOrder.objects.filter(
            id=order_id, user=user, service_key="resume_builder", payment_mode__in=["Cash", "Online"],
        ).first()

    if order:
        if order.payment_status == PrintOrder.PAYMENT_PAID:
            return JsonResponse({"message": "This resume has already been paid for."}, status=400)
        order.resume_data = data
        order.price_item_id = template
        order.price_label = label
        order.rate = rate
        order.total_amount = rate
        order.payment_mode = payment_mode
        order.payment_status = payment_status
        order.payment_gateway = payment_gateway
        order.customer_phone = customer_phone
        order.save(update_fields=[
            "resume_data", "price_item_id", "price_label", "rate", "total_amount",
            "payment_mode", "payment_status", "payment_gateway", "customer_phone",
        ])
    else:
        token_number, token_id = next_order_token(user)
        order = PrintOrder.objects.create(
            user=user,
            shop_code=cafe_code_for_user(user),
            token_number=token_number,
            token_id=token_id,
            service_key="resume_builder",
            service_name="Resume Builder",
            price_item_id=template,
            price_label=label,
            rate=rate,
            pages=1,
            copies=1,
            total_amount=rate,
            payment_mode=payment_mode,
            payment_status=payment_status,
            payment_gateway=payment_gateway,
            customer_phone=customer_phone,
            status=PrintOrder.STATUS_PRINTED,
            resume_data=data,
        )

    return JsonResponse(resume_order_summary(order))


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def resume_builder_saved_list(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to see your saved resumes."}, status=401)

    orders = PrintOrder.objects.filter(user=user, service_key="resume_builder").order_by("-created_at")[:100]
    return JsonResponse({"resumes": [resume_order_summary(order) for order in orders]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def resume_builder_delete(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in."}, status=401)

    deleted, _ = PrintOrder.objects.filter(id=order_id, user=user, service_key="resume_builder").delete()
    if not deleted:
        return JsonResponse({"message": "Resume not found."}, status=404)
    return JsonResponse({"ok": True})


# Keep in sync with BiodataTemplateId in cafemitra_client/app/biodata-maker/templates.ts.
BIODATA_MAKER_TEMPLATES = {"classic", "modern", "simple"}


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def biodata_maker_charge(request):
    """Gate + charge a biodata PDF download. Mirrors resume_builder_charge -
    the PDF is built entirely client-side via pdf-lib, so this only gates and
    charges RepetiGo's own per-template fee (biodata_maker_<template>).
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to download your biodata."}, status=401)

    body = parse_body(request)
    template = body.get("template")
    if template not in BIODATA_MAKER_TEMPLATES:
        template = "classic"
    tool_key = f"biodata_maker_{template}"

    allowed, limit_message = wallet_usage_gate(user, tool_key)
    if not allowed:
        return JsonResponse({"message": limit_message}, status=402)

    charged, charge_message, _txn = charge_wallet_for_tool(user, tool_key)
    if not charged:
        return JsonResponse({"message": charge_message}, status=402)

    return JsonResponse({"ok": True, "toolKey": tool_key})


def biodata_order_summary(order):
    return {
        "id": order.id,
        "template": order.price_item_id,
        "label": order.price_label or "Untitled biodata",
        "data": order.biodata_data or {},
        "createdAt": order.created_at.isoformat(),
        "forCustomer": order.payment_mode in {"Cash", "Online"},
        "paymentMode": order.payment_mode,
        "paymentStatus": order.payment_status,
        "paymentGateway": order.payment_gateway,
        "gatewayOrderId": order.gateway_order_id,
        "totalAmount": float(order.total_amount),
        "customerPhone": order.customer_phone,
    }


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def biodata_maker_save(request):
    """Save (or update) a biodata draft as a PrintOrder row. Mirrors
    resume_builder_save - see that docstring for the personal-draft vs.
    for-customer distinction.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to save your biodata."}, status=401)

    body = parse_body(request)
    data = body.get("data")
    if not isinstance(data, dict):
        return JsonResponse({"message": "No biodata received."}, status=400)

    template = data.get("template")
    if template not in BIODATA_MAKER_TEMPLATES:
        template = "classic"
    label = (str(data.get("fullName") or "").strip() or "Untitled biodata")[:160]

    for_customer = bool(body.get("forCustomer"))
    customer_payment_mode = str(body.get("paymentMode", "")).strip().lower()

    if for_customer:
        ensure_service_pricing(user)
        pricing = ServicePricing.objects.filter(user=user, service_key="biodata_maker").first()
        rate = pricing_rate(pricing.settings if pricing else {}, template, 1, Decimal("0.00"))
        payment_mode = "Online" if customer_payment_mode == "online" else "Cash"
        payment_status = PrintOrder.PAYMENT_PENDING if payment_mode == "Online" else PrintOrder.PAYMENT_NO_PAYMENT
        payment_gateway = (active_payment_gateway()[0] or "") if payment_mode == "Online" else ""
        customer_phone = str(data.get("phone") or "").strip()
    else:
        rate = Decimal("0.00")
        payment_mode = "No Payment"
        payment_status = PrintOrder.PAYMENT_NO_PAYMENT
        payment_gateway = ""
        customer_phone = ""

    order = None
    order_id = body.get("orderId")
    if order_id:
        order = PrintOrder.objects.filter(id=order_id, user=user, service_key="biodata_maker").first()

    if order:
        order.biodata_data = data
        order.price_item_id = template
        order.price_label = label
        update_fields = ["biodata_data", "price_item_id", "price_label"]
        # Only a still-unpaid order can be re-priced/re-targeted - see
        # resume_builder_save for why.
        if for_customer and order.payment_status != PrintOrder.PAYMENT_PAID:
            order.rate = rate
            order.total_amount = rate
            order.payment_mode = payment_mode
            order.payment_status = payment_status
            order.payment_gateway = payment_gateway
            order.customer_phone = customer_phone
            update_fields += ["rate", "total_amount", "payment_mode", "payment_status", "payment_gateway", "customer_phone"]
        order.save(update_fields=update_fields)
    else:
        token_number, token_id = next_order_token(user)
        order = PrintOrder.objects.create(
            user=user,
            shop_code=cafe_code_for_user(user),
            token_number=token_number,
            token_id=token_id,
            service_key="biodata_maker",
            service_name="Biodata Maker",
            price_item_id=template,
            price_label=label,
            rate=rate,
            pages=1,
            copies=1,
            total_amount=rate,
            payment_mode=payment_mode,
            payment_status=payment_status,
            payment_gateway=payment_gateway,
            customer_phone=customer_phone,
            # Not STATUS_QUEUED on purpose - see resume_builder_save. Biodata
            # orders are excluded from agent_jobs as a second guard.
            status=PrintOrder.STATUS_PRINTED,
            biodata_data=data,
        )

    return JsonResponse(biodata_order_summary(order))


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def mark_biodata_order_paid(request, order_id):
    """Owner confirms cash was collected for a customer's biodata - mirrors
    mark_resume_order_paid.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user, service_key="biodata_maker").first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.payment_mode != "Cash" or order.payment_status != PrintOrder.PAYMENT_NO_PAYMENT:
        return JsonResponse({"message": "Only unpaid cash biodata orders can be marked as paid."}, status=400)

    order.payment_status = PrintOrder.PAYMENT_PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["payment_status", "paid_at"])
    charge_wallet_for_tool(order.user, f"biodata_maker_{order.price_item_id}", order=order)
    return JsonResponse(biodata_order_summary(order))


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_biodata_order(request, code):
    """Anonymous equivalent of biodata_maker_save's for_customer branch -
    mirrors public_resume_order.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = user_from_cafe_code(code)
    if not user:
        return JsonResponse({"message": "Cafe not found."}, status=404)

    body = parse_body(request)
    data = body.get("data")
    if not isinstance(data, dict):
        return JsonResponse({"message": "No biodata received."}, status=400)

    template = data.get("template")
    if template not in BIODATA_MAKER_TEMPLATES:
        template = "classic"
    label = (str(data.get("fullName") or "").strip() or "Untitled biodata")[:160]

    ensure_service_pricing(user)
    pricing = ServicePricing.objects.filter(user=user, service_key="biodata_maker").first()
    rate = pricing_rate(pricing.settings if pricing else {}, template, 1, Decimal("0.00"))

    allowed, gate_message = wallet_usage_gate(user, f"biodata_maker_{template}")
    if not allowed:
        return JsonResponse({"message": gate_message}, status=402)

    customer_payment_mode = str(body.get("paymentMode", "")).strip().lower()
    payment_mode = "Online" if customer_payment_mode == "online" else "Cash"
    payment_status = PrintOrder.PAYMENT_PENDING if payment_mode == "Online" else PrintOrder.PAYMENT_NO_PAYMENT
    payment_gateway = (active_payment_gateway()[0] or "") if payment_mode == "Online" else ""
    customer_phone = str(data.get("phone") or "").strip()

    order = None
    order_id = body.get("orderId")
    if order_id:
        order = PrintOrder.objects.filter(
            id=order_id, user=user, service_key="biodata_maker", payment_mode__in=["Cash", "Online"],
        ).first()

    if order:
        if order.payment_status == PrintOrder.PAYMENT_PAID:
            return JsonResponse({"message": "This biodata has already been paid for."}, status=400)
        order.biodata_data = data
        order.price_item_id = template
        order.price_label = label
        order.rate = rate
        order.total_amount = rate
        order.payment_mode = payment_mode
        order.payment_status = payment_status
        order.payment_gateway = payment_gateway
        order.customer_phone = customer_phone
        order.save(update_fields=[
            "biodata_data", "price_item_id", "price_label", "rate", "total_amount",
            "payment_mode", "payment_status", "payment_gateway", "customer_phone",
        ])
    else:
        token_number, token_id = next_order_token(user)
        order = PrintOrder.objects.create(
            user=user,
            shop_code=cafe_code_for_user(user),
            token_number=token_number,
            token_id=token_id,
            service_key="biodata_maker",
            service_name="Biodata Maker",
            price_item_id=template,
            price_label=label,
            rate=rate,
            pages=1,
            copies=1,
            total_amount=rate,
            payment_mode=payment_mode,
            payment_status=payment_status,
            payment_gateway=payment_gateway,
            customer_phone=customer_phone,
            status=PrintOrder.STATUS_PRINTED,
            biodata_data=data,
        )

    return JsonResponse(biodata_order_summary(order))


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def biodata_maker_saved_list(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in to see your saved biodatas."}, status=401)

    orders = PrintOrder.objects.filter(user=user, service_key="biodata_maker").order_by("-created_at")[:100]
    return JsonResponse({"biodatas": [biodata_order_summary(order) for order in orders]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def biodata_maker_delete(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Please log in."}, status=401)

    deleted, _ = PrintOrder.objects.filter(id=order_id, user=user, service_key="biodata_maker").delete()
    if not deleted:
        return JsonResponse({"message": "Biodata not found."}, status=404)
    return JsonResponse({"ok": True})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def enhance_background_image(request):
    """Refine edges and remove color halo from an already-transparent PNG."""
    if request.method == "OPTIONS":
        return JsonResponse({})

    upload = request.FILES.get("image")
    if not upload:
        return JsonResponse({"message": "Select an image."}, status=400)
    if upload.size > 15 * 1024 * 1024:
        return JsonResponse({"message": "Images must be 15 MB or smaller."}, status=413)
    if (upload.content_type or "").lower() != "image/png":
        return JsonResponse({"message": "Upload a transparent PNG to enhance."}, status=400)

    try:
        result_bytes = enhance_transparent_bytes(upload.read())
    except ProcessingError as error:
        return JsonResponse({"message": str(error)}, status=400)

    base_name = re.sub(r"[^A-Za-z0-9._-]+", "-", upload.name.rsplit(".", 1)[0])[:80] or "image"
    response = HttpResponse(result_bytes, content_type="image/png")
    response["Content-Disposition"] = f'attachment; filename="{base_name}-enhanced.png"'
    response["Cache-Control"] = "no-store"
    return response


@csrf_exempt
@require_http_methods(["POST"])
def website_to_image(request):
    data = parse_body(request)
    target_url = str(data.get("url", "")).strip()
    if target_url and not re.match(r"^https?://", target_url, re.I):
        target_url = f"https://{target_url}"
    parsed = urllib.parse.urlparse(target_url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password:
        return JsonResponse({"message": "Enter a valid public HTTP or HTTPS website URL."}, status=400)
    if not _is_public_hostname(parsed.hostname):
        return JsonResponse({"message": "Local and private network addresses cannot be captured."}, status=400)
    try:
        width = int(data.get("width", 1440))
    except (TypeError, ValueError):
        width = 1440
    if width not in {390, 768, 1280, 1440, 1920}:
        return JsonResponse({"message": "Select a supported browser width."}, status=400)
    output_format = str(data.get("format", "png")).lower()
    if output_format not in {"png", "jpeg"}:
        return JsonResponse({"message": "Output format must be PNG or JPEG."}, status=400)
    if not settings.WEBSITE_SCREENSHOT_API_URL:
        return JsonResponse({"message": "Website screenshot service is not configured on the server."}, status=503)
    payload = json.dumps({"url": target_url, "fullPage": True, "width": width, "format": output_format}).encode("utf-8")
    headers = {"Content-Type": "application/json", "Accept": "image/*"}
    if settings.WEBSITE_SCREENSHOT_API_KEY:
        headers["Authorization"] = f"Bearer {settings.WEBSITE_SCREENSHOT_API_KEY}"
    provider_request = urllib.request.Request(settings.WEBSITE_SCREENSHOT_API_URL, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(provider_request, timeout=settings.WEBSITE_SCREENSHOT_TIMEOUT) as provider_response:
            result = provider_response.read()
            result_type = provider_response.headers.get_content_type()
    except urllib.error.HTTPError as error:
        detail = error.read(2048).decode("utf-8", errors="replace")
        return JsonResponse({"message": "Screenshot provider rejected this website.", "providerDetail": detail}, status=502)
    except (urllib.error.URLError, TimeoutError):
        return JsonResponse({"message": "Website screenshot service is currently unavailable."}, status=502)
    if not result or result_type not in {"image/png", "image/jpeg"}:
        return JsonResponse({"message": "Screenshot provider did not return a valid image."}, status=502)
    extension = "jpg" if result_type == "image/jpeg" else "png"
    safe_host = re.sub(r"[^A-Za-z0-9.-]+", "-", parsed.hostname)[:100]
    response = HttpResponse(result, content_type=result_type)
    response["Content-Disposition"] = f'attachment; filename="{safe_host}-full-page.{extension}"'
    response["Cache-Control"] = "no-store"
    return response


def _is_public_hostname(hostname):
    if hostname.lower() == "localhost":
        return False
    try:
        addresses = {entry[4][0] for entry in socket.getaddrinfo(hostname, None)}
    except socket.gaierror:
        return False
    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            return False
    return bool(addresses)


@csrf_exempt
@require_http_methods(["POST"])
def detect_faces(request):
    """Return normalized face boxes; image bytes are processed in memory only."""
    upload = request.FILES.get("image")
    if not upload:
        return JsonResponse({"message": "Select an image for face detection."}, status=400)
    if upload.size > 15 * 1024 * 1024:
        return JsonResponse({"message": "Images must be 15 MB or smaller."}, status=413)
    if (upload.content_type or "").lower() not in {"image/jpeg", "image/png", "image/webp"}:
        return JsonResponse({"message": "Only JPG, PNG, and WebP images are supported."}, status=400)
    try:
        import cv2
        import numpy as np
    except ImportError:
        return JsonResponse({"message": "Face detection is not available on this server."}, status=503)
    image = cv2.imdecode(np.frombuffer(upload.read(), dtype=np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        return JsonResponse({"message": "This image could not be decoded."}, status=400)
    height, width = image.shape[:2]
    if max(width, height) > 2400:
        ratio = 2400 / max(width, height)
        scan = cv2.resize(image, (round(width * ratio), round(height * ratio)))
    else:
        ratio, scan = 1.0, image
    sensitivity = request.POST.get("sensitivity", "recommended")
    parameters = {"low": (1.16, 7), "recommended": (1.1, 6), "high": (1.07, 4)}
    scale_factor, neighbors = parameters.get(sensitivity, parameters["recommended"])
    gray = cv2.equalizeHist(cv2.cvtColor(scan, cv2.COLOR_BGR2GRAY))
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cascade.detectMultiScale(gray, scaleFactor=scale_factor, minNeighbors=neighbors, minSize=(36, 36))
    if sensitivity != "high" and len(faces):
        largest_area = max(w * h for _, _, w, h in faces)
        faces = [face for face in faces if face[2] * face[3] >= largest_area * 0.18]
    boxes = []
    for x, y, w, h in faces:
        x, y, w, h = (value / ratio for value in (x, y, w, h))
        minimum_area = {"low": 0.012, "recommended": 0.006, "high": 0.003}.get(sensitivity, 0.006)
        if (w * h) / (width * height) < minimum_area:
            continue
        pad_x, pad_y = w * 0.1, h * 0.14
        left, top = max(0, x - pad_x), max(0, y - pad_y)
        right, bottom = min(width, x + w + pad_x), min(height, y + h + pad_y)
        boxes.append({"x": left / width * 100, "y": top / height * 100, "width": (right - left) / width * 100, "height": (bottom - top) / height * 100})
    return JsonResponse({"faces": boxes, "count": len(boxes), "width": width, "height": height})


def public_auth_message(message):
    return JsonResponse({"message": message})


def send_transactional_email(to_email, subject, body, html_body=None):
    send_mail(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [to_email],
        fail_silently=False,
        html_message=html_body,
    )


def create_email_verification(user):
    EmailVerificationToken.objects.filter(user=user, used_at__isnull=True).update(used_at=timezone.now())
    token = EmailVerificationToken.objects.create(
        user=user,
        token=secrets.token_urlsafe(48),
        expires_at=timezone.now() + EMAIL_TOKEN_TTL,
    )
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
    owner_name = user.get_full_name() or "Owner"
    safe_owner_name = escape(owner_name)
    safe_verify_url = escape(verify_url)
    text_body = (
        f"Welcome to RepetiGo, {owner_name}!\n\n"
        "Thank you for creating your RepetiGo account. Please verify your email address to activate your account and start using your print shop dashboard.\n\n"
        f"Verify your account here:\n{verify_url}\n\n"
        "This verification link expires in 24 hours.\n\n"
        "RepetiGo's motive is simple: help cyber cafes and print shops reduce repetitive manual work, protect customer documents, and run faster with AI-powered print automation.\n\n"
        "Thanks for joining us,\n"
        "The RepetiGo Team"
    )
    html_body = f"""
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f8ff;font-family:Inter,Arial,sans-serif;color:#0d1748;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f8ff;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe7f4;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(13,23,72,0.10);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#0d1748 0%,#1d4ed8 62%,#16a1bd 100%);color:#ffffff;">
                <div style="font-size:24px;font-weight:900;letter-spacing:0;">Repeti<span style="color:#93c5fd;">Go</span></div>
                <div style="margin-top:18px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#bfdbfe;">Welcome to RepetiGo</div>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:1.15;font-weight:900;color:#ffffff;">Verify your email address</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px;">
                <p style="margin:0;font-size:17px;line-height:1.7;font-weight:800;color:#0d1748;">Hello {safe_owner_name},</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.75;color:#59658c;">
                  Thank you for creating your RepetiGo account. Please verify your email address to activate your account and start using your Repetigo dashboard.
                </p>
                <div style="margin:26px 0;text-align:center;">
                  <a href="{safe_verify_url}" style="display:inline-block;border-radius:12px;padding:14px 24px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;box-shadow:0 12px 26px rgba(37,99,235,0.24);">Verify Account</a>
                </div>
                <p style="margin:0;font-size:13px;line-height:1.65;color:#7a88a5;">
                  This verification link expires in <strong style="color:#0d1748;">24 hours</strong>. If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="margin:10px 0 0;word-break:break-all;font-size:12px;line-height:1.6;color:#2563eb;">
                  <a href="{safe_verify_url}" style="color:#2563eb;">{safe_verify_url}</a>
                </p>
                <div style="margin-top:26px;border-radius:14px;padding:18px;background:#eef4ff;border:1px solid #dbe7ff;">
                  <p style="margin:0;font-size:14px;line-height:1.75;color:#33415f;">
                    <strong style="color:#0d1748;">Our motive:</strong> RepetiGo helps cyber cafes and print shops reduce repetitive manual work, protect customer documents, and run faster with AI-powered print automation.
                  </p>
                </div>
                <p style="margin:24px 0 0;font-size:15px;line-height:1.75;color:#59658c;">
                  Thanks for joining us,<br />
                  <strong style="color:#0d1748;">The RepetiGo Team</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
    send_transactional_email(
        user.email,
        "Welcome to RepetiGo - verify your email",
        text_body,
        html_body,
    )
    return token


def create_password_reset(user):
    PasswordResetToken.objects.filter(user=user, used_at__isnull=True).update(used_at=timezone.now())
    token = PasswordResetToken.objects.create(
        user=user,
        token=secrets.token_urlsafe(48),
        expires_at=timezone.now() + PASSWORD_RESET_TOKEN_TTL,
    )
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"
    owner_name = user.get_full_name() or "Owner"
    safe_owner_name = escape(owner_name)
    safe_reset_url = escape(reset_url)
    text_body = (
        f"Hello {owner_name},\n\n"
        "We received a request to reset your RepetiGo password.\n\n"
        f"Reset your password here:\n{reset_url}\n\n"
        "This reset link expires in 30 minutes. If you did not request this, you can safely ignore this email.\n\n"
        "RepetiGo's motive is to help print shops work faster while keeping customer documents secure and private.\n\n"
        "Thanks,\n"
        "The RepetiGo Team"
    )
    html_body = f"""
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f8ff;font-family:Inter,Arial,sans-serif;color:#0d1748;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f8ff;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #dfe7f4;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(13,23,72,0.10);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#0d1748 0%,#1d4ed8 62%,#16a1bd 100%);color:#ffffff;">
                <div style="font-size:24px;font-weight:900;letter-spacing:0;">Repeti<span style="color:#93c5fd;">Go</span></div>
                <div style="margin-top:18px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#bfdbfe;">Password security</div>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:1.15;font-weight:900;color:#ffffff;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px;">
                <p style="margin:0;font-size:17px;line-height:1.7;font-weight:800;color:#0d1748;">Hello {safe_owner_name},</p>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.75;color:#59658c;">
                  We received a request to reset your RepetiGo password. Click the button below to choose a new password for your account.
                </p>
                <div style="margin:26px 0;text-align:center;">
                  <a href="{safe_reset_url}" style="display:inline-block;border-radius:12px;padding:14px 24px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:900;box-shadow:0 12px 26px rgba(37,99,235,0.24);">Reset Password</a>
                </div>
                <div style="border-radius:14px;padding:16px;background:#fff7ed;border:1px solid #fed7aa;">
                  <p style="margin:0;font-size:13px;line-height:1.7;color:#7c4a03;">
                    This reset link expires in <strong>30 minutes</strong>. If you did not request this password reset, ignore this email and your current password will stay unchanged.
                  </p>
                </div>
                <p style="margin:18px 0 0;font-size:13px;line-height:1.65;color:#7a88a5;">
                  If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="margin:10px 0 0;word-break:break-all;font-size:12px;line-height:1.6;color:#2563eb;">
                  <a href="{safe_reset_url}" style="color:#2563eb;">{safe_reset_url}</a>
                </p>
                <div style="margin-top:26px;border-radius:14px;padding:18px;background:#eef4ff;border:1px solid #dbe7ff;">
                  <p style="margin:0;font-size:14px;line-height:1.75;color:#33415f;">
                    <strong style="color:#0d1748;">Our motive:</strong> RepetiGo helps cyber cafes and print shops reduce repetitive manual work, protect customer documents, and run faster with AI-powered print automation.
                  </p>
                </div>
                <p style="margin:24px 0 0;font-size:15px;line-height:1.75;color:#59658c;">
                  Thanks,<br />
                  <strong style="color:#0d1748;">The RepetiGo Team</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
    send_transactional_email(
        user.email,
        "Reset your RepetiGo password",
        text_body,
        html_body,
    )
    return token


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


def wallet_balance(user):
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
    return profile.balance


def effective_credit_limit(user):
    """The negative-balance floor for this cafe: a per-cafe
    UserProfile.credit_limit_override if admin has set one, otherwise the
    global WalletSetting "credit_limit". Call sites that already hold a
    locked `profile` row (e.g. charge_wallet_for_tool) should read
    profile.credit_limit_override directly instead of calling this, to avoid
    a second query.
    """
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
    if profile.credit_limit_override is not None:
        return profile.credit_limit_override
    return get_wallet_setting("credit_limit")


def cash_counter_permission_reason(profile):
    """Permission-only check (no balance) - what gates SAVING "Both" as a
    shop's pricing preference. A temporarily low balance shouldn't force the
    owner to re-save their preference once they top up; that's handled
    separately by cash_counter_available for live/order-time gating.
    """
    if not profile.cash_counter_permitted:
        return "Cash Counter is not enabled for your account yet. Contact RepetiGo support to request access."
    return ""


def cash_counter_available(user):
    """Live availability (permission AND current balance) - what gates what
    customers actually see on the storefront and what's enforced at order
    creation. Recomputed fresh every time, never cached on the saved
    preference.
    """
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
    reason = cash_counter_permission_reason(profile)
    if reason:
        return False, reason
    credit_limit = profile.credit_limit_override if profile.credit_limit_override is not None else get_wallet_setting("credit_limit")
    if profile.balance <= credit_limit:
        return False, (
            f"Cash Counter is temporarily locked because your wallet balance (Rs. {profile.balance}) is at or below "
            f"the minimum allowed limit (Rs. {credit_limit}). Top up your wallet to re-enable it."
        )
    return True, ""


def get_wallet_setting(key):
    """Single source of truth for every wallet number (signup bonus, referral
    bonus, grace-credit limit, daily grace-usage cap, commission rate).

    Backed by the DB (edit in Django admin, no redeploy needed). Self-seeds
    a row from WALLET_SETTING_DEFAULTS on first read if one doesn't exist yet,
    so adding a new setting key never requires its own migration.
    """
    setting = WalletSetting.objects.filter(key=key).first()
    if setting and setting.is_active:
        return setting.value
    if setting and not setting.is_active:
        return Decimal("0.00")
    default = WALLET_SETTING_DEFAULTS.get(key, Decimal("0.00"))
    WalletSetting.objects.get_or_create(key=key, defaults={"label": key.replace("_", " ").title(), "value": default})
    return default


def public_wallet_config():
    """Public payload (no auth) - the pricing page and every dashboard screen
    read the same numbers from here, so marketing copy and backend
    enforcement can never drift apart.
    """
    tools = ToolPricing.objects.filter(is_billable=True).order_by("tool_key")
    return {
        "signupBonus": float(get_wallet_setting("signup_bonus")),
        "referralBonus": float(get_wallet_setting("referral_bonus")),
        "creditLimit": float(get_wallet_setting("credit_limit")),
        "dailyGraceLimit": float(get_wallet_setting("daily_grace_limit")),
        "tools": [
            {"toolKey": tool.tool_key, "label": tool.label, "unit": tool.unit, "price": float(tool.price)}
            for tool in tools
        ],
    }


def wallet_collection_summary(user):
    online_collected = (
        WalletTransaction.objects.filter(user=user, kind=WalletTransaction.KIND_ONLINE_ORDER_CREDIT)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )
    cash_collected = (
        WalletTransaction.objects.filter(user=user, kind=WalletTransaction.KIND_CASH_COUNTER_COLLECTION)
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )
    total_collected = (online_collected + cash_collected).quantize(Decimal("0.01"))
    balance = wallet_balance(user)
    net_withdrawable = max(balance, Decimal("0.00")).quantize(Decimal("0.01"))
    return {
        "onlineCollected": online_collected.quantize(Decimal("0.01")),
        "cashCounterCollected": cash_collected.quantize(Decimal("0.01")),
        "totalCollected": total_collected,
        "netWithdrawable": net_withdrawable,
    }


def public_wallet_transaction(transaction):
    return {
        "id": transaction.id,
        "kind": transaction.kind,
        "direction": transaction.direction,
        "amount": float(transaction.amount),
        "affectsBalance": transaction.affects_balance,
        "note": transaction.note,
        "orderId": transaction.order_id,
        "createdAt": transaction.created_at.isoformat(),
    }


def public_withdrawal(withdrawal):
    return {
        "id": withdrawal.id,
        "amount": float(withdrawal.amount),
        "method": withdrawal.method,
        "accountDetail": withdrawal.account_detail,
        "note": withdrawal.note,
        "status": withdrawal.status,
        "createdAt": withdrawal.created_at.isoformat(),
        "updatedAt": withdrawal.updated_at.isoformat(),
    }


def create_wallet_transaction(user, kind, amount, direction, affects_balance=True, order=None, note="", tool_key=""):
    amount = Decimal(amount).quantize(Decimal("0.01"))
    if amount <= 0:
        return None

    # Locking the profile row + writing the ledger entry inside one atomic
    # transaction keeps balance and history from ever going out of sync
    # (no deduction without a matching row, no lost update from two
    # concurrent debits racing on the same wallet).
    with transaction.atomic():
        if order and WalletTransaction.objects.filter(user=user, order=order, kind=kind).exists():
            return None
        if not order and kind == WalletTransaction.KIND_SIGNUP_BONUS and WalletTransaction.objects.filter(user=user, kind=kind).exists():
            return None

        profile, _ = UserProfile.objects.select_for_update().get_or_create(user=user, defaults={"phone": ""})
        balance_after = profile.balance
        if affects_balance:
            if direction == WalletTransaction.DIRECTION_CREDIT:
                balance_after = (profile.balance + amount).quantize(Decimal("0.01"))
            elif direction == WalletTransaction.DIRECTION_DEBIT:
                balance_after = (profile.balance - amount).quantize(Decimal("0.01"))
            profile.balance = balance_after
            profile.save(update_fields=["balance"])

        return WalletTransaction.objects.create(
            user=user,
            order=order,
            tool_key=tool_key,
            kind=kind,
            direction=direction,
            amount=amount,
            affects_balance=affects_balance,
            balance_after=balance_after if affects_balance else None,
            note=note,
        )


def ensure_signup_wallet_bonus(user):
    return create_wallet_transaction(
        user,
        WalletTransaction.KIND_SIGNUP_BONUS,
        get_wallet_setting("signup_bonus"),
        WalletTransaction.DIRECTION_CREDIT,
        True,
        note="Signup bonus credited.",
    )


def tool_price_for_context(tool, order):
    """Effective per-use price for a ToolPricing row: prefers the B2C rate
    when usage is tied to a customer order (order is not None), the B2B rate
    for the cafe's own direct usage (order is None), falling back to the
    shared `price` when the context-specific rate isn't set.
    """
    if order is not None:
        return tool.price_b2c if tool.price_b2c is not None else tool.price
    return tool.price_b2b if tool.price_b2b is not None else tool.price


def charge_wallet_for_tool(user, tool_key, quantity=1, order=None):
    """Deduct RepetiGo's usage fee for a tool from the shop's wallet.

    Call this right after a tool's main action succeeds (HTTP 200). Enforces
    the grace-credit floor (per-cafe UserProfile.credit_limit_override, or
    else the global WalletSetting "credit_limit", e.g. -50) and the per-day
    spend cap while the wallet is at/below zero (WalletSetting
    "daily_grace_limit"). Returns (allowed: bool, message: str, transaction).

    A tool with no ToolPricing row, or is_billable=False, or an effective
    price of 0 is free - this is what keeps PDF/Image tools free today
    without special-casing them here; flip is_billable in Django admin to
    start charging for one.
    """
    tool = ToolPricing.objects.filter(tool_key=tool_key, is_billable=True).first()
    if not tool:
        return True, "", None
    unit_price = tool_price_for_context(tool, order)
    if unit_price <= 0:
        return True, "", None

    price_total = (unit_price * Decimal(quantity)).quantize(Decimal("0.01"))

    # Lock the wallet row for the whole check-then-deduct sequence so two
    # concurrent calls for the same user (double-click, webhook retry)
    # can't both pass the limit checks against the same stale balance and
    # both deduct - the second one re-checks against the now-updated
    # balance once it gets the lock.
    with transaction.atomic():
        profile, _ = UserProfile.objects.select_for_update().get_or_create(user=user, defaults={"phone": ""})
        credit_limit = profile.credit_limit_override if profile.credit_limit_override is not None else get_wallet_setting("credit_limit")
        projected_balance = (profile.balance - price_total).quantize(Decimal("0.01"))

        if projected_balance < credit_limit:
            message = (
                f"Your wallet balance is too low for {tool.label} (minimum allowed balance is Rs. {credit_limit}). "
                "Please top up your wallet to continue."
            )
            # Log the skipped charge even though nothing is deducted, so a
            # service delivered for free (e.g. a print already completed
            # before the wallet is checked) still leaves an audit trail.
            create_wallet_transaction(
                user,
                WalletTransaction.KIND_TOOL_USAGE_BLOCKED,
                price_total,
                WalletTransaction.DIRECTION_INFO,
                False,
                order=order,
                tool_key=tool_key,
                note=f"{tool.label} usage NOT charged (below credit limit): {message}",
            )
            return False, message, None

        if profile.balance <= Decimal("0.00"):
            daily_limit = get_wallet_setting("daily_grace_limit")
            today = timezone.localdate()
            used_today = (
                WalletTransaction.objects.filter(
                    user=user,
                    kind=WalletTransaction.KIND_TOOL_USAGE,
                    balance_after__lt=Decimal("0.00"),
                    created_at__date=today,
                )
                .aggregate(total=Sum("amount"))
                .get("total")
                or Decimal("0.00")
            )
            if used_today + price_total > daily_limit:
                message = (
                    f"You've reached today's free-usage limit (Rs. {daily_limit}/day while your wallet balance is low). "
                    "Please top up your wallet to keep using paid tools today."
                )
                create_wallet_transaction(
                    user,
                    WalletTransaction.KIND_TOOL_USAGE_BLOCKED,
                    price_total,
                    WalletTransaction.DIRECTION_INFO,
                    False,
                    order=order,
                    tool_key=tool_key,
                    note=f"{tool.label} usage NOT charged (daily grace limit reached): {message}",
                )
                return False, message, None

        wallet_txn = create_wallet_transaction(
            user,
            WalletTransaction.KIND_TOOL_USAGE,
            price_total,
            WalletTransaction.DIRECTION_DEBIT,
            True,
            order=order,
            tool_key=tool_key,
            note=f"{tool.label} usage" + (f" x{quantity}" if quantity != 1 else "") + ".",
        )
        return True, "", wallet_txn


def wallet_usage_gate(user, tool_key, quantity=1, order=None):
    """Pre-flight check only (no charge) - use before starting a job so a
    shop already past its limit is blocked immediately, without waiting for
    the job to run. The real deduction still happens via charge_wallet_for_tool
    once the job actually succeeds.
    """
    tool = ToolPricing.objects.filter(tool_key=tool_key, is_billable=True).first()
    if not tool or tool_price_for_context(tool, order) <= 0:
        return True, ""
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
    credit_limit = profile.credit_limit_override if profile.credit_limit_override is not None else get_wallet_setting("credit_limit")
    if profile.balance <= credit_limit:
        return False, (
            f"Wallet balance has reached the minimum allowed limit (Rs. {credit_limit}). "
            "Please top up your wallet before starting new paid jobs."
        )
    return True, ""


def settle_printed_order_wallet(order):
    if order.status != PrintOrder.STATUS_PRINTED:
        return
    if order.payment_status == PrintOrder.PAYMENT_PAID:
        create_wallet_transaction(
            order.user,
            WalletTransaction.KIND_ONLINE_ORDER_CREDIT,
            order.total_amount,
            WalletTransaction.DIRECTION_CREDIT,
            True,
            order=order,
            note=f"Online paid order completed: {order.token_id or order.id}.",
        )
    elif order.payment_status == PrintOrder.PAYMENT_CASH_COUNTER:
        create_wallet_transaction(
            order.user,
            WalletTransaction.KIND_CASH_COUNTER_COLLECTION,
            order.total_amount,
            WalletTransaction.DIRECTION_INFO,
            False,
            order=order,
            note=f"Cash collected by cafe for order: {order.token_id or order.id}.",
        )

    tool_key, quantity = print_order_tool_usage(order)
    if tool_key:
        _allowed, _message, fee_txn = charge_wallet_for_tool(order.user, tool_key, quantity=quantity, order=order)
        if fee_txn:
            accrue_referral_commission(order, fee_txn)


def accrue_referral_commission(order, fee_txn):
    """If this shop was referred by a Referral Agent, credit the agent a cut
    of the usage-fee RepetiGo just charged the shop - hooked right where the
    fee itself is deducted so it never runs without a matching charge.
    create_wallet_transaction's own (user, order, kind) dedupe check keeps a
    retried settlement (see the module-level double-settlement note on
    agent_job_status) from crediting the same commission twice.
    """
    shop = getattr(order.user, "shop", None)
    agent = getattr(shop, "referred_by_agent", None) if shop else None
    if not agent or agent.status != Agent.STATUS_ACTIVE:
        return

    if agent.commission_type == Agent.COMMISSION_PERCENTAGE:
        commission = (fee_txn.amount * agent.commission_rate / Decimal("100")).quantize(Decimal("0.01"))
    else:
        commission = agent.commission_rate

    if commission <= 0:
        return

    create_wallet_transaction(
        agent.user,
        WalletTransaction.KIND_REFERRAL_COMMISSION,
        commission,
        WalletTransaction.DIRECTION_CREDIT,
        True,
        order=order,
        note=f"Referral commission from {shop.shop_name or order.user.email} ({order.token_id or order.id}).",
    )


def resolve_print_tool_key(service_key, price_item_id):
    """Map a print/passport service + price item to the ToolPricing key
    RepetiGo bills the shop's wallet for. Returns None for anything not
    billed per-job.
    """
    if service_key == "auto_document_print":
        return "print_color_page" if price_item_id == "color" else "print_bw_page"
    if service_key == "passport_photo":
        return "passport_photo"
    return None


def print_order_tool_usage(order):
    """(tool_key, quantity) for a completed PrintOrder - see resolve_print_tool_key."""
    tool_key = resolve_print_tool_key(order.service_key, order.price_item_id)
    if not tool_key:
        return None, 0
    quantity = 1 if order.service_key == "passport_photo" else max(order.pages, 1) * max(order.copies, 1)
    return tool_key, quantity


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


def public_order(order, include_media=True):
    token_id = order.token_id or f"{order.shop_code}-T{order.token_number:03d}"
    is_passport = order.service_key == "passport_photo"
    if is_passport:
        # Raw upload and AI result live as base64 data URIs directly on the
        # order row for this service - no file on disk to build a URL for.
        # Orders created before this switched over still have a real file
        # instead, so fall back to that. These base64 payloads can be
        # hundreds of KB each, so list views (include_media=False) skip them
        # and only expose hasRawPhoto/hasGeminiPhoto - the full data is
        # fetched on demand via order_detail when a single order is opened.
        file_name = "passport-photo.jpg"
        has_raw_photo = bool(order.original_filename.startswith("data:") or order.document)
        if order.original_filename.startswith("data:"):
            file_url = order.original_filename if include_media else ""
            document_deleted = False
        elif order.document:
            file_url = order.document.url
            document_deleted = False
        else:
            file_url = ""
            document_deleted = True
        has_gemini_photo = bool(order.gemini_photo)
        gemini_photo_value = order.gemini_photo if include_media else ""
    else:
        has_document = bool(order.document)
        file_name = order.original_filename
        file_url = order.document.url if has_document else ""
        document_deleted = not has_document
        has_raw_photo = has_document
        has_gemini_photo = False
        gemini_photo_value = ""
    return {
        "id": order.id,
        "orderNumber": f"{order.shop_code}-{order.id:05d}",
        "tokenId": token_id,
        "tokenNumber": order.token_number,
        "shopCode": order.shop_code,
        "serviceKey": order.service_key,
        "serviceName": order.service_name,
        "priceItemId": order.price_item_id,
        "priceLabel": order.price_label,
        "rate": float(order.rate),
        "pages": order.pages,
        "copies": order.copies,
        "totalAmount": float(order.total_amount),
        "paymentMode": order.payment_mode,
        "paymentStatus": order.payment_status,
        "paymentGateway": order.payment_gateway,
        "status": order.status,
        "fileName": file_name,
        "fileUrl": file_url,
        "documentDeleted": document_deleted,
        "hasRawPhoto": has_raw_photo,
        "hasGeminiPhoto": has_gemini_photo,
        "customerPhone": order.customer_phone,
        "createdAt": order.created_at.isoformat(),
        "paidAt": order.paid_at.isoformat() if order.paid_at else "",
        "printedAt": order.printed_at.isoformat() if order.printed_at else "",
        "attireCategory": order.attire_category,
        "geminiPhoto": gemini_photo_value,
        "photoStatus": order.photo_status,
        "photoErrorMessage": (
            friendly_photo_error_message(order.photo_error_message, f"{order.service_name or 'Passport Size Photo'} generation failed.")
            if order.photo_status == PrintOrder.PHOTO_STATUS_FAILED
            else order.photo_error_message
        ),
        "passportPrompt": order.passport_prompt,
    }


def upi_transaction_ref(order):
    return re.sub(r"[^A-Za-z0-9]", "", f"{order.shop_code}{order.id:05d}")[:35]


def upi_payment_note(order):
    return upi_transaction_ref(order)


def upi_status_payload(order):
    return {"notes": upi_payment_note(order)}


def normalize_status_value(value):
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def normalize_upi_note(value):
    return re.sub(r"[^a-z0-9]", "", str(value or "").lower())


def payment_amount_matches(value, expected):
    try:
        return money(value) == money(expected)
    except (InvalidOperation, TypeError, ValueError):
        return False


def positive_count(value):
    try:
        return int(value or 0) > 0
    except (TypeError, ValueError):
        return False


def upi_response_is_success(payload, order):
    if not isinstance(payload, dict):
        return False

    expected_notes = {
        normalize_upi_note(upi_payment_note(order)),
        normalize_upi_note(f"{order.shop_code}-{order.id:05d}"),
    }
    records = payload.get("data") if isinstance(payload.get("data"), list) else []
    for record in records:
        if not isinstance(record, dict):
            continue
        record_note = normalize_upi_note(record.get("notes"))
        amount_ok = payment_amount_matches(record.get("amount") or record.get("net_amount"), order.total_amount)
        if record_note in expected_notes and amount_ok:
            return True

    if positive_count(payload.get("count")) and not records:
        return True

    success_values = {"success", "successful", "paid", "completed", "complete", "captured", "approved", "true", "1"}
    for key in ("status", "payment_status", "paymentStatus", "txn_status", "txnStatus", "result", "message"):
        if normalize_status_value(payload.get(key)) in success_values:
            return True

    for key in ("success", "paid", "is_paid", "isPaid", "completed"):
        value = payload.get(key)
        if value is True or normalize_status_value(value) in success_values:
            return True

    data = payload.get("data")
    return upi_response_is_success(data, order) if isinstance(data, dict) else False


def call_upi_status_api(order):
    payload = upi_status_payload(order)
    attempts = [
        (
            json.dumps(payload).encode("utf-8"),
            {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            },
        )
    ]
    last_error = ""

    for body, headers in attempts:
        request = urllib.request.Request(UPI_PAYMENT_STATUS_URL, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                raw = response.read().decode("utf-8", errors="replace")
                try:
                    return json.loads(raw)
                except json.JSONDecodeError:
                    return {"status": raw.strip()}
        except urllib.error.HTTPError as error:
            last_error = error.read().decode("utf-8", errors="replace") or str(error)
        except urllib.error.URLError as error:
            last_error = str(error.reason)
        except TimeoutError:
            last_error = "Payment status check timed out."

    return {"status": "error", "message": last_error or "Payment status check failed."}


def razorpay_request(path, payload, config):
    credentials = base64.b64encode(f'{config["key_id"]}:{config["key_secret"]}'.encode()).decode()
    request = urllib.request.Request(
        f"https://api.razorpay.com/v1/{path}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Basic {credentials}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8")), None
    except urllib.error.HTTPError as error:
        try:
            detail = json.loads(error.read().decode("utf-8")).get("error", {}).get("description")
        except (json.JSONDecodeError, AttributeError):
            detail = None
        return None, detail or "Razorpay rejected the payment request."
    except (urllib.error.URLError, TimeoutError):
        return None, "Razorpay is temporarily unavailable. Please try again."


PAYU_TEST_ACTION_URL = "https://test.payu.in/_payment"
PAYU_LIVE_ACTION_URL = "https://secure.payu.in/_payment"


def payu_action_url(config):
    return PAYU_LIVE_ACTION_URL if config.get("mode") == "live" else PAYU_TEST_ACTION_URL


def payu_hash(key, txnid, amount, productinfo, firstname, email, salt):
    # PayU hosted-checkout request hash: key|txnid|amount|productinfo|firstname|email|udf1..udf10|salt.
    # We don't use udf1-10, so all ten stay empty.
    parts = [key, txnid, amount, productinfo, firstname, email] + [""] * 10 + [salt]
    return hashlib.sha512("|".join(parts).encode("utf-8")).hexdigest()


def payu_reverse_hash(salt, status, key, txnid, amount, productinfo, firstname, email):
    # Response hash is the same fields reversed, salt first, key last (still empty udf1-10).
    parts = [salt, status] + [""] * 10 + [email, firstname, productinfo, amount, txnid, key]
    return hashlib.sha512("|".join(parts).encode("utf-8")).hexdigest()


PHONEPE_TEST_AUTH_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token"
PHONEPE_LIVE_AUTH_URL = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
PHONEPE_TEST_PAY_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay"
PHONEPE_LIVE_PAY_URL = "https://api.phonepe.com/apis/pg/checkout/v2/pay"
PHONEPE_TEST_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/{}/status"
PHONEPE_LIVE_STATUS_URL = "https://api.phonepe.com/apis/pg/checkout/v2/order/{}/status"


def phonepe_urls(config):
    live = config.get("mode") == "live"
    return {
        "auth": PHONEPE_LIVE_AUTH_URL if live else PHONEPE_TEST_AUTH_URL,
        "pay": PHONEPE_LIVE_PAY_URL if live else PHONEPE_TEST_PAY_URL,
        "status": PHONEPE_LIVE_STATUS_URL if live else PHONEPE_TEST_STATUS_URL,
    }


def phonepe_access_token(config):
    # Standard Checkout v2 auth: client credentials -> short-lived O-Bearer token.
    # Fetched fresh per order (no caching) - simplest thing that works at this volume.
    body = urllib.parse.urlencode({
        "client_id": config.get("client_id", ""),
        "client_version": config.get("client_version") or "1",
        "client_secret": config.get("client_secret", ""),
        "grant_type": "client_credentials",
    }).encode("utf-8")
    request = urllib.request.Request(
        phonepe_urls(config)["auth"], data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
            token = payload.get("access_token")
            return (token, None) if token else (None, "PhonePe did not return an access token.")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        return None, detail or "PhonePe authentication failed."
    except (urllib.error.URLError, TimeoutError):
        return None, "PhonePe is temporarily unavailable. Please try again."


def phonepe_api_call(method, url, token, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url, data=data, method=method,
        headers={"Content-Type": "application/json", "Authorization": f"O-Bearer {token}"},
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8")), None
    except urllib.error.HTTPError as error:
        try:
            detail = json.loads(error.read().decode("utf-8")).get("message")
        except (json.JSONDecodeError, AttributeError):
            detail = None
        return None, detail or "PhonePe rejected the payment request."
    except (urllib.error.URLError, TimeoutError):
        return None, "PhonePe is temporarily unavailable. Please try again."


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


def file_to_data_uri(uploaded_file):
    """Read an uploaded/opened file fully and return it as a base64 data URI.

    Used for passport-photo orders, where the raw upload and the AI result
    are stored directly in the DB (original_filename/gemini_photo) instead
    of on disk.
    """
    content_type = getattr(uploaded_file, "content_type", None) or mimetypes.guess_type(uploaded_file.name)[0] or "image/jpeg"
    encoded = base64.b64encode(uploaded_file.read()).decode("ascii")
    return f"data:{content_type};base64,{encoded}"


def data_uri_to_bytes(data_uri):
    """Split a `data:<mime>;base64,<data>` string into (content_type, bytes)."""
    header, _, encoded = data_uri.partition(",")
    content_type = "image/jpeg"
    if header.startswith("data:") and ";base64" in header:
        content_type = header[len("data:"):].split(";base64", 1)[0] or content_type
    return content_type, base64.b64decode(encoded)


def friendly_photo_error_message(message, fallback="Passport Size Photo generation failed. Please try again."):
    """The agent occasionally relays a raw server error page or .NET
    exception text (e.g. after an HTTP 500) instead of a short message -
    never store/show that verbatim."""
    text = str(message or "").strip()
    if not text or len(text) > 200 or "<" in text or text.startswith("HTTP ") or text.startswith("Response status code"):
        return fallback
    return text


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_TIMEOUT = int(os.environ.get("GEMINI_TIMEOUT") or 60)
GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image"
GEMINI_IMAGE_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_IMAGE_MODEL}:generateContent"


def generate_passport_photo_with_gemini(prompt, image_bytes, content_type):
    """Call the Gemini image API directly from the server, keyed off
    GEMINI_API_KEY in .env. Returns (content_type, bytes) on success, or
    (None, error_message) on failure - never raises."""
    if not GEMINI_API_KEY:
        return None, "Gemini fallback is not configured."

    body = json.dumps({
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": content_type, "data": base64.b64encode(image_bytes).decode("ascii")}},
            ],
        }],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode("utf-8")

    request = urllib.request.Request(
        GEMINI_IMAGE_API_URL,
        data=body,
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=GEMINI_TIMEOUT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        return None, f"Gemini API error: {detail[:200]}"
    except (urllib.error.URLError, TimeoutError):
        return None, "Gemini API is temporarily unavailable."
    except Exception:
        logger.exception("generate_passport_photo_with_gemini: unexpected failure calling Gemini")
        return None, "Gemini API call failed unexpectedly."

    candidates = payload.get("candidates") or []
    parts = ((candidates[0].get("content") or {}) if candidates else {}).get("parts") or []
    for part in parts:
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            result_type = inline.get("mimeType") or inline.get("mime_type") or "image/png"
            return result_type, base64.b64decode(inline["data"])

    return None, "Gemini did not return an image."


def apply_gemini_fallback(order):
    """Last resort when the desktop PrintPilot Agent fails to produce a
    passport photo (offline, crashed, or timed out): generate it directly
    from the server via the Gemini API so the customer still gets their
    photo instead of a bare error. Mutates and saves `order` in place.
    Returns True if the fallback produced a usable photo."""
    if not order.original_filename:
        return False

    content_type, image_bytes = data_uri_to_bytes(order.original_filename)
    result_type, result = generate_passport_photo_with_gemini(order.passport_prompt, image_bytes, content_type)
    if not result_type:
        logger.warning("Gemini fallback failed for passport order %s: %s", order.id, result)
        return False

    cleaned_bytes = remove_gemini_watermark(result, result_type)
    encoded = base64.b64encode(cleaned_bytes).decode("ascii")

    order.gemini_photo = f"data:{result_type};base64,{encoded}"
    order.photo_status = PrintOrder.PHOTO_STATUS_DONE
    order.photo_error_message = ""
    order.photo_updated_at = timezone.now()
    order.save(update_fields=["gemini_photo", "photo_status", "photo_error_message", "photo_updated_at"])
    charge_wallet_for_tool(order.user, "passport_photo", quantity=1, order=order)
    return True


def pricing_rate(settings, price_item_id, pages, fallback_rate):
    price_items = settings.get("priceItems", []) if isinstance(settings, dict) else []
    selected_item = next((item for item in price_items if str(item.get("id", "")) == str(price_item_id)), None)
    if not selected_item:
        return fallback_rate

    for page_range in selected_item.get("ranges", []) or []:
        min_pages = positive_int(page_range.get("minPages"), 1)
        max_value = page_range.get("maxPages")
        max_pages = None if max_value in ("", None) else positive_int(max_value, min_pages)
        if pages >= min_pages and (max_pages is None or pages <= max_pages):
            return money(page_range.get("rate"))

    return money(selected_item.get("rate"))


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


def issue_tokens(user):
    # Each login/verification creates its OWN AuthToken row rather than reusing one
    # shared row per user - a browser tab and the desktop Print Agent (or any other
    # concurrent client) can otherwise stomp on each other's access key every time
    # either one refreshes, causing intermittent 401s ("Could not start the photo
    # request.") even though both sessions are individually valid.
    now = timezone.now()
    return AuthToken.objects.create(
        user=user,
        key=secrets.token_hex(32),
        access_expires_at=now + ACCESS_TOKEN_TTL,
        refresh_key=secrets.token_hex(48),
        refresh_expires_at=now + REFRESH_TOKEN_TTL,
    )


def token_response(user, status=200):
    token = issue_tokens(user)
    shop, _ = ShopProfile.objects.get_or_create(user=user)
    return JsonResponse(
        {
            "token": token.key,
            "refreshToken": token.refresh_key,
            "accessTokenExpiresAt": token.access_expires_at.isoformat(),
            "refreshTokenExpiresAt": token.refresh_expires_at.isoformat(),
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


def delete_user_files(user):
    for order in PrintOrder.objects.filter(user=user).exclude(document=""):
        if order.document:
            order.document.delete(save=False)


def client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or None

@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def check_server_status(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    return JsonResponse({"status": "ok", "message": "Server is running version7."})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def contact_message(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    full_name = str(body.get("fullName", "")).strip()
    email = str(body.get("email", "")).strip().lower()
    phone = str(body.get("phone", "")).strip()
    subject = str(body.get("subject", "")).strip()
    message = str(body.get("message", "")).strip()

    if len(full_name) < 2:
        return JsonResponse({"message": "Enter your full name."}, status=400)
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return JsonResponse({"message": "Enter a valid email address."}, status=400)
    if phone and not re.match(r"^[0-9+\-\s()]{7,24}$", phone):
        return JsonResponse({"message": "Enter a valid phone number."}, status=400)
    if len(subject) < 2:
        return JsonResponse({"message": "Choose a subject."}, status=400)
    if len(message) < 10:
        return JsonResponse({"message": "Message must be at least 10 characters."}, status=400)
    if len(message) > 5000:
        return JsonResponse({"message": "Message must be under 5000 characters."}, status=400)

    contact = ContactMessage.objects.create(
        full_name=full_name,
        email=email,
        phone=phone,
        subject=subject,
        message=message,
        ip_address=client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
    )

    return JsonResponse(
        {
            "message": "Message received. We will reply within 24 hours.",
            "contact": {
                "id": contact.id,
                "fullName": contact.full_name,
                "email": contact.email,
                "subject": contact.subject,
                "createdAt": contact.created_at.isoformat(),
            },
        },
        status=201,
    )

DISPOSABLE_EMAIL_DOMAINS = {
    "mailinator.com", "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmailo.com",
    "guerrillamail.com", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de",
    "guerrillamail.net", "guerrillamail.org", "guerrillamailblock.com", "sharklasers.com",
    "10minutemail.com", "10minutemail.net", "20minutemail.com", "throwawaymail.com",
    "yopmail.com", "yopmail.fr", "yopmail.net", "trashmail.com", "trashmail.me",
    "trashmail.net", "trash-mail.com", "getnada.com", "nada.email", "fakeinbox.com",
    "dispostable.com", "mohmal.com", "emailondeck.com", "mintemail.com", "moakt.com",
    "spamgourmet.com", "mytemp.email", "tempinbox.com", "33mail.com", "maildrop.cc",
    "mailnesia.com", "harakirimail.com", "tmpmail.org", "tmpmail.net", "fakemailgenerator.com",
    "crazymailing.com", "mailcatch.com", "mailexpire.com", "e4ward.com", "spam4.me",
    "incognitomail.org", "mytrashmail.com", "no-spam.ws", "spambox.us", "trbvm.com",
    "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org", "mailnull.com", "discard.email",
    "discardmail.com", "discardmail.de", "sogetthis.com", "tempr.email", "burnermail.io",
    "luxusmail.org", "mailsac.com", "mailtemp.info", "tempmailaddress.com", "throwam.com",
    "getairmail.com", "anonbox.net", "airmail.cc", "byom.de", "correotemporal.org",
    "einrot.com", "fake-mail.net", "fakemail.net", "jetable.org", "kasmail.com",
    "kurzepost.de", "letthemeatspam.com", "mail-temporaire.fr", "mailimate.com",
    "mailme.lv", "meltmail.com", "objectmail.com", "proxymail.eu", "rcpt.at",
    "spamfree24.org", "spamherelots.com", "spamhereplease.com", "spamthisplease.com",
    "tempemail.net", "tempymail.com", "thankyou2010.com", "trash2009.com", "veryrealemail.com",
    "zippymail.info", "one-time.email", "inboxbear.com", "tempmailbox.com", "emailfake.com",
    "moakt.cc", "moakt.ws", "vpsmail.com", "disbox.net", "disbox.org",
}


def is_disposable_email(email):
    domain = email.rsplit("@", 1)[-1].strip().lower()
    return domain in DISPOSABLE_EMAIL_DOMAINS


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
    referral_code = str(body.get("referralCode", "")).strip()

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return JsonResponse({"message": "Enter a valid email address."}, status=400)
    if is_disposable_email(email):
        return JsonResponse({"message": "Temporary or disposable email addresses are not allowed. Please use a permanent email address."}, status=400)
    if len(full_name) < 2:
        return JsonResponse({"message": "Enter your full name."}, status=400)
    if not re.match(r"^\d{10}$", phone):
        return JsonResponse({"message": "Mobile number must be exactly 10 digits."}, status=400)
    if len(password) < 8:
        return JsonResponse({"message": "Password must be at least 8 characters."}, status=400)
    if User.objects.filter(username=email).exists():
        return JsonResponse({"message": "Account already exists. Please login."}, status=409)

    # An unknown/inactive code is silently ignored rather than rejected - a
    # typo'd referral code shouldn't block someone from signing up at all.
    referring_agent = Agent.objects.filter(referral_code=referral_code, status=Agent.STATUS_ACTIVE).first() if referral_code else None

    user = User.objects.create_user(username=email, email=email, password=password)
    user.first_name = full_name
    user.is_active = False
    user.save(update_fields=["first_name", "is_active"])
    UserProfile.objects.create(user=user, phone=phone)
    ShopProfile.objects.create(user=user, shop_name="Cyber Cafe Shankar", mobile=phone, whatsapp=phone, email=email, referred_by_agent=referring_agent)
    try:
        create_email_verification(user)
    except Exception:
        user.delete()
        return JsonResponse({"message": "Could not send verification email. Check SMTP settings and try again."}, status=500)
    return JsonResponse({"message": "Account created. Please verify your email before login."}, status=201)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def login_user(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    inactive_user = User.objects.filter(username=email, is_active=False).first()
    if inactive_user and inactive_user.check_password(password):
        return JsonResponse({"message": "Please verify your email before login."}, status=403)

    user = authenticate(username=email, password=password)
    if not user:
        return JsonResponse({"message": "Invalid email or password."}, status=401)

    return token_response(user)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def verify_email(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    token_value = str(body.get("token", "")).strip()
    token = EmailVerificationToken.objects.select_related("user").filter(token=token_value, used_at__isnull=True).first()
    if not token or token.expires_at <= timezone.now():
        return JsonResponse({"message": "Verification link is invalid or expired."}, status=400)

    token.used_at = timezone.now()
    token.user.is_active = True
    token.user.save(update_fields=["is_active"])
    token.save(update_fields=["used_at"])
    ensure_signup_wallet_bonus(token.user)
    return token_response(token.user)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def resend_verification(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    user = User.objects.filter(username=email).first()
    if user and not user.is_active:
        try:
            create_email_verification(user)
        except Exception:
            return JsonResponse({"message": "Could not send verification email. Try again later."}, status=500)
    return JsonResponse({"message": "If this account needs verification, a new email has been sent."})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def request_password_reset(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()
    user = User.objects.filter(username=email, is_active=True).first()
    if user:
        try:
            create_password_reset(user)
        except Exception:
            return JsonResponse({"message": "Could not send reset email. Try again later."}, status=500)
    return JsonResponse({"message": "If an active account exists, a password reset link has been sent."})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def reset_password(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    body = parse_body(request)
    token_value = str(body.get("token", "")).strip()
    password = str(body.get("password", ""))
    if len(password) < 8:
        return JsonResponse({"message": "Password must be at least 8 characters."}, status=400)

    token = PasswordResetToken.objects.select_related("user").filter(token=token_value, used_at__isnull=True).first()
    if not token or token.expires_at <= timezone.now():
        return JsonResponse({"message": "Reset link is invalid or expired."}, status=400)
    if not token.user.is_active:
        return JsonResponse({"message": "Please verify your email before resetting password."}, status=403)

    token.user.set_password(password)
    token.user.save(update_fields=["password"])
    token.used_at = timezone.now()
    token.save(update_fields=["used_at"])
    return JsonResponse({"message": "Password reset successful. Please login with your new password."})


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
@require_http_methods(["GET", "OPTIONS"])
def wallet_config(request):
    """Public, unauthenticated - signup bonus, referral bonus, wallet grace
    limit, daily grace-usage cap, and billable tool prices. The pricing page
    and every dashboard screen fetch this same payload, so the numbers shown
    to a visitor and the numbers actually enforced server-side can't diverge.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})
    return JsonResponse(public_wallet_config())


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def wallet(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    ledger_page = positive_int(request.GET.get("ledgerPage"), 1)
    ledger_page_size = min(positive_int(request.GET.get("ledgerPageSize"), 8), 50)
    ledger_type = str(request.GET.get("ledgerType", "all")).strip()
    ledger_from = parse_date(str(request.GET.get("ledgerFrom", "")).strip())
    ledger_to = parse_date(str(request.GET.get("ledgerTo", "")).strip())

    transactions_query = WalletTransaction.objects.filter(user=user).select_related("order")
    if ledger_type == "withdrawable":
        transactions_query = transactions_query.filter(affects_balance=True)
    elif ledger_type == "tracked":
        transactions_query = transactions_query.filter(affects_balance=False)
    if ledger_from:
        transactions_query = transactions_query.filter(created_at__date__gte=ledger_from)
    if ledger_to:
        transactions_query = transactions_query.filter(created_at__date__lte=ledger_to)

    transaction_count = transactions_query.count()
    ledger_total_pages = max((transaction_count + ledger_page_size - 1) // ledger_page_size, 1)
    ledger_page = min(ledger_page, ledger_total_pages)
    ledger_start = (ledger_page - 1) * ledger_page_size
    ledger_end = ledger_start + ledger_page_size
    transactions = transactions_query[ledger_start:ledger_end]
    withdrawals = WithdrawalRequest.objects.filter(user=user)[:50]
    collection_summary = wallet_collection_summary(user)
    pending_withdrawal = (
        WithdrawalRequest.objects.filter(user=user, status=WithdrawalRequest.STATUS_PENDING).aggregate(total=Sum("amount")).get("total")
        or Decimal("0.00")
    )
    paid_withdrawal = (
        WithdrawalRequest.objects.filter(user=user, status=WithdrawalRequest.STATUS_PAID).aggregate(total=Sum("amount")).get("total")
        or Decimal("0.00")
    )

    balance = wallet_balance(user)
    credit_limit = effective_credit_limit(user)
    daily_grace_limit = get_wallet_setting("daily_grace_limit")
    today_grace_used = (
        WalletTransaction.objects.filter(
            user=user,
            kind=WalletTransaction.KIND_TOOL_USAGE,
            balance_after__lt=Decimal("0.00"),
            created_at__date=timezone.localdate(),
        )
        .aggregate(total=Sum("amount"))
        .get("total")
        or Decimal("0.00")
    )

    return JsonResponse(
        {
            "balance": float(balance),
            "summary": {
                "onlineCollected": float(collection_summary["onlineCollected"]),
                "cashCounterCollected": float(collection_summary["cashCounterCollected"]),
                "totalCollected": float(collection_summary["totalCollected"]),
                "netWithdrawable": float(collection_summary["netWithdrawable"]),
                "pendingWithdrawal": float(pending_withdrawal),
                "paidWithdrawal": float(paid_withdrawal),
            },
            "limits": {
                "creditLimit": float(credit_limit),
                "dailyGraceLimit": float(daily_grace_limit),
                "todayGraceUsed": float(today_grace_used),
                "isLowBalance": balance <= Decimal("0.00"),
                "isBlocked": balance <= credit_limit,
            },
            "transactions": [public_wallet_transaction(transaction) for transaction in transactions],
            "ledgerPagination": {
                "page": ledger_page,
                "pageSize": ledger_page_size,
                "total": transaction_count,
                "totalPages": ledger_total_pages,
            },
            "withdrawals": [public_withdrawal(withdrawal) for withdrawal in withdrawals],
        }
    )


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def request_withdrawal(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    amount = money(body.get("amount"))
    method = str(body.get("method", "")).strip()
    account_detail = str(body.get("accountDetail", "")).strip()
    note = str(body.get("note", "")).strip()

    if amount < Decimal("1.00"):
        return JsonResponse({"message": "Withdrawal amount must be at least Rs. 1."}, status=400)
    if method not in {"UPI", "Bank"}:
        return JsonResponse({"message": "Choose UPI or Bank withdrawal method."}, status=400)
    if len(account_detail) < 3:
        return JsonResponse({"message": "Enter UPI ID or bank account details."}, status=400)
    if method == "UPI" and not UPI_ID_PATTERN.match(account_detail):
        return JsonResponse({"message": "Enter a valid UPI ID like name@bank or mobile@upi."}, status=400)
    # Lock the wallet row before re-checking withdrawable balance so two
    # concurrent withdrawal requests can't both pass the check against the
    # same stale balance and both create a debit.
    with transaction.atomic():
        UserProfile.objects.select_for_update().get_or_create(user=user, defaults={"phone": ""})
        net_withdrawable = wallet_collection_summary(user)["netWithdrawable"]
        if net_withdrawable < amount:
            return JsonResponse({"message": "Amount is higher than your withdrawable wallet balance."}, status=400)

        withdrawal = WithdrawalRequest.objects.create(user=user, amount=amount, method=method, account_detail=account_detail, note=note)
        create_wallet_transaction(
            user,
            WalletTransaction.KIND_WITHDRAWAL,
            amount,
            WalletTransaction.DIRECTION_DEBIT,
            True,
            note=f"Withdrawal requested via {method}.",
        )

    return JsonResponse({"withdrawal": public_withdrawal(withdrawal), "balance": float(wallet_balance(user))}, status=201)


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
@require_http_methods(["POST", "DELETE", "OPTIONS"])
def delete_account_by_email(request):
    """Auth + current-password required - previously this accepted just an
    email with no auth at all, meaning anyone who knew a cafe owner's email
    could permanently delete their account, orders, and wallet history with
    a single unauthenticated POST. Now it can only delete the CALLER's own
    account, and only after confirming their password (same check as
    change_password), closing that gap.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    account = auth_user(request)
    if not account:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    password = str(body.get("password", ""))
    if not account.check_password(password):
        return JsonResponse({"message": "Current password is incorrect."}, status=400)

    deleted_email = account.email or account.username
    with transaction.atomic():
        delete_user_files(account)
        account.delete()

    return JsonResponse({"message": "Account deleted successfully.", "email": deleted_email})


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
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
        available, reason = cash_counter_available(user)
        return JsonResponse({
            "services": [public_pricing(item) for item in pricing],
            "cashCounter": {"permitted": profile.cash_counter_permitted, "available": available, "reason": reason},
        })

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
    existing_settings = pricing.settings if isinstance(pricing.settings, dict) else {}
    merged_settings = {**default_service["settings"], **existing_settings, **settings}
    if merged_settings.get("paymentMode") == "Both":
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
        permission_reason = cash_counter_permission_reason(profile)
        if permission_reason:
            return JsonResponse({"message": permission_reason}, status=403)
    pricing.settings = merged_settings
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
    if not bool((pricing.settings or {}).get("isOpen", True)):
        return JsonResponse({"message": "This print shop is currently closed. Please try again when the service is open."}, status=403)

    pages = positive_int(request.POST.get("pages"), 1)
    copies = positive_int(request.POST.get("copies"), 1)
    price_item_id = str(request.POST.get("priceItemId", "")).strip()
    rate = pricing_rate(pricing.settings, price_item_id, pages, money(request.POST.get("rate")))
    total = money(request.POST.get("totalAmount"))
    calculated_total = (rate * pages * copies).quantize(Decimal("0.01"))
    if total != calculated_total:
        total = calculated_total

    payment_mode = str(request.POST.get("paymentMode", "Online Payment")).strip()
    if payment_mode == "Cash Counter":
        available, reason = cash_counter_available(user)
        if not available:
            return JsonResponse({"message": reason or "Cash Counter payment is not available for this shop."}, status=400)

    if payment_mode == "No Payment":
        payment_status = PrintOrder.PAYMENT_NO_PAYMENT
        order_status = PrintOrder.STATUS_QUEUED
    elif payment_mode == "Cash Counter":
        payment_status = PrintOrder.PAYMENT_CASH_COUNTER
        order_status = PrintOrder.STATUS_AWAITING_APPROVAL
    else:
        payment_status = PrintOrder.PAYMENT_PENDING
        order_status = PrintOrder.STATUS_AWAITING_PAYMENT

    gate_tool_key = resolve_print_tool_key(service_key, price_item_id)
    if gate_tool_key:
        gate_quantity = 1 if service_key == "passport_photo" else max(pages, 1) * max(copies, 1)
        allowed, gate_message = wallet_usage_gate(user, gate_tool_key, quantity=gate_quantity)
        if not allowed:
            return JsonResponse({"message": gate_message}, status=402)

    passport_prompt = str(request.POST.get("prompt", "")).strip() if service_key == "passport_photo" else ""

    # Passport photos are stored as a base64 data URI directly in the DB
    # (no file on disk); every other service keeps using the FileField.
    if service_key == "passport_photo":
        order_document = ""
        order_original_filename = file_to_data_uri(document)
    else:
        order_document = document
        order_original_filename = document.name

    token_number, token_id = next_order_token(user)
    order = PrintOrder.objects.create(
        user=user,
        shop_code=cafe_code_for_user(user),
        token_number=token_number,
        token_id=token_id,
        service_key=service_key,
        service_name=pricing.service_name,
        price_item_id=price_item_id,
        price_label=str(request.POST.get("priceLabel", "")).strip() or "Print",
        rate=rate,
        pages=pages,
        copies=copies,
        total_amount=total,
        payment_mode=payment_mode,
        payment_status=payment_status,
        status=order_status,
        document=order_document,
        original_filename=order_original_filename,
        customer_phone=str(request.POST.get("customerPhone", "")).strip(),
        payment_gateway=active_payment_gateway()[0] or "" if payment_status == PrintOrder.PAYMENT_PENDING else "",
        attire_category=str(request.POST.get("attireCategory", "")).strip(),
        passport_prompt=passport_prompt,
        photo_status=PrintOrder.PHOTO_STATUS_PENDING if passport_prompt else "",
        photo_updated_at=timezone.now() if passport_prompt else None,
    )

    return JsonResponse({"order": public_order(order)}, status=201)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_create_razorpay_order(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "razorpay" or order.payment_gateway != "razorpay":
        return JsonResponse({"message": "Razorpay is not enabled for this order."}, status=400)
    if order.payment_status != PrintOrder.PAYMENT_PENDING:
        return JsonResponse({"message": "This order is not awaiting payment."}, status=400)
    if not order.gateway_order_id:
        payload, error = razorpay_request("orders", {
            "amount": int(order.total_amount * 100), "currency": "INR",
            "receipt": f"print_{order.id}", "notes": {"order_id": str(order.id), "shop_code": order.shop_code},
        }, config)
        if error:
            return JsonResponse({"message": error}, status=502)
        order.gateway_order_id = payload["id"]
        order.save(update_fields=["gateway_order_id"])
    return JsonResponse({"payment": {
        "gateway": "razorpay", "keyId": config["key_id"], "gatewayOrderId": order.gateway_order_id,
        "amount": int(order.total_amount * 100), "currency": "INR", "name": "RepetiGo",
        "description": f"Print order {order.shop_code}-{order.id:05d}",
    }})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_verify_razorpay_payment(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    gateway, config = active_payment_gateway()
    body = parse_body(request)
    payment_id = str(body.get("razorpay_payment_id", ""))
    gateway_order_id = str(body.get("razorpay_order_id", ""))
    signature = str(body.get("razorpay_signature", ""))
    if gateway != "razorpay" or not order.gateway_order_id or gateway_order_id != order.gateway_order_id:
        return JsonResponse({"message": "Invalid payment order."}, status=400)
    expected = hmac.new(config["key_secret"].encode(), f"{gateway_order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
    if not payment_id or not hmac.compare_digest(expected, signature):
        return JsonResponse({"message": "Payment signature verification failed."}, status=400)
    if order.payment_status == PrintOrder.PAYMENT_PENDING:
        order.payment_status = PrintOrder.PAYMENT_PAID
        order.status = PrintOrder.STATUS_QUEUED
        order.paid_at = timezone.now()
        order.gateway_payment_id = payment_id
        order.save(update_fields=["payment_status", "status", "paid_at", "gateway_payment_id"])
        if order.service_key == "resume_builder" and order.price_item_id:
            # RepetiGo's per-template fee, charged the moment this customer's
            # online payment actually clears - see the matching cash-path
            # charge in mark_resume_order_paid.
            charge_wallet_for_tool(order.user, f"resume_builder_{order.price_item_id}", order=order)
    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_create_payu_order(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "payu" or order.payment_gateway != "payu":
        return JsonResponse({"message": "PayU is not enabled for this order."}, status=400)
    if order.payment_status != PrintOrder.PAYMENT_PENDING:
        return JsonResponse({"message": "This order is not awaiting payment."}, status=400)

    if not order.gateway_order_id:
        order.gateway_order_id = f"cm{order.id}{secrets.token_hex(6)}"
        order.save(update_fields=["gateway_order_id"])

    txnid = order.gateway_order_id
    amount = f"{order.total_amount:.2f}"
    productinfo = f"Print order {order.shop_code}-{order.id:05d}"[:100]
    # PayU's hash requires firstname/email but the storefront only collects a
    # phone number, so we send fixed placeholders - fine for the payment flow,
    # just means PayU's own receipt emails won't reach the actual customer.
    firstname = "Customer"
    email = "customer@cafemitra.app"
    callback_url = request.build_absolute_uri(f"/api/public-orders/{order.id}/payu/callback/")

    hash_value = payu_hash(config["merchant_key"], txnid, amount, productinfo, firstname, email, config["salt"])

    return JsonResponse({"payment": {
        "gateway": "payu",
        "actionUrl": payu_action_url(config),
        "fields": {
            "key": config["merchant_key"],
            "txnid": txnid,
            "amount": amount,
            "productinfo": productinfo,
            "firstname": firstname,
            "email": email,
            "phone": order.customer_phone,
            "surl": callback_url,
            "furl": callback_url,
            "hash": hash_value,
        },
    }})


@csrf_exempt
@require_http_methods(["POST"])
def public_payu_callback(request, order_id):
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseRedirect(settings.FRONTEND_URL)

    payu_config = PAYMENT_GATEWAYS.get("payu", {})
    configured_key = str(payu_config.get("merchant_key", ""))
    salt = str(payu_config.get("salt", ""))

    key = str(request.POST.get("key", ""))
    txnid = str(request.POST.get("txnid", ""))
    status = str(request.POST.get("status", ""))
    amount = str(request.POST.get("amount", ""))
    productinfo = str(request.POST.get("productinfo", ""))
    firstname = str(request.POST.get("firstname", ""))
    email = str(request.POST.get("email", ""))
    received_hash = str(request.POST.get("hash", ""))
    mihpayid = str(request.POST.get("mihpayid", ""))

    valid = bool(salt) and bool(configured_key) and key == configured_key
    valid = valid and order.payment_gateway == "payu" and txnid and txnid == order.gateway_order_id
    if valid:
        expected_hash = payu_reverse_hash(salt, status, key, txnid, amount, productinfo, firstname, email)
        valid = bool(received_hash) and hmac.compare_digest(expected_hash, received_hash)
    if valid:
        valid = payment_amount_matches(amount, order.total_amount)

    if valid and status.lower() == "success" and order.payment_status == PrintOrder.PAYMENT_PENDING:
        order.payment_status = PrintOrder.PAYMENT_PAID
        order.status = PrintOrder.STATUS_QUEUED
        order.paid_at = timezone.now()
        order.gateway_payment_id = mihpayid
        order.save(update_fields=["payment_status", "status", "paid_at", "gateway_payment_id"])
        result = "success"
    else:
        result = "failure"

    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/s/{order.shop_code}?order={order.id}&payment={result}")


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_create_phonepe_order(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "phonepe" or order.payment_gateway != "phonepe":
        return JsonResponse({"message": "PhonePe is not enabled for this order."}, status=400)
    if order.payment_status != PrintOrder.PAYMENT_PENDING:
        return JsonResponse({"message": "This order is not awaiting payment."}, status=400)

    if not order.gateway_order_id:
        order.gateway_order_id = f"cm{order.id}{secrets.token_hex(6)}"
        order.save(update_fields=["gateway_order_id"])

    token, error = phonepe_access_token(config)
    if error:
        return JsonResponse({"message": error}, status=502)

    callback_url = request.build_absolute_uri(f"/api/public-orders/{order.id}/phonepe/callback/")
    payload = {
        "merchantOrderId": order.gateway_order_id,
        "amount": int(order.total_amount * 100),
        "expireAfter": 1200,
        "paymentFlow": {
            "type": "PG_CHECKOUT",
            "message": f"Print order {order.shop_code}-{order.id:05d}",
            "merchantUrls": {"redirectUrl": callback_url},
        },
    }
    result, error = phonepe_api_call("POST", phonepe_urls(config)["pay"], token, payload)
    if error or not result or not result.get("redirectUrl"):
        return JsonResponse({"message": error or "PhonePe did not return a checkout URL."}, status=502)

    return JsonResponse({"payment": {"gateway": "phonepe", "redirectUrl": result["redirectUrl"]}})


@require_http_methods(["GET"])
def public_phonepe_callback(request, order_id):
    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return HttpResponseRedirect(settings.FRONTEND_URL)

    result = "success" if order.payment_status == PrintOrder.PAYMENT_PAID else "failure"
    phonepe_config = PAYMENT_GATEWAYS.get("phonepe", {})
    if order.payment_gateway == "phonepe" and order.gateway_order_id and order.payment_status == PrintOrder.PAYMENT_PENDING:
        # PhonePe's return redirect carries no verifiable payload - re-check
        # status server-side via the authenticated Order Status API instead
        # of trusting anything the browser brings back.
        token, error = phonepe_access_token(phonepe_config)
        if not error:
            status_url = phonepe_urls(phonepe_config)["status"].format(order.gateway_order_id)
            status_payload, error = phonepe_api_call("GET", status_url, token)
            if not error and status_payload:
                state = str(status_payload.get("state", "")).upper()
                amount_paise = status_payload.get("amount")
                amount_ok = amount_paise is None or payment_amount_matches(Decimal(amount_paise) / 100, order.total_amount)
                if state == "COMPLETED" and amount_ok:
                    order.payment_status = PrintOrder.PAYMENT_PAID
                    order.status = PrintOrder.STATUS_QUEUED
                    order.paid_at = timezone.now()
                    order.gateway_payment_id = str(status_payload.get("orderId") or order.gateway_order_id)
                    order.save(update_fields=["payment_status", "status", "paid_at", "gateway_payment_id"])
                    result = "success"

    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/s/{order.shop_code}?order={order.id}&payment={result}")


@csrf_exempt
@require_http_methods(["POST"])
def phonepe_webhook(request):
    phonepe_config = PAYMENT_GATEWAYS.get("phonepe", {})
    expected_username = phonepe_config.get("webhook_username", "")
    expected_password = phonepe_config.get("webhook_password", "")
    if not expected_username or not expected_password:
        return JsonResponse({"message": "Webhook not configured."}, status=503)

    expected_auth = hashlib.sha256(f"{expected_username}:{expected_password}".encode("utf-8")).hexdigest()
    received_auth = request.headers.get("Authorization", "")
    if not received_auth or not hmac.compare_digest(expected_auth, received_auth):
        return JsonResponse({"message": "Invalid webhook credentials."}, status=401)

    body = parse_body(request)
    # PhonePe nests event data under "payload"; fall back to the top level in
    # case a particular event type doesn't use that wrapper.
    payload = body.get("payload") if isinstance(body.get("payload"), dict) else body
    merchant_order_id = str(payload.get("merchantOrderId") or payload.get("orderId") or "")
    state = str(payload.get("state") or body.get("event") or "").upper()
    amount_paise = payload.get("amount")
    is_success = "COMPLETED" in state or "SUCCESS" in state

    # This webhook is shared across both PrintOrder payments and wallet
    # top-ups - the two use distinct gateway_order_id prefixes ("cm" vs
    # "wt") but we still scope the lookup by payment_gateway to match the
    # per-flow order-creation views exactly.
    order = PrintOrder.objects.filter(gateway_order_id=merchant_order_id, payment_gateway="phonepe").first() if merchant_order_id else None
    if order:
        amount_ok = amount_paise is None or payment_amount_matches(Decimal(amount_paise) / 100, order.total_amount)
        if is_success and amount_ok and order.payment_status == PrintOrder.PAYMENT_PENDING:
            order.payment_status = PrintOrder.PAYMENT_PAID
            order.status = PrintOrder.STATUS_QUEUED
            order.paid_at = timezone.now()
            order.gateway_payment_id = str(payload.get("orderId") or merchant_order_id)
            order.save(update_fields=["payment_status", "status", "paid_at", "gateway_payment_id"])
        return JsonResponse({"message": "ok"})

    topup = WalletTopup.objects.filter(gateway_order_id=merchant_order_id, payment_gateway="phonepe").first() if merchant_order_id else None
    if topup:
        amount_ok = amount_paise is None or payment_amount_matches(Decimal(amount_paise) / 100, topup.amount)
        if is_success and amount_ok and topup.status == WalletTopup.STATUS_PENDING:
            credit_wallet_topup(topup, str(payload.get("orderId") or merchant_order_id))

    return JsonResponse({"message": "ok"})


def credit_wallet_topup(topup, gateway_payment_id):
    """Mark a WalletTopup paid and credit the wallet exactly once - safe to
    call more than once for the same top-up (verify call racing a webhook
    retry), since the STATUS_PENDING guard runs under a row lock.
    """
    with transaction.atomic():
        locked = WalletTopup.objects.select_for_update().get(id=topup.id)
        if locked.status != WalletTopup.STATUS_PENDING:
            return
        locked.status = WalletTopup.STATUS_PAID
        locked.paid_at = timezone.now()
        locked.gateway_payment_id = gateway_payment_id
        locked.save(update_fields=["status", "paid_at", "gateway_payment_id"])
        create_wallet_transaction(
            locked.user,
            WalletTransaction.KIND_TOPUP,
            locked.amount,
            WalletTransaction.DIRECTION_CREDIT,
            True,
            note=f"Wallet top-up #{locked.id} via {locked.payment_gateway}.",
        )


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def create_wallet_topup(request):
    if request.method == "OPTIONS":
        return JsonResponse({})
    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    amount = money(body.get("amount"))
    if amount < Decimal("10.00"):
        return JsonResponse({"message": "Top-up amount must be at least Rs. 10."}, status=400)

    gateway, config = active_payment_gateway()
    if not gateway or gateway == "direct_upi":
        return JsonResponse({"message": "Online top-up is not available right now. Please contact support."}, status=503)

    topup = WalletTopup.objects.create(user=user, amount=amount, payment_gateway=gateway)
    return JsonResponse({"topup": {"id": topup.id, "amount": float(topup.amount), "gateway": gateway}}, status=201)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def wallet_topup_razorpay_order(request, topup_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    topup = WalletTopup.objects.filter(id=topup_id, user=user).first()
    if not topup:
        return JsonResponse({"message": "Top-up not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "razorpay" or topup.payment_gateway != "razorpay":
        return JsonResponse({"message": "Razorpay is not enabled for this top-up."}, status=400)
    if topup.status != WalletTopup.STATUS_PENDING:
        return JsonResponse({"message": "This top-up is not awaiting payment."}, status=400)
    if not topup.gateway_order_id:
        payload, error = razorpay_request("orders", {
            "amount": int(topup.amount * 100), "currency": "INR",
            "receipt": f"topup_{topup.id}", "notes": {"topup_id": str(topup.id), "user_id": str(user.id)},
        }, config)
        if error:
            return JsonResponse({"message": error}, status=502)
        topup.gateway_order_id = payload["id"]
        topup.save(update_fields=["gateway_order_id"])
    return JsonResponse({"payment": {
        "gateway": "razorpay", "keyId": config["key_id"], "gatewayOrderId": topup.gateway_order_id,
        "amount": int(topup.amount * 100), "currency": "INR", "name": "RepetiGo",
        "description": f"Wallet top-up #{topup.id}",
    }})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def wallet_topup_verify_razorpay(request, topup_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    topup = WalletTopup.objects.filter(id=topup_id, user=user).first()
    if not topup:
        return JsonResponse({"message": "Top-up not found."}, status=404)
    gateway, config = active_payment_gateway()
    body = parse_body(request)
    payment_id = str(body.get("razorpay_payment_id", ""))
    gateway_order_id = str(body.get("razorpay_order_id", ""))
    signature = str(body.get("razorpay_signature", ""))
    if gateway != "razorpay" or not topup.gateway_order_id or gateway_order_id != topup.gateway_order_id:
        return JsonResponse({"message": "Invalid payment order."}, status=400)
    expected = hmac.new(config["key_secret"].encode(), f"{gateway_order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
    if not payment_id or not hmac.compare_digest(expected, signature):
        return JsonResponse({"message": "Payment signature verification failed."}, status=400)
    credit_wallet_topup(topup, payment_id)
    return JsonResponse({"balance": float(wallet_balance(user))})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def wallet_topup_payu_order(request, topup_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    topup = WalletTopup.objects.filter(id=topup_id, user=user).first()
    if not topup:
        return JsonResponse({"message": "Top-up not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "payu" or topup.payment_gateway != "payu":
        return JsonResponse({"message": "PayU is not enabled for this top-up."}, status=400)
    if topup.status != WalletTopup.STATUS_PENDING:
        return JsonResponse({"message": "This top-up is not awaiting payment."}, status=400)

    if not topup.gateway_order_id:
        topup.gateway_order_id = f"wt{topup.id}{secrets.token_hex(6)}"
        topup.save(update_fields=["gateway_order_id"])

    txnid = topup.gateway_order_id
    amount = f"{topup.amount:.2f}"
    productinfo = f"Wallet top-up #{topup.id}"[:100]
    firstname = user.get_full_name() or "Cafe Owner"
    email = user.email or "owner@cafemitra.app"
    callback_url = request.build_absolute_uri(f"/api/wallet/topup/{topup.id}/payu/callback/")

    hash_value = payu_hash(config["merchant_key"], txnid, amount, productinfo, firstname, email, config["salt"])

    return JsonResponse({"payment": {
        "gateway": "payu",
        "actionUrl": payu_action_url(config),
        "fields": {
            "key": config["merchant_key"],
            "txnid": txnid,
            "amount": amount,
            "productinfo": productinfo,
            "firstname": firstname,
            "email": email,
            "phone": "",
            "surl": callback_url,
            "furl": callback_url,
            "hash": hash_value,
        },
    }})


@csrf_exempt
@require_http_methods(["POST"])
def wallet_topup_payu_callback(request, topup_id):
    topup = WalletTopup.objects.filter(id=topup_id).first()
    if not topup:
        return HttpResponseRedirect(settings.FRONTEND_URL)

    payu_config = PAYMENT_GATEWAYS.get("payu", {})
    configured_key = str(payu_config.get("merchant_key", ""))
    salt = str(payu_config.get("salt", ""))

    key = str(request.POST.get("key", ""))
    txnid = str(request.POST.get("txnid", ""))
    status = str(request.POST.get("status", ""))
    amount = str(request.POST.get("amount", ""))
    productinfo = str(request.POST.get("productinfo", ""))
    firstname = str(request.POST.get("firstname", ""))
    email = str(request.POST.get("email", ""))
    received_hash = str(request.POST.get("hash", ""))
    mihpayid = str(request.POST.get("mihpayid", ""))

    valid = bool(salt) and bool(configured_key) and key == configured_key
    valid = valid and topup.payment_gateway == "payu" and txnid and txnid == topup.gateway_order_id
    if valid:
        expected_hash = payu_reverse_hash(salt, status, key, txnid, amount, productinfo, firstname, email)
        valid = bool(received_hash) and hmac.compare_digest(expected_hash, received_hash)
    if valid:
        valid = payment_amount_matches(amount, topup.amount)

    if valid and status.lower() == "success" and topup.status == WalletTopup.STATUS_PENDING:
        credit_wallet_topup(topup, mihpayid)

    result = "success" if WalletTopup.objects.filter(id=topup.id, status=WalletTopup.STATUS_PAID).exists() else "failure"
    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/wallet?topup={topup.id}&payment={result}")


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def wallet_topup_phonepe_order(request, topup_id):
    if request.method == "OPTIONS":
        return JsonResponse({})
    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    topup = WalletTopup.objects.filter(id=topup_id, user=user).first()
    if not topup:
        return JsonResponse({"message": "Top-up not found."}, status=404)
    gateway, config = active_payment_gateway()
    if gateway != "phonepe" or topup.payment_gateway != "phonepe":
        return JsonResponse({"message": "PhonePe is not enabled for this top-up."}, status=400)
    if topup.status != WalletTopup.STATUS_PENDING:
        return JsonResponse({"message": "This top-up is not awaiting payment."}, status=400)

    if not topup.gateway_order_id:
        topup.gateway_order_id = f"wt{topup.id}{secrets.token_hex(6)}"
        topup.save(update_fields=["gateway_order_id"])

    token, error = phonepe_access_token(config)
    if error:
        return JsonResponse({"message": error}, status=502)

    callback_url = request.build_absolute_uri(f"/api/wallet/topup/{topup.id}/phonepe/callback/")
    payload = {
        "merchantOrderId": topup.gateway_order_id,
        "amount": int(topup.amount * 100),
        "expireAfter": 1200,
        "paymentFlow": {
            "type": "PG_CHECKOUT",
            "message": f"Wallet top-up #{topup.id}",
            "merchantUrls": {"redirectUrl": callback_url},
        },
    }
    result, error = phonepe_api_call("POST", phonepe_urls(config)["pay"], token, payload)
    if error or not result or not result.get("redirectUrl"):
        return JsonResponse({"message": error or "PhonePe did not return a checkout URL."}, status=502)

    return JsonResponse({"payment": {"gateway": "phonepe", "redirectUrl": result["redirectUrl"]}})


@require_http_methods(["GET"])
def wallet_topup_phonepe_callback(request, topup_id):
    topup = WalletTopup.objects.filter(id=topup_id).first()
    if not topup:
        return HttpResponseRedirect(settings.FRONTEND_URL)

    result = "success" if topup.status == WalletTopup.STATUS_PAID else "failure"
    phonepe_config = PAYMENT_GATEWAYS.get("phonepe", {})
    if topup.payment_gateway == "phonepe" and topup.gateway_order_id and topup.status == WalletTopup.STATUS_PENDING:
        # Same as the PrintOrder redirect callback - PhonePe's return redirect
        # carries no verifiable payload, so re-check status server-side via
        # the authenticated Order Status API instead of trusting the browser.
        token, error = phonepe_access_token(phonepe_config)
        if not error:
            status_url = phonepe_urls(phonepe_config)["status"].format(topup.gateway_order_id)
            status_payload, error = phonepe_api_call("GET", status_url, token)
            if not error and status_payload:
                state = str(status_payload.get("state", "")).upper()
                amount_paise = status_payload.get("amount")
                amount_ok = amount_paise is None or payment_amount_matches(Decimal(amount_paise) / 100, topup.amount)
                if state == "COMPLETED" and amount_ok:
                    credit_wallet_topup(topup, str(status_payload.get("orderId") or topup.gateway_order_id))
                    result = "success"

    return HttpResponseRedirect(f"{settings.FRONTEND_URL}/wallet?topup={topup.id}&payment={result}")


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def order_history(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    orders = PrintOrder.objects.filter(user=user).order_by("-created_at")[:100]
    return JsonResponse({"orders": [public_order(order, include_media=False) for order in orders]})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def order_detail(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def mark_passport_order_paid(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user, service_key="passport_photo").first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.payment_status != PrintOrder.PAYMENT_NO_PAYMENT:
        return JsonResponse({"message": "Only unpaid passport photo orders can be marked as paid."}, status=400)

    order.payment_status = PrintOrder.PAYMENT_PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["payment_status", "paid_at"])
    return JsonResponse({"order": public_order(order)})


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
@require_http_methods(["GET", "OPTIONS"])
def order_document(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if not order.document:
        return JsonResponse({"message": "This order has no document."}, status=404)

    filename = order.original_filename or order.document.name.rsplit("/", 1)[-1]
    return FileResponse(order.document.open("rb"), as_attachment=True, filename=filename)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_check_upi_payment(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    if order.payment_status == PrintOrder.PAYMENT_PAID:
        return JsonResponse({"order": public_order(order), "payment": {"status": "paid"}})

    if order.payment_status != PrintOrder.PAYMENT_PENDING:
        return JsonResponse({"message": "This order is not waiting for online payment."}, status=400)

    provider_response = call_upi_status_api(order)
    if upi_response_is_success(provider_response, order):
        order.payment_status = PrintOrder.PAYMENT_PAID
        order.status = PrintOrder.STATUS_QUEUED
        order.paid_at = timezone.now()
        order.save(update_fields=["payment_status", "status", "paid_at"])
        return JsonResponse({"order": public_order(order), "payment": {"status": "paid"}})

    return JsonResponse({
        "order": public_order(order),
        "payment": {
            "status": "pending",
            "transactionRef": upi_transaction_ref(order),
            "notes": upi_payment_note(order),
            "provider": provider_response,
        },
    })


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def public_order_status(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def public_delete_order_document(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    order = PrintOrder.objects.filter(id=order_id).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)
    if order.status != PrintOrder.STATUS_PRINTED:
        return JsonResponse({"message": "You can delete the document only after it has been printed."}, status=400)
    if not order.document:
        return JsonResponse({"order": public_order(order), "message": "Document already deleted."})

    order.document.delete(save=False)
    order.document = ""
    order.agent_message = "Customer deleted document after print."
    order.save(update_fields=["document", "agent_message"])
    return JsonResponse({"order": public_order(order), "message": "Document deleted successfully."})


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_jobs(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    UserProfile.objects.filter(user=user).update(agent_last_seen_at=timezone.now())

    # resume_builder orders never enter the physical print queue - only the
    # separate "Print via PrintPilot" flow (a direct agent call, not this
    # queue) prints a resume. Excluding it here keeps a saved-but-unpaid
    # (or even paid) resume draft from being picked up as a print job.
    jobs = PrintOrder.objects.filter(user=user).exclude(service_key__in=["passport_photo", "resume_builder", "biodata_maker"]).filter(
    # jobs = PrintOrder.objects.filter(user=user).exclude(service_key="passport_photo").filter(
        Q(status=PrintOrder.STATUS_QUEUED)
        | Q(status=PrintOrder.STATUS_AWAITING_APPROVAL, payment_status=PrintOrder.PAYMENT_CASH_COUNTER)
    ).order_by("created_at")[:20]
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
        # Row-locked check-and-set on the order itself so a retried
        # `status=printed` call (slow response, agent re-sends) can't run
        # settlement twice - see the settled_at field comment on PrintOrder.
        with transaction.atomic():
            locked_order = PrintOrder.objects.select_for_update().get(id=order.id)
            if locked_order.settled_at is None:
                settle_printed_order_wallet(locked_order)
                locked_order.settled_at = timezone.now()
                locked_order.save(update_fields=["settled_at"])
    else:
        order.save(update_fields=["status", "agent_message"])

    return JsonResponse({"order": public_order(order)})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def agent_upload_gemini_photo(request, order_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=order_id, user=user).first()
    if not order:
        return JsonResponse({"message": "Order not found."}, status=404)

    photo = request.FILES.get("photo")
    if not photo:
        return JsonResponse({"message": "Upload the generated photo as 'photo'."}, status=400)

    order.gemini_photo = file_to_data_uri(photo)
    order.save(update_fields=["gemini_photo"])
    return JsonResponse({"order": public_order(order)})


# Desktop agent auto-update. Both endpoints are called anonymously (before
# the shop owner has logged the agent in), so they carry no auth check.
# Files live at media/agent/version.txt and media/agent/PrintPilot-latest.zip -
# bump version.txt and drop the new zip there to ship an update.
AGENT_UPDATE_DIR = settings.MEDIA_ROOT / "agent"
AGENT_UPDATE_ZIP_NAME = "PrintPilot-latest.zip"


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_version_check(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    version_file = AGENT_UPDATE_DIR / "version.txt"
    version = version_file.read_text(encoding="utf-8").strip() if version_file.exists() else ""
    return HttpResponse(version, content_type="text/plain")


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_update_download(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    zip_path = AGENT_UPDATE_DIR / AGENT_UPDATE_ZIP_NAME
    if not zip_path.exists():
        return JsonResponse({"message": "No agent update package is available."}, status=404)

    return FileResponse(open(zip_path, "rb"), as_attachment=True, filename=AGENT_UPDATE_ZIP_NAME, content_type="application/zip")


# Desktop agent installer. Served anonymously from the PrintPilot Setup page
# ("Download Agent" button) - drop the built installer at media/installer/
# under AGENT_INSTALLER_NAME to ship a new version.
AGENT_INSTALLER_DIR = settings.MEDIA_ROOT / "installer"
AGENT_INSTALLER_NAME = "RepetigoInstaller.exe"


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_installer_download(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    installer_path = AGENT_INSTALLER_DIR / AGENT_INSTALLER_NAME
    if not installer_path.exists():
        return JsonResponse({"message": "No agent installer is available."}, status=404)

    return FileResponse(
        open(installer_path, "rb"),
        as_attachment=True,
        filename=AGENT_INSTALLER_NAME,
        content_type="application/vnd.microsoft.portable-executable",
    )


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
    auto_print = ServicePricing.objects.filter(user=user, service_key="auto_document_print").first()
    is_open = bool((auto_print.settings or {}).get("isOpen", True)) if auto_print else True

    # The owner's saved preference (settings.paymentMode) can be "Both" even
    # when Cash Counter is currently unavailable (permission revoked, or
    # balance too low) - resolve what customers actually see live, without
    # touching the stored preference itself.
    cash_available, _ = cash_counter_available(user)
    services_payload = []
    for item in pricing:
        data = public_pricing(item)
        if data["settings"].get("paymentMode") == "Both" and not cash_available:
            data["settings"] = {**data["settings"], "paymentMode": "Online Payment"}
        services_payload.append(data)

    return JsonResponse(
        {
            "code": cafe_code_for_user(user),
            "shop": public_shop(shop),
            "services": services_payload,
            "status": {"verified": True, "open": is_open},
        }
    )


PASSPORT_PHOTO_CHECK_MAX_RETRIES = 5
PASSPORT_PHOTO_CHECK_RETRY_DELAY_SECONDS = 5
PASSPORT_PHOTO_STALE_JOB_SECONDS = 60


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def save_raw_passport_photo(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    photo = request.FILES.get("photo")
    if not photo:
        return JsonResponse({"message": "Upload a photo to continue."}, status=400)

    prompt = str(request.POST.get("prompt", "")).strip()
    if not prompt:
        return JsonResponse({"message": "A prompt is required."}, status=400)

    allowed, gate_message = wallet_usage_gate(user, "passport_photo")
    if not allowed:
        return JsonResponse({"message": gate_message}, status=402)

    ensure_service_pricing(user)
    pricing = ServicePricing.objects.filter(user=user, service_key="passport_photo").first()
    service_name = pricing.service_name if pricing else "Passport Size Photo"
    rate = money(request.POST.get("rate"))
    token_number, token_id = next_order_token(user)

    order = PrintOrder.objects.create(
        user=user,
        shop_code=cafe_code_for_user(user),
        token_number=token_number,
        token_id=token_id,
        service_key="passport_photo",
        service_name=service_name,
        price_item_id=str(request.POST.get("priceItemId", "")).strip(),
        price_label=str(request.POST.get("priceLabel", "")).strip(),
        rate=rate,
        pages=1,
        copies=1,
        total_amount=rate,
        payment_mode="No Payment",
        payment_status=PrintOrder.PAYMENT_NO_PAYMENT,
        status=PrintOrder.STATUS_QUEUED,
        original_filename=file_to_data_uri(photo),
        attire_category=str(request.POST.get("attireCategory", "")).strip(),
        passport_prompt=prompt,
        photo_status=PrintOrder.PHOTO_STATUS_PENDING,
        photo_updated_at=timezone.now(),
    )
    return JsonResponse({"id": order.id})


def public_passport_job(order, request):
    # The raw upload is stored as a base64 data URI on the order (no file on
    # disk), but the desktop PrintPilot Agent downloads it over plain HTTP -
    # so serve it through agent_passport_original_image instead of handing
    # back the data URI directly.
    original_image_url = (
        request.build_absolute_uri(f"/api/agent/passport-jobs/{order.id}/original-image/")
        if order.original_filename
        else ""
    )
    return {
        "id": order.id,
        "prompt": order.passport_prompt,
        "status": order.photo_status,
        "priceItemId": order.price_item_id,
        "priceLabel": order.price_label,
        "rate": float(order.rate),
        "finalImageUrl": order.gemini_photo,
        "originalImageUrl": original_image_url,
        "errorMessage": order.photo_error_message,
        "createdAt": order.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def check_passport_photo(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    try:
        order_id = int(body.get("id"))
    except (TypeError, ValueError):
        return JsonResponse({"message": "A valid order id is required."}, status=400)

    order = PrintOrder.objects.filter(id=order_id, user=user, service_key="passport_photo").first()
    if not order:
        return JsonResponse({"message": "Photo request not found."}, status=404)

    for attempt in range(PASSPORT_PHOTO_CHECK_MAX_RETRIES):
        order.refresh_from_db()
        if order.gemini_photo:
            return JsonResponse({"found": True, "imageUrl": order.gemini_photo})

        if order.photo_status in (PrintOrder.PHOTO_STATUS_PENDING, PrintOrder.PHOTO_STATUS_CLAIMED):
            stale_seconds = (timezone.now() - order.photo_updated_at).total_seconds() if order.photo_updated_at else 0
            if stale_seconds > PASSPORT_PHOTO_STALE_JOB_SECONDS:
                order.photo_status = PrintOrder.PHOTO_STATUS_FAILED
                order.photo_error_message = "The PrintPilot Agent did not respond in time. Please check that it is running and connected, then try again."
                order.photo_updated_at = timezone.now()
                order.save(update_fields=["photo_status", "photo_error_message", "photo_updated_at"])

        if order.photo_status == PrintOrder.PHOTO_STATUS_FAILED:
            if apply_gemini_fallback(order):
                return JsonResponse({"found": True, "imageUrl": order.gemini_photo})
            fallback = f"{order.service_name or 'Passport Size Photo'} generation failed."
            return JsonResponse({"found": False, "message": friendly_photo_error_message(order.photo_error_message, fallback)}, status=200)

        if attempt < PASSPORT_PHOTO_CHECK_MAX_RETRIES - 1:
            time.sleep(PASSPORT_PHOTO_CHECK_RETRY_DELAY_SECONDS)

    return JsonResponse({"found": False, "message": "Image is not ready yet. Please try again later."}, status=404)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_passport_jobs(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    # Any authenticated caller gets the full pending queue (not just their
    # own orders) so a single agent can process everyone's passport photos.
    jobs = PrintOrder.objects.filter(
        service_key="passport_photo", photo_status=PrintOrder.PHOTO_STATUS_PENDING,
    ).order_by("created_at")[:20]
    return JsonResponse({"jobs": [public_passport_job(job, request) for job in jobs]})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def claim_passport_job(request, job_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    with transaction.atomic():
        order = PrintOrder.objects.select_for_update().filter(id=job_id, service_key="passport_photo").first()
        if not order:
            return JsonResponse({"message": "Photo job not found."}, status=404)
        if order.photo_status != PrintOrder.PHOTO_STATUS_PENDING:
            return JsonResponse({"message": "Job already claimed."}, status=409)

        order.photo_status = PrintOrder.PHOTO_STATUS_CLAIMED
        order.photo_updated_at = timezone.now()
        order.save(update_fields=["photo_status", "photo_updated_at"])

    return JsonResponse(public_passport_job(order, request))


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def complete_passport_job(request, job_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    user = auth_user(request)
    if not user:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=job_id, service_key="passport_photo").first()
    if not order:
        return JsonResponse({"message": "Photo job not found."}, status=404)

    if str(request.POST.get("status", "")).strip() == PrintOrder.PHOTO_STATUS_FAILED:
        order.photo_status = PrintOrder.PHOTO_STATUS_FAILED
        order.photo_error_message = friendly_photo_error_message(request.POST.get("message", ""))
        order.photo_updated_at = timezone.now()
        order.save(update_fields=["photo_status", "photo_error_message", "photo_updated_at"])
        apply_gemini_fallback(order)
        return JsonResponse(public_passport_job(order, request))

    final_image = request.FILES.get("final_image")
    if not final_image:
        return JsonResponse({"message": "final_image file is required."}, status=400)

    # The desktop agent uploads with a generic application/octet-stream
    # content-type, so guess from the real filename extension first -
    # falling back to the upload's own content-type only if that fails.
    content_type = mimetypes.guess_type(final_image.name)[0] or getattr(final_image, "content_type", None) or "image/jpeg"
    cleaned_bytes = remove_gemini_watermark(final_image.read(), content_type)
    encoded = base64.b64encode(cleaned_bytes).decode("ascii")

    order.gemini_photo = f"data:{content_type};base64,{encoded}"
    order.photo_status = PrintOrder.PHOTO_STATUS_DONE
    order.photo_updated_at = timezone.now()
    order.save(update_fields=["gemini_photo", "photo_status", "photo_updated_at"])
    # Bill the order's own owner even when the bulk agent (a different
    # account) is the one completing the job on their behalf.
    charge_wallet_for_tool(order.user, "passport_photo", quantity=1, order=order)
    return JsonResponse(public_passport_job(order, request))


# --- Google Places (Google Maps place links, no auth) -----------------------

def public_google_place(place):
    return {
        "id": place.id,
        "link": place.link,
        "name": place.name,
        "extracted_status": place.extracted_status,
        "extractedby": place.extractedby,
        "createdAt": place.created_at.isoformat(),
        "updatedAt": place.updated_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def google_places(request):
    """No auth on purpose (reverted 2026-08-11) - the Chrome scraping
    extension that populates this queue while browsing Google Maps can't
    send an Authorization header, so this stays open like it originally was.
    This is the known "Google Places CRM is unauthenticated" gap from
    API_DOCUMENTATION.md section 15 #5 - the leads PIPELINE endpoints
    (google_place_details / google_place_detail_item / lead_activities,
    used by the Leads CRM UI in cafemitra_admin) are still auth+role-gated;
    only this scrape-queue intake stays open.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    if request.method == "POST":
        body = parse_body(request)
        is_batch = isinstance(body, list)
        items = body if is_batch else [body]
        if not items:
            return JsonResponse({"message": "Provide at least one place."}, status=400)

        created = []
        skipped = []
        seen_names = set()
        for item in items:
            if not isinstance(item, dict):
                skipped.append({"name": "", "reason": "Invalid entry; expected an object with link and name."})
                continue
            link = str(item.get("link", "")).strip()
            name = str(item.get("name", "")).strip()
            extractedby = str(item.get("extractedby", "")).strip()
            if not link or not name:
                skipped.append({"name": name, "reason": "Both link and name are required."})
                continue
            if name in seen_names or GooglePlace.objects.filter(name=name).exists():
                skipped.append({"name": name, "reason": "A place with this name already exists."})
                continue
            seen_names.add(name)
            place = GooglePlace.objects.create(link=link, name=name, extractedby=extractedby)
            created.append(public_google_place(place))

        if not is_batch:
            # Single object payload - keep the plain single-object response shape.
            if created:
                return JsonResponse({"message": "Place created.", "place": created[0]}, status=201)
            reason = skipped[0]["reason"] if skipped else "Could not create place."
            status = 409 if "already exists" in reason else 400
            return JsonResponse({"message": reason}, status=status)

        return JsonResponse(
            {
                "message": f"{len(created)} place(s) created, {len(skipped)} skipped.",
                "created": created,
                "skipped": skipped,
            },
            status=201 if created else 400,
        )

    # GET - list, optionally filtered by extracted_status (true/false/all)
    status_filter = str(request.GET.get("extracted_status", "all")).strip().lower()
    places = GooglePlace.objects.all()
    if status_filter in {"true", "1", "yes"}:
        places = places.filter(extracted_status=True)
    elif status_filter in {"false", "0", "no"}:
        places = places.filter(extracted_status=False)
    elif status_filter != "all":
        return JsonResponse({"message": "extracted_status must be true, false, or all."}, status=400)

    try:
        page = max(1, int(request.GET.get("page", 1)))
    except (TypeError, ValueError):
        page = 1
    try:
        page_size = min(50, max(1, int(request.GET.get("pageSize", 20))))
    except (TypeError, ValueError):
        page_size = 20
    count = places.count()
    start = (page - 1) * page_size
    page_items = places[start : start + page_size]

    # Global counts (ignore the extracted_status filter/pagination above) -
    # the Scrape Queue page's Pending/Extracted stat cards need the TRUE
    # totals, not just what happens to be on the current page.
    global_stats = GooglePlace.objects.aggregate(
        pending=Count("id", filter=Q(extracted_status=False)),
        extracted=Count("id", filter=Q(extracted_status=True)),
    )

    return JsonResponse(
        {
            "count": count,
            "page": page,
            "pageSize": page_size,
            "pendingCount": global_stats["pending"],
            "extractedCount": global_stats["extracted"],
            "places": [public_google_place(place) for place in page_items],
        }
    )


@csrf_exempt
@require_http_methods(["PUT", "PATCH", "DELETE", "OPTIONS"])
def google_place_detail(request, place_id):
    """No auth on purpose - same scrape-queue extension as google_places()
    above also calls this to mark items extracted."""
    if request.method == "OPTIONS":
        return JsonResponse({})

    place = GooglePlace.objects.filter(id=place_id).first()
    if not place:
        return JsonResponse({"message": "Place not found."}, status=404)

    if request.method == "DELETE":
        place.delete()
        return JsonResponse({"message": "Place deleted."})

    # PUT/PATCH - mark this place as extracted
    place.extracted_status = True
    place.save(update_fields=["extracted_status", "updated_at"])
    return JsonResponse({"message": "Place marked as extracted.", "place": public_google_place(place)})


# --- Google Place Details (full scraped record, no auth) --------------------

def decimal_or_none(value):
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return None


def int_or_none(value):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def public_google_place_detail(detail):
    return {
        "id": detail.id,
        "name": detail.name,
        "address": detail.address,
        "image": detail.image,
        "latitude": float(detail.latitude) if detail.latitude is not None else None,
        "longitude": float(detail.longitude) if detail.longitude is not None else None,
        "maps_url": detail.maps_url,
        "phone": detail.phone,
        "rating": float(detail.rating) if detail.rating is not None else None,
        "reviews": detail.reviews,
        "website": detail.website,
        "status": detail.status,
        "notes": detail.notes,
        "next_follow_up_at": detail.next_follow_up_at.isoformat() if detail.next_follow_up_at else None,
        "createdAt": detail.created_at.isoformat(),
        "updatedAt": detail.updated_at.isoformat(),
    }


def public_lead_activity(activity):
    return {
        "id": activity.id,
        "leadId": activity.lead_id,
        "kind": activity.kind,
        "fromStatus": activity.from_status,
        "toStatus": activity.to_status,
        "note": activity.note,
        "createdAt": activity.created_at.isoformat(),
    }


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def google_place_details(request):
    if request.method == "OPTIONS":
        return JsonResponse({})

    staff_user = auth_user(request)
    if not staff_user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    if not staff_user.is_staff:
        return JsonResponse({"message": "Not authorized for admin access."}, status=403)
    if not role_allows_section(staff_user, "leads"):
        return JsonResponse({"message": "Your admin role does not have access to this section."}, status=403)

    if request.method == "POST":
        body = parse_body(request)
        is_batch = isinstance(body, list)
        items = body if is_batch else [body]
        if not items:
            return JsonResponse({"message": "Provide at least one place detail."}, status=400)

        created = []
        skipped = []
        seen_urls = set()
        for item in items:
            if not isinstance(item, dict):
                skipped.append({"name": "", "reason": "Invalid entry; expected an object with maps_url and name."})
                continue
            maps_url = str(item.get("maps_url", "")).strip()
            name = str(item.get("name", "")).strip()
            if not maps_url or not name:
                skipped.append({"name": name, "reason": "Both maps_url and name are required."})
                continue
            if maps_url in seen_urls or GooglePlaceDetail.objects.filter(maps_url=maps_url).exists():
                skipped.append({"name": name, "reason": "A place detail with this maps_url already exists."})
                continue
            seen_urls.add(maps_url)
            requested_status = str(item.get("status") or "").strip()
            detail = GooglePlaceDetail.objects.create(
                name=name,
                address=str(item.get("address") or "").strip(),
                image=str(item.get("image") or "").strip(),
                latitude=decimal_or_none(item.get("latitude")),
                longitude=decimal_or_none(item.get("longitude")),
                maps_url=maps_url,
                phone=str(item.get("phone") or "").strip(),
                rating=decimal_or_none(item.get("rating")),
                reviews=int_or_none(item.get("reviews")),
                website=str(item.get("website") or "").strip(),
                status=requested_status if requested_status in dict(GooglePlaceDetail.STATUS_CHOICES) else GooglePlaceDetail.STATUS_NEW,
                notes=str(item.get("notes") or "").strip(),
                next_follow_up_at=parse_date(str(item.get("next_follow_up_at") or "").strip()) if item.get("next_follow_up_at") else None,
            )
            created.append(public_google_place_detail(detail))

        if not is_batch:
            # Single object payload - keep the plain single-object response shape.
            if created:
                return JsonResponse({"message": "Place detail created.", "placeDetail": created[0]}, status=201)
            reason = skipped[0]["reason"] if skipped else "Could not create place detail."
            status = 409 if "already exists" in reason else 400
            return JsonResponse({"message": reason}, status=status)

        return JsonResponse(
            {
                "message": f"{len(created)} place detail(s) created, {len(skipped)} skipped.",
                "created": created,
                "skipped": skipped,
            },
            status=201 if created else 400,
        )

    # GET - list all, optionally filtered by ?name= (case-insensitive contains) and/or ?status=
    query = request.GET.get("name", "").strip()
    status_filter = request.GET.get("status", "").strip()
    follow_up_filter = request.GET.get("follow_up", "").strip()
    details = GooglePlaceDetail.objects.all()
    if query:
        details = details.filter(name__icontains=query)
    if status_filter and status_filter != "all":
        if status_filter not in dict(GooglePlaceDetail.STATUS_CHOICES):
            return JsonResponse({"message": "Invalid status filter."}, status=400)
        details = details.filter(status=status_filter)
    if follow_up_filter and follow_up_filter != "all":
        today = timezone.localdate()
        if follow_up_filter == "overdue":
            details = details.filter(next_follow_up_at__lt=today)
        elif follow_up_filter == "today":
            details = details.filter(next_follow_up_at=today)
        elif follow_up_filter == "upcoming":
            details = details.filter(next_follow_up_at__gt=today)
        elif follow_up_filter == "none":
            details = details.filter(next_follow_up_at__isnull=True)
        else:
            return JsonResponse({"message": "follow_up must be overdue, today, upcoming, none, or all."}, status=400)

    return JsonResponse({"count": details.count(), "placeDetails": [public_google_place_detail(detail) for detail in details]})


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE", "OPTIONS"])
def google_place_detail_item(request, detail_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    staff_user = auth_user(request)
    if not staff_user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    if not staff_user.is_staff:
        return JsonResponse({"message": "Not authorized for admin access."}, status=403)
    if not role_allows_section(staff_user, "leads"):
        return JsonResponse({"message": "Your admin role does not have access to this section."}, status=403)

    detail = GooglePlaceDetail.objects.filter(id=detail_id).first()
    if not detail:
        return JsonResponse({"message": "Place detail not found."}, status=404)

    if request.method == "GET":
        return JsonResponse({"placeDetail": public_google_place_detail(detail)})

    if request.method == "DELETE":
        detail.delete()
        return JsonResponse({"message": "Place detail deleted."})

    # PUT/PATCH - update any provided fields
    body = parse_body(request)
    if not isinstance(body, dict):
        return JsonResponse({"message": "Provide an object with the fields to update."}, status=400)

    if "maps_url" in body:
        new_maps_url = str(body.get("maps_url", "")).strip()
        if not new_maps_url:
            return JsonResponse({"message": "maps_url cannot be empty."}, status=400)
        if GooglePlaceDetail.objects.filter(maps_url=new_maps_url).exclude(id=detail.id).exists():
            return JsonResponse({"message": "Another place detail already uses this maps_url."}, status=409)
        detail.maps_url = new_maps_url

    if "name" in body:
        name = str(body.get("name", "")).strip()
        if not name:
            return JsonResponse({"message": "name cannot be empty."}, status=400)
        detail.name = name

    for field in ("address", "image", "phone", "website"):
        if field in body:
            setattr(detail, field, str(body.get(field) or "").strip())

    if "latitude" in body:
        detail.latitude = decimal_or_none(body.get("latitude"))
    if "longitude" in body:
        detail.longitude = decimal_or_none(body.get("longitude"))
    if "rating" in body:
        detail.rating = decimal_or_none(body.get("rating"))
    if "reviews" in body:
        detail.reviews = int_or_none(body.get("reviews"))
    if "notes" in body:
        detail.notes = str(body.get("notes") or "").strip()

    if "next_follow_up_at" in body:
        raw_date = str(body.get("next_follow_up_at") or "").strip()
        if not raw_date:
            detail.next_follow_up_at = None
        else:
            parsed = parse_date(raw_date)
            if not parsed:
                return JsonResponse({"message": "next_follow_up_at must be an ISO date (YYYY-MM-DD)."}, status=400)
            detail.next_follow_up_at = parsed

    previous_status = detail.status
    if "status" in body:
        new_status = str(body.get("status") or "").strip()
        if new_status not in dict(GooglePlaceDetail.STATUS_CHOICES):
            return JsonResponse({"message": "Invalid status."}, status=400)
        detail.status = new_status

    detail.save()

    if "status" in body and detail.status != previous_status:
        LeadActivity.objects.create(
            lead=detail,
            kind=LeadActivity.KIND_STATUS_CHANGE,
            from_status=previous_status,
            to_status=detail.status,
        )

    return JsonResponse({"message": "Place detail updated.", "placeDetail": public_google_place_detail(detail)})


@csrf_exempt
@require_http_methods(["GET", "POST", "OPTIONS"])
def lead_activities(request, detail_id):
    if request.method == "OPTIONS":
        return JsonResponse({})

    staff_user = auth_user(request)
    if not staff_user:
        return JsonResponse({"message": "Unauthorized."}, status=401)
    if not staff_user.is_staff:
        return JsonResponse({"message": "Not authorized for admin access."}, status=403)
    if not role_allows_section(staff_user, "leads"):
        return JsonResponse({"message": "Your admin role does not have access to this section."}, status=403)

    detail = GooglePlaceDetail.objects.filter(id=detail_id).first()
    if not detail:
        return JsonResponse({"message": "Place detail not found."}, status=404)

    if request.method == "GET":
        activities = detail.activities.all()
        return JsonResponse({"count": activities.count(), "activities": [public_lead_activity(a) for a in activities]})

    body = parse_body(request)
    if not isinstance(body, dict):
        return JsonResponse({"message": "Provide an object with a note."}, status=400)

    note = str(body.get("note") or "").strip()
    if not note:
        return JsonResponse({"message": "note is required."}, status=400)

    activity = LeadActivity.objects.create(lead=detail, kind=LeadActivity.KIND_NOTE, note=note)
    return JsonResponse({"message": "Note added.", "activity": public_lead_activity(activity)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "OPTIONS"])
def agent_passport_original_image(request, job_id):
    """Serve the base64-stored raw upload as a plain image download for the
    desktop PrintPilot Agent, which fetches it over HTTP (like it used to
    fetch the old document.url media file) rather than decoding base64.

    Auth required (previously this had none): a guessable/sequential job_id
    was enough for anyone to download any customer's raw uploaded photo with
    no login at all. Checked against the codebase first - neither
    cafemitra_client nor the current Print Agent source actually calls this
    route today (OriginalImageUrl is an unused DTO field), so requiring a
    token here doesn't break any deployed caller.
    """
    if request.method == "OPTIONS":
        return JsonResponse({})

    caller = auth_user(request)
    if not caller:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    order = PrintOrder.objects.filter(id=job_id, service_key="passport_photo").first()
    if not order:
        return JsonResponse({"message": "Photo not found."}, status=404)

    if order.original_filename.startswith("data:"):
        content_type, image_bytes = data_uri_to_bytes(order.original_filename)
        return HttpResponse(image_bytes, content_type=content_type)

    # Orders created before this order stopped storing a real file still
    # have their raw upload on disk instead of as base64 - serve that.
    if order.document:
        content_type = mimetypes.guess_type(order.document.name)[0] or "image/jpeg"
        return HttpResponse(order.document.read(), content_type=content_type)

    return JsonResponse({"message": "Photo not found."}, status=404)
