# CafeMitra Deployment Documentation

_Last updated: 2026-09-06_

This document records the current VPS deployment layout and the repeatable deployment procedure for both projects:

- Backend: `/root/cafemitra/cafemitra_server`
- Frontend: `/root/cafemitra/cafemitra_client`
- Backend public URL: `https://api.repetigo.com`
- Frontend public URL: `https://repetigo.com`
- VPS hostname: `srv1959465.hstgr.cloud`
- Backend systemd service: `cafemitra-api.service`
- Backend local listener: `127.0.0.1:8000`

> Secrets are intentionally not documented here. Keep production environment files on the server and never commit them to Git.

## 1. Current traffic/configuration

Nginx terminates HTTPS and proxies API traffic to the backend on `127.0.0.1:8000`. TLS certificates are managed by Certbot. The frontend is served by Nginx over `repetigo.com` and `www.repetigo.com`.

Important files to inspect:

```bash
/etc/nginx/sites-enabled/
/etc/nginx/sites-available/
/etc/systemd/system/cafemitra-api.service
/etc/letsencrypt/live/repetigo.com/
/etc/letsencrypt/live/api.repetigo.com/
```

Health check:

```bash
curl -i https://api.repetigo.com/api/check/server/status/
```

Expected result: HTTP `200` and a JSON response showing the server is running.

## 2. First-time deployment/reference

### Backend (`cafemitra_server`)

```bash
cd /root/cafemitra/cafemitra_server

# Verify the project and environment files without printing secret values
ls -la
find . -maxdepth 2 -type f \( -name "requirements*.txt" -o -name "manage.py" -o -name ".env*" \) -print

# Use the existing virtual environment if present; otherwise create one
[ -d venv ] || python3 -m venv venv
. venv/bin/activate
python --version

# Install/update Python dependencies
python -m pip install --upgrade pip
[ -f requirements.txt ] && python -m pip install -r requirements.txt

# Django steps, only when manage.py exists
[ -f manage.py ] && python manage.py migrate --noinput
[ -f manage.py ] && python manage.py collectstatic --noinput

# Apply correct ownership if needed, then start the service
systemctl daemon-reload
systemctl enable cafemitra-api.service
systemctl restart cafemitra-api.service
systemctl --no-pager --full status cafemitra-api.service
```

Before the first production start, confirm the service file contains the correct `WorkingDirectory`, virtualenv Python path, environment file, bind address, and port. Do not replace the service file during a normal code deployment.

### Frontend (`cafemitra_client`)

```bash
cd /root/cafemitra/cafemitra_client
ls -la
node --version
npm --version

# Prefer the lockfile that exists in the project
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build
```

After the build, publish the generated `dist/` or `build/` directory to the Nginx document root configured for `repetigo.com`. Confirm the exact root before copying:

```bash
nginx -T 2>/dev/null | grep -E "server_name|^[[:space:]]*root "
```

Then validate and reload Nginx:

```bash
nginx -t && systemctl reload nginx
```

## 3. Repeat deployment: backend

Run these steps after uploading or pulling new backend code:

```bash
cd /root/cafemitra/cafemitra_server

# Optional but recommended: check what will change
git status
git log -1 --oneline

# If deploying from Git, use the project’s normal branch
# git pull --ff-only origin <branch>

. venv/bin/activate
python -m pip install -r requirements.txt

# Run migrations only if the release contains migration changes
[ -f manage.py ] && python manage.py migrate --noinput
[ -f manage.py ] && python manage.py collectstatic --noinput

# Restart only after code and dependencies are ready
systemctl restart cafemitra-api.service
systemctl --no-pager --full status cafemitra-api.service

# Check recent errors and the public endpoint
journalctl -u cafemitra-api.service -n 80 --no-pager
curl -i --max-time 10 https://api.repetigo.com/api/check/server/status/
```

### Backend deployment order

