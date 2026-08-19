# Backend Deploy Instructions — WebSocket Instant Job-Pickup

Yeh instructions **production VPS pe kisi bhi agent/operator ko de sakte ho** — self-contained hain, is repo ke baaki context ki zaroorat nahi. Goal: `cafemitra_server` (Django) ko WebSocket support (Django Channels + Redis) ke saath deploy karna, taaki Print Agent ko naye orders ka instant push mile (10s poll ka wait nahi).

**Risk level**: Low-medium. Koi database migration nahi hai (koi naya model nahi), sab kuch additive hai (existing REST API bilkul unchanged rehta hai). Sabse zyada risk hai production process (WSGI→ASGI) switch me — isliye Step 0 (investigate) skip mat karna.

**Best time to do this**: Low-traffic window, taaki agar kuch galat ho to turant revert kar sako bina zyada shops affect kiye.

**Chosen approach**: **Option B** (§Step 5) — purana WSGI/gunicorn process bilkul touch nahi hota, sirf ek naya Daphne process alag port (8001) pe `/ws/` ke liye add hota hai. Kam se kam blast-radius, deploy fail ho to sirf naya process+nginx-block hatana padega.

## Confirmed environment (Hostinger VPS, "Kodee" panel se verify kiya)

| Cheez | Value |
|---|---|
| Repo path | `/root/repetigo/cafemitra` |
| Django project path | `/root/repetigo/cafemitra/cafemitra_server` |
| Virtualenv activate | `source /root/downloadera/downloadera_venv/bin/activate` |
| Domain | `api.repetigo.com` |
| Code pull status | ✅ Done (`git pull origin main`, merge clean, `050c401..a56039f`) |

---

## Step 0 — Pehle current setup samjho (skip mat karna)

Kuch bhi badalne se pehle yeh 3 cheezein pata karo aur likh lo:

```bash
# 1. Django ko abhi kaun sa process chala raha hai?
ps aux | grep -i gunicorn
systemctl list-units --type=service | grep -iE "cafemitra|django|gunicorn"
# jo bhi systemd service mile, uska exact unit-file path note karo:
# systemctl status <service-name>   # "Loaded:" line me path dikhega, usually /etc/systemd/system/*.service

# 2. Nginx abhi kis port pe proxy kar raha hai?
sudo nginx -T 2>/dev/null | grep -B5 -A15 "server_name api.repetigo.com"
# "proxy_pass http://127.0.0.1:XXXX;" wali line note karo

# 3. .env file kahan hai?
find / -maxdepth 6 -name ".env" -path "*cafemitra*" 2>/dev/null
```

Agar in me se koi bhi unclear ho, aage badhne se pehle confirm kar lo — agle steps in exact values pe depend karte hain.

---

## Step 1 — Naya code lao ✅ (already done)

```bash
cd /root/repetigo/cafemitra
git pull origin main
source /root/downloadera/downloadera_venv/bin/activate
```

Pull ho chuka hai (`050c401..a56039f`, "Merge made by the 'ort' strategy", 7 files changed). Yeh files hone chahiye (naye/modified) — confirm kar lo:
- `cafemitra_server/asgi.py` — **naya**
- `api/consumers.py` — **naya**
- `api/routing.py` — **naya**
- `requirements-channels.txt` — **naya**
- `cafemitra_server/settings.py` — modified (`ASGI_APPLICATION`, `CHANNEL_LAYERS`, `INSTALLED_APPS` me `daphne`+`channels`)
- `api/views.py` — modified (`notify_agent_new_job` helper + 6 call sites + `user_for_token_key` refactor)

Agla step (venv me) dependencies install karna hai.

---

## Step 2 — Redis install karo

```bash
sudo apt-get update
sudo apt-get install -y redis-server

# Confirm localhost-only bind hai (default already sahi hona chahiye, external
# exposure ki zaroorat nahi kyunki Django aur Redis same machine pe hain):
grep "^bind" /etc/redis/redis.conf
# expected: bind 127.0.0.1 -::1

sudo systemctl enable --now redis-server
redis-cli ping
# expected output: PONG
```

