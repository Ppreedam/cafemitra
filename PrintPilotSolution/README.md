# PrintPilot Agent + Updater

Two WinForms apps, one solution:

- **PrintPilotAgent** → builds to `PrintPilot.exe` — the shop-facing print agent.
- **PrintPilotUpdater** → builds to `Updater.exe` — self-update helper, must sit next to `PrintPilot.exe`.

Both target `net8.0-windows`. Open `PrintPilot.sln` in Visual Studio, or:

```
dotnet build PrintPilotAgent -c Release
dotnet build PrintPilotUpdater -c Release
```

Deploy the **contents of both output folders together** in one install directory (so `PrintPilot.exe`, `Updater.exe`, and `version.txt` are all side by side).

## 1. Version check + self-update

- On every launch, `PrintPilot.exe` calls `GET {ApiBaseUrl}/api/agent/version-check/` (plain text response, e.g. `"56"`) and compares it to the local `version.txt` sitting next to the exe.
- If they don't match, it launches `Updater.exe` with `--pid --dir --exe --api` and exits immediately.
- **`Updater.exe`** waits for `PrintPilot.exe` to fully close, downloads `{ApiBaseUrl}/api/agent/update/`, extracts it, copies every file over the install directory (overwriting old files, with retry in case a DLL is still momentarily locked), refreshes `version.txt`, then relaunches `PrintPilot.exe` and closes itself.
- **Important:** if the update zip doesn't already contain an up-to-date `version.txt`, the updater re-fetches `version-check` after copying and writes it — so version.txt always ends up correct either way.
- Any failure during the version *check* itself (offline, server down) is swallowed — the app just starts normally on the current version instead of blocking the shop.

## 2. Remembered login (auto-login)

- On first manual login, email + password are saved to `%AppData%\CafeMitra\PrintPilotAgent\PrintPilot.Core.dll`.
- The name is disguised as a DLL so it doesn't stand out in the folder, but the real protection is that the contents are encrypted with **Windows DPAPI** (`ProtectedData`, `CurrentUser` scope) — unreadable outside this Windows account, even if copied elsewhere. This is safer than the literal ask of "just save id/pass in a file," so I built it this way.
- On next launch, if there's no cached access token, PrintPilot decrypts the saved credentials and logs in automatically — no typing needed.
- "Log out" clears both the saved token and the saved credentials file.

## 3. Silent offline retry (no MessageBox on startup)

- If auto-login fails because the shop has no internet (`HttpRequestException`/timeout), PrintPilot **never shows a MessageBox** for this — it just logs `"Still offline... will retry automatically"` and retries with backoff (3s → 5s → 10s → 20s → 30s → capped at 60s), indefinitely, until it's back online.
- If the server explicitly rejects the saved password (wrong/changed), it stops retrying and logs that manual login is needed — also without a popup, since nobody may be at the desk.
- Manual login (the actual Login button) still shows a MessageBox on failure, since that's an explicit user action expecting feedback.

## 4. Local bridge for the browser dashboard

Same as before, `http://127.0.0.1:8765`:
- `GET /status`
- `POST /settings` — `{ "printer": "..." }`
- `POST /test-print` / `POST /poster-print` — now also accept `"colorMode": "color" | "bw"`.

## 5. B/W vs Color per print job

- Each `PrintJob` from `/api/agent/jobs/` can carry a `colorMode` field (`"color"`/`"bw"`); if the server doesn't send one, PrintPilot falls back to guessing from the price label/service name.
- Before sending each job to the printer, PrintPilot runs `Set-PrintConfiguration -PrinterName '<name>' -Color $true/$false` to switch that specific printer into the right mode for *that* job — so the same physical printer can alternate between B/W and color jobs back to back. If a printer/driver doesn't support the toggle, it logs a note and continues instead of failing the job.

## Server endpoints this expects

| Endpoint | Method | Notes |
|---|---|---|
| `/api/agent/version-check/` | GET | Plain text version string, e.g. `56` |
| `/api/agent/update/` | GET | Zip of the full, updated install directory |
| `/api/auth/login/` | POST | `{email, password}` → `{token, refreshToken, user}` |
| `/api/auth/refresh/` | POST | `{refreshToken}` → same shape |
| `/api/agent/jobs/` | GET | `{jobs: [...]}` |
| `/api/agent/jobs/{id}/status/` | POST | `{status, message}` |
| `/api/orders/{id}/approve-cash/` \| `/reject-cash/` | POST | |

Adjust `ApiBaseUrl` in `%AppData%\CafeMitra\PrintPilotAgent\config.json` (defaults to `https://api.com`).