1. Upload/pull the new code.
2. Confirm the production `.env` was not overwritten.
3. Install Python dependencies.
4. Run database migrations, if included.
5. Run static collection, if applicable.
6. Restart `cafemitra-api.service`.
7. Check the service status and logs.
8. Test the health endpoint and one authenticated/business API endpoint.

## 4. Repeat deployment: frontend

```bash
cd /root/cafemitra/cafemitra_client

# Optional but recommended: check what will change
git status
git log -1 --oneline

# If deploying from Git, use the project’s normal branch
# git pull --ff-only origin <branch>

if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build
```

Publish the newly generated build to the existing Nginx `root` directory. Use the configured directory rather than guessing it:

```bash
nginx -T 2>/dev/null | grep -B3 -A3 -E "server_name .*repetigo.com|^[[:space:]]*root "
```

After publishing:

```bash
nginx -t
systemctl reload nginx
curl -I https://repetigo.com/
curl -I https://api.repetigo.com/api/check/server/status/
```

If the frontend uses build-time environment variables, verify the production `.env`/`.env.production` before `npm run build`. A frontend rebuild is required after changing such variables.

## 5. Recommended safe combined release order

1. Take a database backup if the release changes models or data.
2. Deploy backend dependencies and code.
3. Run migrations and restart the API.
4. Verify the API health endpoint.
5. Build and publish the frontend.
6. Reload Nginx and test both HTTPS domains.
7. Watch logs for several minutes:

```bash
journalctl -u cafemitra-api.service -f
```

Stop log watching with `Ctrl+C`; it does not stop the API service.

## 6. Rollback procedure

### Backend rollback

```bash
cd /root/cafemitra/cafemitra_server
git log --oneline -5
# git checkout <known-good-commit>
. venv/bin/activate
python -m pip install -r requirements.txt
systemctl restart cafemitra-api.service
curl -i https://api.repetigo.com/api/check/server/status/
```

Do not reverse database migrations automatically. If a migration must be reversed, review its data impact and take a backup first.

### Frontend rollback

Keep the previous published build in a dated backup directory before replacing the live build. Restore that directory, then run:

```bash
nginx -t && systemctl reload nginx
curl -I https://repetigo.com/
```

## 7. Troubleshooting commands

```bash
systemctl --no-pager --full status cafemitra-api.service
journalctl -u cafemitra-api.service -n 120 --no-pager
ss -ltnp | grep -E ":8000|:80|:443"
nginx -t
systemctl --no-pager status nginx
curl -i http://127.0.0.1:8000/api/check/server/status/
curl -i https://api.repetigo.com/api/check/server/status/
curl -I https://repetigo.com/
```

Common causes:

- `502 Bad Gateway`: API service is stopped, listening on another port, or Nginx proxy settings do not match.
- `404`: wrong URL prefix or route; the verified health route is `/api/check/server/status/`.
- Static files missing: frontend build was not published to the configured Nginx root, or asset base URL is wrong.
- Old frontend in browser: use a hard refresh and verify the newly generated asset names/timestamps.
- Service starts then exits: inspect `journalctl -u cafemitra-api.service` and check environment values, dependencies, migrations, and file permissions.

## 8. Deployment checklist

- [ ] Correct project/branch and commit verified.
- [ ] Production environment files preserved.
- [ ] Database backup completed when required.
- [ ] Backend dependencies installed.
- [ ] Migrations completed successfully.
- [ ] API service restarted and active.
- [ ] API health endpoint returns HTTP 200.
- [ ] Frontend built successfully.
- [ ] Frontend build published to the configured Nginx root.
- [ ] `nginx -t` passes.
- [ ] Nginx reloaded.
- [ ] Frontend and API HTTPS URLs tested.
- [ ] Recent service logs reviewed.

## 9. Security rules

- Never place passwords, tokens, private keys, or production `.env` contents in this document or Git.
- Do not run `npm install` or `pip install` from an untrusted directory.
- Use `git pull --ff-only` for predictable releases.
- Do not delete the current release until the new release has passed health checks.
- Keep Nginx and systemd configuration backups before changing them.