Agar `bind` line kuch aur dikhaye (jaise `0.0.0.0`), usse `127.0.0.1 -::1` pe fix karo aur `sudo systemctl restart redis-server` chalao — Redis ko internet pe expose karne ki koi zaroorat nahi hai.

---

## Step 3 — Naye Python dependencies install karo

Jo bhi virtualenv/environment production Django process use karta hai, usme:

```bash
pip install -r requirements-channels.txt
```

Yeh install karega: `channels`, `daphne`, `channels_redis`, `redis`. (Exact pinned versions file me hain, dev-machine pe already resolve ho chuke the: `channels==4.3.2`, `daphne==4.0.0`, `channels_redis==4.3.0`, `redis==8.1.0`.)

---

## Step 4 — `.env` config (sirf agar Redis alag jagah hai)

Default `REDIS_URL` already `redis://127.0.0.1:6379/0` hai (`settings.py` me hardcoded default) — agar Redis isi machine pe, default port pe hai (Step 2 se), **yeh step skip kar sakte ho**.

Sirf agar Redis kahin aur host/port pe hai, `.env` file me add karo:
```
REDIS_URL=redis://<host>:<port>/0
```

---

## Step 5 — Naya Daphne process chalao (sirf `/ws/` ke liye)

**Chosen: Option B** — purana gunicorn/WSGI process **bilkul mat chhedo** (existing HTTP API waise hi chalta rehta hai). Sirf ek naya, halka Daphne process chalao dusre port (8001) pe, sirf WS traffic ke liye:

```bash
daphne -b 127.0.0.1 -p 8001 cafemitra_server.asgi:application
```

Systemd service banao taaki auto-restart ho aur reboot survive kare:

```ini
# /etc/systemd/system/cafemitra-ws.service
[Unit]
Description=CafeMitra WebSocket (Daphne ASGI, /ws/ only)
After=network.target redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/repetigo/cafemitra/cafemitra_server
Environment="PATH=/root/downloadera/downloadera_venv/bin"
ExecStart=/root/downloadera/downloadera_venv/bin/daphne -b 127.0.0.1 -p 8001 cafemitra_server.asgi:application
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cafemitra-ws
sudo systemctl status cafemitra-ws   # "active (running)" confirm karo
```

> **Baad me (optional consolidation)**: jab WS production me kuch hafton stable chal jaaye, chaaho to purana gunicorn/WSGI process bhi isi Daphne process se replace kar sakte ho (ek hi process HTTP+WS dono serve kare, port 8000 pe) — abhi ke liye zaroori nahi, do-process setup hi safe aur sufficient hai.

---

## Step 6 — Nginx config update karo

Existing Nginx config file me (jo Step 0 me mila tha) yeh add karo:

```nginx
# http {} block me ek baar (agar pehle se na ho):
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
```

```nginx
# server {} block me, existing HTTP location ke saath, naya location add karo:
location /ws/ {
    proxy_pass http://127.0.0.1:8001;   # cafemitra-ws.service (Step 5)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # WS connections lambe samay tak khule rehte hain, mostly idle -
    # Nginx ka default 60s timeout inhe silently kill kar deta hai.
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
```

Existing main `location /` block ka `proxy_pass` **isse touch mat karo** — wo purane gunicorn/WSGI port ko hi point karta rehta hai, sirf `/ws/` naya block hai.

Test aur reload:
```bash
sudo nginx -t          # "syntax is ok" + "test is successful" confirm karo
sudo systemctl reload nginx
```

---

## Step 7 — Verify (deploy "done" mat maano jab tak yeh sab pass na ho)

### 7a. Existing HTTP API abhi bhi kaam kar raha hai
```bash
curl -s https://api.repetigo.com/api/check/server/status/
# expected: {"status": "ok", "message": "..."}
```
Agar yeh fail ho, **turant Step 5/6 revert karo** (neeche Rollback dekho) — matlab process-switch ne kuch tod diya.

