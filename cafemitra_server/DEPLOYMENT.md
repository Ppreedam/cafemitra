# cafemitra_server - Complete Production Deployment Guide

This document covers the complete deployment of the Django application, including the original HTTP deployment and the WebSocket setup with Daphne, Redis, systemd, Nginx, and SSL.

## 1. Server details

Project directory: /root/repetigo/cafemitra/cafemitra_server
Virtual environment: /root/downloadera/downloadera_venv
Operating system: Ubuntu 24.04 LTS
Application domains: api.repetigo.com, repetigo.com, www.repetigo.com
Application service: cafemitra-daphne.service
Internal application port: 3005

## 2. Install system packages

    apt update
    apt install -y python3 python3-venv python3-pip redis-server nginx git certbot python3-certbot-nginx

Enable Redis and verify it:

    systemctl enable --now redis-server
    redis-cli ping

Expected result: PONG

## 3. Get the application code

    cd /root/repetigo/cafemitra
    git pull origin main
    cd /root/repetigo/cafemitra/cafemitra_server

Never store passwords, API keys, tokens, or private keys in Git.

## 4. Python environment and dependencies

    /root/downloadera/downloadera_venv/bin/pip install --upgrade pip
    /root/downloadera/downloadera_venv/bin/pip install -r requirements.txt
    if [ -f requirements-channels.txt ]; then /root/downloadera/downloadera_venv/bin/pip install -r requirements-channels.txt; fi

If the virtual environment does not exist:

    python3 -m venv /root/downloadera/downloadera_venv

## 5. Environment file

Create .env in the project directory and add the real production values. Do not copy secrets into this document.

    nano /root/repetigo/cafemitra/cafemitra_server/.env

Required settings normally include:

    DJANGO_SECRET_KEY=replace-with-a-long-random-secret
    DJANGO_DEBUG=False
    DJANGO_ALLOWED_HOSTS=api.repetigo.com,repetigo.com,www.repetigo.com,localhost,127.0.0.1
    REDIS_URL=redis://127.0.0.1:6379/0
    CORS_ALLOWED_ORIGINS=https://repetigo.com,https://www.repetigo.com
    CSRF_TRUSTED_ORIGINS=https://api.repetigo.com,https://repetigo.com,https://www.repetigo.com

Use the exact database and email variables required by cafemitra_server/settings.py.

    chmod 600 /root/repetigo/cafemitra/cafemitra_server/.env

## 6. Django preparation

    cd /root/repetigo/cafemitra/cafemitra_server
    /root/downloadera/downloadera_venv/bin/python manage.py check
    /root/downloadera/downloadera_venv/bin/python manage.py migrate
    /root/downloadera/downloadera_venv/bin/python manage.py collectstatic --noinput

Create media directory when required:

    mkdir -p /root/repetigo/cafemitra/cafemitra_server/media

## 7. WebSocket and Channels configuration

The Django settings must define ASGI_APPLICATION, REDIS_URL, and CHANNEL_LAYERS. The channel backend must use channels_redis.core.RedisChannelLayer.

Redis must be running before Daphne starts. Otherwise WebSocket clients can receive HTTP 500 instead of status 101 during the handshake.

Verify:

    systemctl is-active redis-server
    redis-cli ping
    grep -RInE ASGI_APPLICATION|CHANNEL_LAYERS|REDIS_URL cafemitra_server --include=*.py

## 8. systemd service

The service must run Daphne, not the Django development server. Confirm the real ExecStart and port with:

    systemctl cat cafemitra-daphne.service

A typical service uses the following values:

    [Unit]
    Description=Cafemitra Django ASGI service
    Requires=redis-server.service
    After=redis-server.service network.target

    [Service]
    Type=simple
    User=root
    WorkingDirectory=/root/repetigo/cafemitra/cafemitra_server
    EnvironmentFile=/root/repetigo/cafemitra/cafemitra_server/.env
    ExecStart=/root/downloadera/downloadera_venv/bin/daphne -b 127.0.0.1 -p 3005 cafemitra_server.asgi:application
    Restart=always
    RestartSec=5

    [Install]
    WantedBy=multi-user.target

Apply changes:

    systemctl daemon-reload
    systemctl enable --now cafemitra-daphne.service
    systemctl restart cafemitra-daphne.service
    systemctl status cafemitra-daphne.service --no-pager

