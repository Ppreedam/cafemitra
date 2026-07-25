import re

from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("api/", include("api.urls")),
    # django.conf.urls.static.static() only registers this route when
    # DEBUG=True. This app has no separate web server / storage backend
    # fronting /media/ (no nginx, no S3), so media must be served by this
    # process in every environment - registered directly, unconditionally.
    re_path(rf"^{re.escape(settings.MEDIA_URL.lstrip('/'))}(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