### 7b. WebSocket route reachable hai
Ek chhota Python script (kisi bhi machine se, `pip install websockets` chahiye):
```python
import asyncio, websockets

async def test():
    try:
        async with websockets.connect(
            "wss://api.repetigo.com/ws/agent/jobs/",
            additional_headers={"Authorization": "Bearer invalid-token-for-test"}
        ):
            print("UNEXPECTED: connection accepted with a bad token")
    except websockets.exceptions.InvalidStatus as e:
        print(f"Expected rejection (good sign): {e}")

asyncio.run(test())
```
Expected output: `"Expected rejection..."` with an **HTTP 403** mentioned (matlab route exist karta hai aur auth-check kaam kar raha hai). Agar `404` aaye, iska matlab route hi nahi mila (Nginx/Daphne config me kuch galat hai — Step 5/6 dobara check karo).

### 7c. Real end-to-end (ek real shop/test-account se)
1. Us shop ka Print Agent open karo, log check karo — `"WebSocket connected"` line aani chahiye.
2. Ek test order place karo (Cash Counter / No Payment mode se) us shop ke liye.
3. Print Agent turant (10s wait ke bina) job pick kare — yehi asli proof hai ki poora pipeline kaam kar raha hai.

---

## Rollback (agar kuch tootta hai)

Backend deploy **poori tarah reversible** hai:

```bash
# Nginx: /ws/ location aur map block hata do us config file se, phir:
sudo nginx -t && sudo systemctl reload nginx

# Process: naya Daphne service band karo (purana gunicorn to touch hi nahi hua tha)
sudo systemctl stop cafemitra-ws
sudo systemctl disable cafemitra-ws

# Code: agar zaroorat pade, git revert/checkout purane commit pe
git log --oneline -5   # deploy se pehle wala commit hash dhoondo
git checkout <purana-commit-hash> -- cafemitra_server/settings.py api/views.py
# (naye files asgi.py/consumers.py/routing.py chhod bhi sakte ho - unused rehenge, harm nahi karenge)
```

Redis ko uninstall karne ki zaroorat nahi hai rollback ke liye — bas WS access nahi hoga, baaki system unaffected rahega.

---

## Quick reference — kya naya hai is deploy me

| File | Status | Kya karta hai |
|---|---|---|
| `cafemitra_server/asgi.py` | Naya | ASGI entry point, HTTP + WebSocket dono route karta hai |
| `api/consumers.py` | Naya | `AgentJobsConsumer` — WebSocket auth + per-shop group |
| `api/routing.py` | Naya | `/ws/agent/jobs/` route |
| `requirements-channels.txt` | Naya | 4 naye Python packages ki pinned versions |
| `cafemitra_server/settings.py` | Modified | `ASGI_APPLICATION`, `CHANNEL_LAYERS`, `INSTALLED_APPS` |
| `api/views.py` | Modified | `notify_agent_new_job()` helper, 6 call sites, `user_for_token_key` refactor |

Koi database migration nahi, koi naya environment-secret (Redis local hi hai) zaroori nahi, koi breaking change existing endpoints me nahi.

---

## Appendix — VPS-panel AI agent (Kodee) ke liye ready prompt

Agar VPS pe koi built-in AI-agent panel hai (jaise Hostinger ka "Kodee"), yeh ek hi prompt copy-paste kar sakte ho — code pull + venv activate already ho chuka maan ke likha hai:

```
RepetiGo backend pe WebSocket feature deploy karna hai (code+venv ready hai). Yeh sab karo:

- Redis install karo (fresh/modern, apt se): apt install -y redis-server && systemctl enable --now redis-server && redis-cli ping (PONG expect)

- Python deps: pip install -r requirements-channels.txt

- Production process: purana gunicorn/WSGI ko MAT CHHEDNA. Naya Daphne process alag port (8001) pe WS ke liye chalao, systemd service banao auto-restart ke saath: daphne -b 127.0.0.1 -p 8001 cafemitra_server.asgi:application

- Nginx me /ws/ location add karo (api.repetigo.com config me) - upgrade-headers + 3600s timeout ke saath, proxy_pass 127.0.0.1:8001 pe

- REDIS_URL .env me set karo sirf agar Redis default (127.0.0.1:6379) se alag jagah/port pe hai, warna skip

- nginx -t && systemctl reload nginx

- Verify karo: existing API pehle jaisa kaam kare + naya /ws/ route 404 na de

Koi DB migration nahi chahiye.
```

(915 characters — kai VPS-panel agent-boxes ka 1000-char limit hota hai, isliye jaan-boojh kar compact rakha hai.)