## 9. Nginx HTTP and WebSocket reverse proxy

Nginx must pass normal HTTP requests and WebSocket upgrade headers. Use the existing site configuration and keep the internal port consistent with the systemd service.

Important WebSocket directives:

    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 600;
    proxy_send_timeout 600;

Example location blocks:

    location /ws/ {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600;
        proxy_send_timeout 600;
    }

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600;
        proxy_send_timeout 600;
    }

Validate and reload:

    nginx -t
    systemctl reload nginx

## 10. Static and media files

Use the aliases configured for the project. Confirm that STATIC_ROOT and MEDIA_ROOT match the Nginx aliases.

    ls -ld /root/repetigo/cafemitra/cafemitra_server/static
    ls -ld /root/repetigo/cafemitra/cafemitra_server/media

## 11. SSL certificate

After DNS A and AAAA records point to this server, issue or renew the certificate:

    certbot --nginx -d api.repetigo.com -d repetigo.com -d www.repetigo.com

Verify renewal:

    certbot renew --dry-run

## 12. Normal deployment after git pull

    cd /root/repetigo/cafemitra/cafemitra_server
    git pull origin main
    /root/downloadera/downloadera_venv/bin/pip install -r requirements.txt
    if [ -f requirements-channels.txt ]; then /root/downloadera/downloadera_venv/bin/pip install -r requirements-channels.txt; fi
    /root/downloadera/downloadera_venv/bin/python manage.py check
    /root/downloadera/downloadera_venv/bin/python manage.py migrate
    /root/downloadera/downloadera_venv/bin/python manage.py collectstatic --noinput
    systemctl restart redis-server
    systemctl restart cafemitra-daphne.service
    nginx -t && systemctl reload nginx

## 13. Verification checklist

    systemctl is-enabled redis-server
    systemctl is-active redis-server
    redis-cli ping
    systemctl is-enabled cafemitra-daphne.service
    systemctl is-active cafemitra-daphne.service
    ss -ltnp | grep 3005
    nginx -t
    curl -I https://api.repetigo.com/

A successful WebSocket connection should complete with HTTP status 101. HTTP 500 during the handshake usually means Redis is unavailable, Daphne is failing, the WebSocket route is wrong, or Nginx is missing upgrade headers.

## 14. Logs and troubleshooting

Daphne logs:

    journalctl -u cafemitra-daphne.service -n 100 --no-pager
    journalctl -u cafemitra-daphne.service -f

Redis logs:

    journalctl -u redis-server.service -n 100 --no-pager

Nginx logs:

    tail -n 100 /var/log/nginx/error.log
    tail -n 100 /var/log/nginx/access.log

For WebSocket 500 errors, check in this order:

    redis-cli ping
    systemctl status redis-server --no-pager
    systemctl status cafemitra-daphne.service --no-pager
    journalctl -u cafemitra-daphne.service -n 100 --no-pager
    nginx -t
    ss -ltnp | grep 3005

## 15. Reboot behavior

Both Redis and cafemitra-daphne.service are enabled, so they start automatically after a server reboot.

    systemctl is-enabled redis-server
    systemctl is-enabled cafemitra-daphne.service
    systemctl is-active redis-server
    systemctl is-active cafemitra-daphne.service

## 16. Quick redeploy command

Use this command after pushing changes to the `main` branch:

    cd /root/repetigo/cafemitra && git pull origin main && cd /root/repetigo/cafemitra/cafemitra_server && /root/downloadera/downloadera_venv/bin/pip install -r requirements.txt && if [ -f requirements-channels.txt ]; then /root/downloadera/downloadera_venv/bin/pip install -r requirements-channels.txt; fi && /root/downloadera/downloadera_venv/bin/python manage.py check && /root/downloadera/downloadera_venv/bin/python manage.py migrate && /root/downloadera/downloadera_venv/bin/python manage.py collectstatic --noinput && systemctl restart redis-server && systemctl restart cafemitra-daphne.service && nginx -t && systemctl reload nginx

Verify the redeployment:

    systemctl is-active redis-server
    redis-cli ping
    systemctl is-active cafemitra-daphne.service
    nginx -t
