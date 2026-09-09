# WebSocket ("New Job Available" Push) Setup

_Last updated: 2026-09-09_

This documents how the real-time WebSocket push works end-to-end: what it's
for, how it's wired locally, how it's deployed on production, and how to fix
it if it breaks again. It exists so a shop's desktop PrintPilot Agent finds
out about a new print job **instantly** instead of waiting for its next
polling tick.

## 1. What this actually is

- **Purpose**: push a "a new job just showed up, go check now" signal to the
  desktop Print Agent, over a WebSocket, so jobs get picked up immediately
  instead of only every `pollIntervalSeconds`.
- **No job data travels over the socket.** The server only ever sends
  `{"type": "job_available"}`. The agent's existing `GET /api/agent/jobs/`
  polling flow is still the single source of truth for job data - the push
  just triggers an extra poll immediately.
- **Route**: `wss://api.repetigo.com/ws/agent/jobs/` (mirrors the REST path
  `/api/agent/jobs/` on purpose).

### Pieces involved

| Piece | Where |
|---|---|
| Django Channels routing | `cafemitra_server/api/routing.py` (`websocket_urlpatterns`) |
| ASGI app wiring | `cafemitra_server/cafemitra_server/asgi.py` (`ProtocolTypeRouter`) |
| Consumer (auth + group join) | `cafemitra_server/api/consumers.py` (`AgentJobsConsumer`) |
| Server sends the push | `cafemitra_server/api/views.py` → `notify_agent_new_job()`, called whenever a new job is created |
| Channel layer backend | Redis, via `channels_redis` (`CHANNEL_LAYERS` in `settings.py`, keyed off `REDIS_URL`) |
| Desktop client | `Print Agent/Print Agent/WebSocketAgentClient.cs` |

### Why polling still exists at all

The desktop agent's poll timer (`Form1.cs`, `_pollTimer`) is the fallback/
safety-net. As of the current version:

- **WebSocket connected** → the poll timer is **stopped entirely**. No more
  periodic `/api/agent/jobs/` calls - the push tells the agent the instant a
  job appears.
- **WebSocket disconnected** (network blip, server restart, anything) → the
  poll timer **resumes immediately** at the configured interval
  (`pollIntervalSeconds` in `config.json`, default 10s), so a WS outage never
  delays a job discovery.

This is handled by `WebSocketAgentClient`'s `onConnectionChanged` callback,
wired up in `Form1.cs` where `_wsClient` is constructed. Both the "stop" and
"resume" transitions are logged to the agent's own activity log (and, since
this version, to a persistent file - see §5).

## 2. Local development setup

### 2.1 Requirements

- `channels`, `daphne`, `channels_redis` Python packages (already in
  `requirements-channels.txt`).
- A **Redis 5.0+** instance (ideally 7.x/8.x) reachable at whatever
  `REDIS_URL` points to. **This version floor matters** - `channels_redis`
  needs `BZPOPMIN` (Redis 5.0+) and uses `HELLO` (Redis 6.0+ RESP3
  handshake). An older Redis silently breaks the channel layer with
  `redis.exceptions.ResponseError: unknown command 'BZPOPMIN'` the moment a
  message needs to be dispatched through it - the WebSocket **connects**
  fine, but push delivery (and sometimes the handshake itself, depending on
  timing) fails.

### 2.2 The Windows gotcha that bit us

A stray **Redis 3.0** Windows service (installed ages ago, listening on the
default port 6379) satisfies a basic `PING` check but is missing the
commands above. It looks alive right up until `channels_redis` actually
tries to use it.

**Fix used**: run a modern Redis in Docker on a different host port instead
of fighting the old Windows service for port 6379.

```bash
# one-time: container already exists in this project as `cafemitra-test-redis`,
# mapped host 6380 -> container 6379
docker start cafemitra-test-redis
# if it doesn't exist yet:
# docker run -d --name cafemitra-test-redis -p 6380:6379 --restart unless-stopped redis:7
```

`cafemitra_server/.env`:

```env
REDIS_URL=redis://127.0.0.1:6380/0
```

Also set for durability across a machine restart:

