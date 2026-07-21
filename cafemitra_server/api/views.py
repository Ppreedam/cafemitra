import json
import base64
import hashlib
import hmac
import ipaddress
import re
import secrets
import socket
import urllib.error
import urllib.parse
import urllib.request
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Max, Q, Sum
from django.http import FileResponse, HttpResponse, JsonResponse
from django.utils.html import escape
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import AuthToken, ContactMessage, EmailVerificationToken, PasswordResetToken, PrintOrder, ServicePricing, ShopProfile, UserProfile, WalletTransaction, WithdrawalRequest
from cafemitra_server.product_setting import active_payment_gateway

User = get_user_model()

ACCESS_TOKEN_TTL = timedelta(hours=1)
REFRESH_TOKEN_TTL = timedelta(days=30)
EMAIL_TOKEN_TTL = timedelta(hours=24)
PASSWORD_RESET_TOKEN_TTL = timedelta(minutes=30)
SIGNUP_BONUS_AMOUNT = Decimal("5.00")
REPTIGO_COMMISSION_RATE = Decimal("0.03")
UPI_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9]{2,64}$")
UPI_PAYMENT_PA = "8298972939@okbizaxis"
UPI_PAYMENT_STATUS_URL = "https://otp.instadl.in/upi_payment/check_status"

DEFAULT_SERVICE_PRICING = {
    "auto_document_print": {
        "serviceName": "CafeMitra PrintPilot",
        "settings": {
            "paymentMode": "Online Payment",
            "selectedPrinter": "",
            "pricingSaved": False,
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

    image_bytes = upload.read()
    base_name = re.sub(r"[^A-Za-z0-9._-]+", "-", upload.name.rsplit(".", 1)[0])[:80] or "image"
    extension = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(content_type, "png")
    response = HttpResponse(image_bytes, content_type=content_type)
    response["Content-Disposition"] = f'attachment; filename="{base_name}-background-placeholder.{extension}"'
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
                  Thank you for creating your RepetiGo account. Please verify your email address to activate your account and start using your print shop dashboard.
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
                    <strong style="color:#0d1748;">Our motive:</strong> RepetiGo helps print shops work faster while keeping customer documents secure and private.
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
    commission = (total_collected * REPTIGO_COMMISSION_RATE).quantize(Decimal("0.01"))
    balance = wallet_balance(user)
    net_withdrawable = max(balance - commission, Decimal("0.00")).quantize(Decimal("0.01"))
    return {
        "onlineCollected": online_collected.quantize(Decimal("0.01")),
        "cashCounterCollected": cash_collected.quantize(Decimal("0.01")),
        "totalCollected": total_collected,
        "commissionPending": commission,
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


def create_wallet_transaction(user, kind, amount, direction, affects_balance=True, order=None, note=""):
    amount = Decimal(amount).quantize(Decimal("0.01"))
    if amount <= 0:
        return None
    if order and WalletTransaction.objects.filter(user=user, order=order, kind=kind).exists():
        return None
    if not order and kind == WalletTransaction.KIND_SIGNUP_BONUS and WalletTransaction.objects.filter(user=user, kind=kind).exists():
        return None

    transaction = WalletTransaction.objects.create(
        user=user,
        order=order,
        kind=kind,
        direction=direction,
        amount=amount,
        affects_balance=affects_balance,
        note=note,
    )
    if affects_balance:
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={"phone": ""})
        if direction == WalletTransaction.DIRECTION_CREDIT:
            profile.balance = (profile.balance + amount).quantize(Decimal("0.01"))
        elif direction == WalletTransaction.DIRECTION_DEBIT:
            profile.balance = (profile.balance - amount).quantize(Decimal("0.01"))
        profile.save(update_fields=["balance"])
    return transaction


def ensure_signup_wallet_bonus(user):
    return create_wallet_transaction(
        user,
        WalletTransaction.KIND_SIGNUP_BONUS,
        SIGNUP_BONUS_AMOUNT,
        WalletTransaction.DIRECTION_CREDIT,
        True,
        note="Signup bonus credited.",
    )


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
    has_document = bool(order.document)
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
        "fileName": order.original_filename,
        "fileUrl": order.document.url if has_document else "",
        "documentDeleted": not has_document,
        "customerPhone": order.customer_phone,
        "createdAt": order.created_at.isoformat(),
        "paidAt": order.paid_at.isoformat() if order.paid_at else "",
        "printedAt": order.printed_at.isoformat() if order.printed_at else "",
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

    return JsonResponse({"status": "ok", "message": "Server is running version4."})


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
    user.is_active = False
    user.save(update_fields=["first_name", "is_active"])
    UserProfile.objects.create(user=user, phone=phone)
    ShopProfile.objects.create(user=user, shop_name="Cyber Cafe Shankar", mobile=phone, whatsapp=phone, email=email)
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

    return token_response(user, rotate_refresh=False)


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
    return token_response(token.user, rotate_refresh=True)


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

    return JsonResponse(
        {
            "balance": float(wallet_balance(user)),
            "summary": {
                "onlineCollected": float(collection_summary["onlineCollected"]),
                "cashCounterCollected": float(collection_summary["cashCounterCollected"]),
                "totalCollected": float(collection_summary["totalCollected"]),
                "commissionRate": float(REPTIGO_COMMISSION_RATE),
                "commissionPending": float(collection_summary["commissionPending"]),
                "netWithdrawable": float(collection_summary["netWithdrawable"]),
                "pendingWithdrawal": float(pending_withdrawal),
                "paidWithdrawal": float(paid_withdrawal),
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
    net_withdrawable = wallet_collection_summary(user)["netWithdrawable"]
    if net_withdrawable < amount:
        return JsonResponse({"message": "Amount is higher than withdrawable balance after Reptigo commission."}, status=400)

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
    if request.method == "OPTIONS":
        return JsonResponse({})

    requester = auth_user(request)
    if not requester:
        return JsonResponse({"message": "Unauthorized."}, status=401)

    body = parse_body(request)
    email = str(body.get("email", "")).strip().lower()

    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        return JsonResponse({"message": "Enter a valid email address."}, status=400)

    account = User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).first()
    if not account:
        return JsonResponse({"message": "Account not found."}, status=404)

    is_self_delete = account.id == requester.id
    if not is_self_delete and not requester.is_staff and not requester.is_superuser:
        return JsonResponse({"message": "You can delete only your own account."}, status=403)

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
    existing_settings = pricing.settings if isinstance(pricing.settings, dict) else {}
    pricing.settings = {**default_service["settings"], **existing_settings, **settings}
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
        price_item_id=price_item_id,
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
        payment_gateway=active_payment_gateway()[0] or "" if payment_status == PrintOrder.PAYMENT_PENDING else "",
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
    return JsonResponse({"order": public_order(order)})


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

    jobs = PrintOrder.objects.filter(user=user).filter(
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
        settle_printed_order_wallet(order)
    else:
        order.save(update_fields=["status", "agent_message"])

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

    return JsonResponse(
        {
            "code": cafe_code_for_user(user),
            "shop": public_shop(shop),
            "services": [public_pricing(item) for item in pricing],
            "status": {"verified": True, "open": is_open},
        }
    )
