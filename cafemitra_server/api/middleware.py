from django.conf import settings
from django.http import HttpResponse, JsonResponse
from urllib.parse import urlparse


def is_debug_lan_origin(origin):
    if not getattr(settings, "DEBUG", False) or not origin:
        return False

    hostname = urlparse(origin).hostname or ""
    if hostname in {"localhost", "127.0.0.1"}:
        return True
    if hostname.startswith(("192.168.", "10.", "172.16.", "172.17.", "172.18.", "172.19.", "172.2", "172.30.", "172.31.")):
        return True
    return False


GATEWAY_CALLBACK_PATH_SUFFIXES = ("/payu/callback", "/webhooks/phonepe")


def is_gateway_callback_path(path):
    # Payment gateways POST here directly (browser redirect POST, or a
    # server-to-server webhook) - not a frontend fetch() call, so there's no
    # origin we control and the CORS origin check below doesn't apply. These
    # endpoints verify authenticity via a signed hash/credential in the view.
    trimmed = path.rstrip("/")
    return any(trimmed.endswith(suffix) for suffix in GATEWAY_CALLBACK_PATH_SUFFIXES)


class SimpleCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get("Origin")
        allowed_origins = getattr(settings, "CORS_ALLOWED_ORIGINS", set())
        origin_allowed = origin in allowed_origins or is_debug_lan_origin(origin)
        unsafe_method = request.method not in {"GET", "HEAD", "OPTIONS", "TRACE"}
        if origin and not origin_allowed and unsafe_method and not is_gateway_callback_path(request.path):
            return JsonResponse({"message": "Origin is not allowed."}, status=403)

        if request.method == "OPTIONS":
            response = HttpResponse()
        else:
            response = self.get_response(request)

        if origin_allowed:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response["Vary"] = "Origin"

        return response
