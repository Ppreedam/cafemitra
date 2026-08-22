import os
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_DIR = Path(__file__).resolve().parent.parent


def load_env_file(path):
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)


load_env_file(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-cafemitra-secret-key")
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "api.repetigo.com,repetigo.com,www.repetigo.com,localhost,127.0.0.1").split(",") if host.strip()]
if DEBUG and "*" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("*")

# Nginx terminates HTTPS and forwards plain HTTP to Django in production, so
# without this Django thinks every request is insecure - request.is_secure()
# and request.build_absolute_uri() (used to build the PayU surl/furl) would
# generate http:// URLs, which then get redirected to https:// and drop the
# POST body PayU sent. Requires nginx to set X-Forwarded-Proto itself (not
# forward whatever the client sent) - standard `proxy_set_header
# X-Forwarded-Proto $scheme;` in the nginx config already does this.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

INSTALLED_APPS = [
    "daphne",  # must be first so `manage.py runserver` auto-detects ASGI/Channels in dev
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "api",
    "corsheaders",
    "channels",
]

MIDDLEWARE = [
    "api.middleware.SimpleCorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

ROOT_URLCONF = "cafemitra_server.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "cafemitra_server.wsgi.application"
ASGI_APPLICATION = "cafemitra_server.asgi.application"

# Channel layer for the Print Agent's WebSocket "new job available" push
# (see api/consumers.py) - Redis so group_send() reaches a connection held
# by any worker process, not just the one handling the HTTP request that
# triggered it.
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            # socket_timeout MUST be None (or > channels_redis's own
            # brpop_timeout, default 5s) - redis-py defaults socket_timeout
            # to 5s too, which races the server-side BZPOPMIN's 5s blocking
            # window and randomly kills otherwise-healthy idle WebSocket
            # connections with a client-side TimeoutError. Reproduced and
            # confirmed live during testing (connections were dying ~5s
            # after connecting with no activity) - do not remove this.
            "hosts": [{"address": REDIS_URL, "socket_timeout": None}],
        },
    },
}

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    parsed_db_url = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed_db_url.path.lstrip("/"),
            "USER": unquote(parsed_db_url.username or ""),
            "PASSWORD": unquote(parsed_db_url.password or ""),
            "HOST": parsed_db_url.hostname,
            "PORT": parsed_db_url.port or 5432,
            "OPTIONS": {"sslmode": "require"},
            # Deliberately NOT setting CONN_MAX_AGE here. This DB sits behind
            # Supabase's SESSION-mode pooler, which caps concurrent clients
            # at pool_size=15 platform-wide (shared across every Django
            # worker/process hitting it). A persistent per-worker connection
            # (CONN_MAX_AGE > 0) is held for its full lifetime even between
            # requests - with more than a handful of workers that exhausts
            # the pool within seconds and every further connection attempt
            # fails with "FATAL: max clients reached in session mode",
            # surfacing as random 500s across the app. Closing the
            # connection at the end of every request (the default) keeps
            # each worker's DB connection held only while actively running a
            # query, which is what keeps concurrent usage under the pooler's
            # limit. Revisit only alongside switching to Supabase's
            # TRANSACTION-mode pooler (port 6543), which is built for many
            # short-lived connections.
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

PRODUCTION_FRONTEND_ORIGINS = {
    "https://repetigo.com",
    "https://www.repetigo.com",
}
# CORS_ALLOWED_ORIGINS = {
#     origin.strip()
#     for origin in os.getenv(
#         "CORS_ALLOWED_ORIGINS",
#         "http://localhost:3000,http://127.0.0.1:3000",
#     ).split(",")
#     if origin.strip()
# } | PRODUCTION_FRONTEND_ORIGINS
# CSRF_TRUSTED_ORIGINS = list({
#     origin.strip()
#     for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
#     if origin.strip()
# } | CORS_ALLOWED_ORIGINS)

CORS_ALLOWED_ORIGINS = [
    "https://repetigo.com",
    "https://www.repetigo.com",
    "http://localhost:3000",
    "http://localhost:3002",  # cafemitra_admin dev server
    "chrome-extension://haknmckbhgnjnjnhhbidhbinpknnioao",
]

CORS_ALLOW_CREDENTIALS = True

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://repetigo.com").rstrip("/")
AI_UPSCALE_API_URL = os.getenv("AI_UPSCALE_API_URL", "").strip()
AI_UPSCALE_API_KEY = os.getenv("AI_UPSCALE_API_KEY", "").strip()
AI_UPSCALE_TIMEOUT = int(os.getenv("AI_UPSCALE_TIMEOUT", "120"))
WEBSITE_SCREENSHOT_API_URL = os.getenv("WEBSITE_SCREENSHOT_API_URL", "").strip()
WEBSITE_SCREENSHOT_API_KEY = os.getenv("WEBSITE_SCREENSHOT_API_KEY", "").strip()
WEBSITE_SCREENSHOT_TIMEOUT = int(os.getenv("WEBSITE_SCREENSHOT_TIMEOUT", "120"))

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend" if os.getenv("SMTP_USER") and os.getenv("SMTP_PASSWORD") else "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = os.getenv("SMTP_HOST", "smtp.hostinger.com")
EMAIL_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USE_TLS = os.getenv("SMTP_USE_TLS", "1") == "1"
EMAIL_TIMEOUT = int(os.getenv("SMTP_TIMEOUT", "15"))
EMAIL_HOST_USER = os.getenv("SMTP_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER or "support@repetigo.com")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{asctime} {levelname} {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "django_errors.log",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 3,
            "formatter": "verbose",
            "level": "ERROR",
        },
    },
    "loggers": {
        "django": {"handlers": ["console", "file"], "level": "INFO", "propagate": True},
        "django.request": {"handlers": ["console", "file"], "level": "ERROR", "propagate": False},
    },
}