- Docker Desktop → Settings → General → "Start Docker Desktop when you sign
  in" (or edit `%APPDATA%\Docker\settings.json`, set `"autoStart": true`).
- The container already has `--restart unless-stopped`, so once Docker's
  daemon is up, the container comes back on its own.

**After a machine restart**, if Docker Desktop isn't set to auto-start,
start Docker Desktop manually, then `docker start cafemitra-test-redis`,
*before* `python manage.py runserver` - the Django process only reads
`.env` once at startup, so if Redis isn't reachable yet when Django starts,
restart the Django server too after Redis is confirmed up.

### 2.3 Running the dev server with WebSocket support

`INSTALLED_APPS` in `settings.py` lists `"daphne"` **first**, specifically
so `manage.py runserver` auto-detects Channels and serves ASGI (HTTP +
WebSocket on the same port) instead of plain WSGI. You'll see this banner
confirming it:

```
Starting ASGI/Daphne version 4.0.0 development server at http://127.0.0.1:8000/
```

No separate command is needed locally - `python manage.py runserver` is
enough as long as Redis (§2.2) is reachable.

### 2.4 Verifying it locally

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/api/check/server/status/
# 200 = server up

python -c "
import asyncio, websockets
async def main():
    async with websockets.connect('ws://127.0.0.1:8000/ws/agent/jobs/',
        additional_headers={'Authorization': 'Bearer <a real AuthToken key>'}) as ws:
        print('connected')
asyncio.run(main())
"
```

A clean `connected` with no exception confirms routing + auth + the Redis
channel layer are all working.

## 3. Production setup

### 3.1 Systemd service (Daphne)

Production runs Daphne directly (not `manage.py runserver`) via systemd -
`/etc/systemd/system/cafemitra-api.service`:

```ini
[Unit]
Description=CafeMitra Django ASGI API and WebSocket service
After=network.target redis-server.service
Wants=redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/cafemitra/cafemitra_server
Environment=PYTHONUNBUFFERED=1
Environment=DJANGO_SETTINGS_MODULE=cafemitra_server.settings
ExecStart=/opt/venvs/cafemitra-global/bin/daphne -b 127.0.0.1 -p 8000 cafemitra_server.asgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Key points if this is ever rebuilt from scratch:

- `Wants=redis-server.service` / `After=redis-server.service` - production
  uses the OS's own `redis-server` systemd service, not Docker. Confirmed
  running Redis 8.0.5 - well above the 5.0+ floor from §2.1, so production
  has never hit the old-Redis problem that local dev did.
- Binds to `127.0.0.1:8000` only - not exposed directly to the internet;
  Nginx is the only thing allowed to reach it (see §3.2).
- `Restart=always` - if Daphne crashes, systemd brings it back.

Standard service management:

```bash
systemctl status cafemitra-api.service
systemctl restart cafemitra-api.service
journalctl -u cafemitra-api.service -n 100 --no-pager
```

### 3.2 Nginx: the part that actually matters here

Nginx sits in front of Daphne and terminates TLS. **A WebSocket upgrade
request looks like a plain HTTP GET to Nginx unless you explicitly tell it
to forward the Upgrade/Connection headers** - without that, Nginx proxies it
as ordinary HTTP, Django's normal URL resolver doesn't have a route for
`/ws/agent/jobs/` (that path only exists in the ASGI `websocket_urlpatterns`,
never in the HTTP `urls.py`), and the client gets a plain **404** instead of
the `101 Switching Protocols` it asked for.

The `api.repetigo.com` server block in
`/etc/nginx/sites-available/repetigo.conf` needs a dedicated `/ws/`
location, in addition to the normal `location /`:

```nginx
server {
    server_name api.repetigo.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket endpoint for agent jobs
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/repetigo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/repetigo.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
```

After editing:

```bash
nginx -t                      # validate BEFORE reloading
systemctl reload nginx        # only if -t passed
```

