from django.urls import re_path

from . import consumers

# Mirrors the REST path /api/agent/jobs/ on purpose - keeps this discoverable
# and lets Nginx route on a single /ws/ prefix without inspecting further.
websocket_urlpatterns = [
    re_path(r"^ws/agent/jobs/?$", consumers.AgentJobsConsumer.as_asgi()),
]
