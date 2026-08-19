import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .views import user_for_token_key

# Application-defined close code for "missing/invalid/expired token" (RFC
# 6455 reserves 4000-4999 for app use). Rejecting before accept() makes
# Daphne surface this as a failed handshake (non-101 response), not an
# accepted-then-immediately-closed socket - ClientWebSocket.ConnectAsync on
# the desktop-agent side sees this as a WebSocketException.
CLOSE_CODE_UNAUTHORIZED = 4401


class AgentJobsConsumer(AsyncWebsocketConsumer):
    """Signal-only channel for the desktop Print Agent: tells a connected
    shop "you have a new job, go poll now" - no job data ever travels over
    this socket. Auth mirrors the existing HTTP Bearer-token scheme (see
    views.user_for_token_key), not Channels' session/cookie-based
    AuthMiddlewareStack, since this app has no session concept."""

    async def connect(self):
        headers = dict(self.scope["headers"])  # ASGI: lower-cased byte keys
        raw_auth = headers.get(b"authorization", b"").decode("utf-8", "ignore")
        key = raw_auth.replace("Bearer ", "", 1).strip()

        user = await database_sync_to_async(user_for_token_key)(key) if key else None
        if user is None:
            await self.close(code=CLOSE_CODE_UNAUTHORIZED)
            return

        self.group_name = f"agent-jobs-{user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # The agent never sends anything meaningful - ClientWebSocket's
        # built-in KeepAliveInterval handles protocol-level ping/pong below
        # this layer. No-op stub kept for forward-compatibility.
        pass

    async def job_available(self, event):
        """Channel-layer event handler - dispatched here because
        notify_agent_new_job() sends {"type": "job.available"} (dots become
        underscores for the method name). Distinct from the wire-level JSON
        "type" sent to the client below."""
        await self.send(text_data=json.dumps({"type": "job_available"}))