**Never leave a `.bak`/backup copy of a site config inside
`/etc/nginx/sites-enabled/`.** `nginx.conf` includes that directory with a
bare wildcard (`include /etc/nginx/sites-enabled/*;` - no `.conf` filter),
so any stray file in there - including a manually-made backup - gets parsed
as a real server block. If it declares the same `listen`/`server_name`
combo as the real config (likely, since it's a copy), `nginx -t` starts
failing with `duplicate listen options for [::]:443`, and **every future
reload silently fails** - which is exactly what happened here: the `/ws/`
fix had already been added to the real config file days earlier, but a
leftover `repetigo.conf.bak-ws-<timestamp>` in `sites-enabled/` blocked
every reload since, so the fix never actually went live until the backup
was moved out (to `/root/nginx-backups/`, not deleted) and Nginx reloaded.

If you need to keep a config backup while editing, copy it **outside**
`sites-available`/`sites-enabled` entirely (e.g. `/root/nginx-backups/`), or
give it a name Nginx's include glob won't match if it must stay nearby -
either way, confirm with `nginx -t` before trusting a reload will work.

### 3.3 Verifying production

```bash
# From any machine (the health endpoint doesn't need auth):
curl -i https://api.repetigo.com/api/check/server/status/

# WebSocket handshake, with a real AuthToken key:
python -c "
import asyncio, websockets
async def main():
    async with websockets.connect('wss://api.repetigo.com/ws/agent/jobs/',
        additional_headers={'Authorization': 'Bearer <token>'}) as ws:
        print('connected')
asyncio.run(main())
"
```

A clean `connected` (not an `InvalidStatus ... HTTP 404`) confirms the fix
is live.

## 4. Desktop agent: how it decides which server to use

`Print Agent/Print Agent/ApiBaseUrlProvider.cs`:

1. `RefreshBaseUrl` - pulls the current base URL from a small GitHub-hosted
   text file, persisted to `config.json`. This is production
   (`https://api.repetigo.com/`) under normal circumstances.
2. `UseLocalDevServerIfAvailable` - **once, at app startup only** (`Form1_
   Load`), probes `http://127.0.0.1:8000/api/check/server/status/` with a
   2.5s timeout. If it responds, the agent uses `127.0.0.1:8000` for the
   rest of that session (in-memory only, never written to `config.json`).

**Important consequence**: this local-dev check runs exactly once per
launch. If the local dev server wasn't reachable yet at that moment (e.g.
you're still starting it), the running agent process stays pointed at
production for its entire lifetime - restarting the local server later
does **not** make an already-running agent switch over. **Fully exit the
agent from the tray ("Exit", not just closing the window) and relaunch it**
to force a fresh check.

`config.json` lives at `%APPDATA%\CafeMitra\PrintAgent\config.json` and
always shows which URL the agent is *configured* to use (though not
necessarily which one it's using in-memory for this session, per the note
above).

## 5. Agent-side log file (for diagnosing this kind of thing later)

The agent's on-screen activity log is in-memory only and is lost the moment
the app is closed/exited. As of this version, every line is also appended
to a persistent file:

```
%APPDATA%\CafeMitra\PrintAgent\agent.log
```

capped at 2 MB (trimmed to the most recent half once exceeded). Read this
file directly instead of asking someone to keep the app open and copy-paste
its log window.

## 6. Troubleshooting checklist

| Symptom | Likely cause | Where to look |
|---|---|---|
| `WebSocket handshake failed... 404 when 101 expected` | Nginx `/ws/` location missing or not reloaded | §3.2 - check `nginx -T`, not just the file on disk |
| Same, but only in local dev | Old/incompatible Redis, or `manage.py runserver` didn't start in ASGI mode | §2.2 - check `redis-cli info server`, and confirm the "Starting ASGI/Daphne" banner |
| Agent seems to always hit production even with local server running | One-time startup check missed the window | §4 - fully exit (tray → Exit) and relaunch the agent |
| `redis.exceptions.ResponseError: unknown command 'BZPOPMIN'` | Redis < 5.0 | §2.1/§2.2 |
| `nginx -t` fails with `duplicate listen options` | A stray backup file is sitting in `sites-enabled/` | §3.2 - `ls -la /etc/nginx/sites-enabled/`, move (don't delete) anything that isn't a real symlink |
| Nginx config file has the right content but it's still not behaving that way | Nginx was never reloaded after the edit | Compare `systemctl status nginx` (process start time) against the config file's mtime; `systemctl reload nginx` |
