# Print Agent — Python Rewrite Roadmap

Yeh file **planning document** hai — current C# `Print Agent` (`Print Agent/Print Agent`) ko Python me dobara banane ka poora roadmap: starting (project setup) se leke distribution (GitHub Releases se end-user tak) tak. Koi code abhi nahi likha gaya — pehle iske against alignment karo, phir phase-by-phase build karenge.

Feature-list `PRINT_AGENT_API.md` aur current C# source (`Print Agent/Print Agent/*.cs`) se derive ki gayi hai, taaki rewrite me koi feature chhoote na. Jahan current app me koi known gap/bug tha, wahan "🔧 Improve" note diya hai — rewrite ka mauka hai unhe fix karne ka, purani galtiyan copy karne ka nahi.

---

## 1. Goal & Scope

Ek Windows desktop app jo:
1. Cafe-owner ke CafeMitra account se login/authenticate ho.
2. `cafemitra_server` API ko poll karke print jobs + passport-AI jobs uthaaye, print kare / Gemini se AI photo generate kare, aur status wapas server ko report kare.
3. Local HTTP bridge serve kare taaki website ka "PrintPilot Setup" page browser se hi printer configure kar sake.
4. Khud-ba-khud update ho sake (naya version detect + install, bina manual reinstall ke).
5. Ek `.exe` installer ke roop me GitHub se distribute ho.

**Scope me NAHI hai** (abhi ke liye): macOS/Linux support, multi-shop/multi-account ek hi instance me, cloud-hosted print queue (already cafemitra_server handle karta hai).

---

## 2. Tech Stack (recommended)

| Concern | Library | Kyun |
|---|---|---|
| GUI framework | **PySide6** | WinForms jaisa capable (forms, grid, timer, tray-icon), Qt-based, LGPL license (commercially safe) |
| HTTP client | **httpx** (ya `requests`) | Sync + async dono support, timeout/retry config simple |
| Windows printing | **pywin32** (`win32print`, `win32ui`) | Native printer list + raw print access |
| PDF rendering | **PyMuPDF** (`fitz`) | Server-side bhi already isi library pe depend karta hai (`extract-pdf-text` tool) — team already familiar |
| Credential encryption | **pywin32** (`win32crypt.CryptProtectData`) | DPAPI wrapper, current-user-scoped encryption jaisa C# `ProtectedData` |
| Gemini automation | **Playwright** (sync API) | Robust selectors, auto-wait, screenshot/debug tools — current WebView2 JS-injection hack se zyada maintainable (🔧 Improve #4 dekho) |
| Local bridge server | **`http.server`** (stdlib) ya **FastAPI + uvicorn** (agar background thread me lightweight chalana ho) | Stdlib se shuru karo (dependency-free), FastAPI later agar routes badhein |
| Config/state storage | **`pydantic`** models + JSON file (`%APPDATA%\CafeMitra\PrintAgent\config.json`) | Type-safe load/save, current C# `AgentConfig` jaisa |
| Packaging | **PyInstaller** (`--onefile --windowed`) | Sabse mature, single-exe output |
| Installer | **Inno Setup** | Free, scriptable, current `RepetigoInstaller.exe` pattern se compatible |
| Distribution | **GitHub Releases** | Stable versioned download URLs, changelog attach ho sakta hai |

---

## 3. Module Structure (proposed)

C# file-per-concern pattern hi follow karo, Python me:

```
print_agent/
├── main.py                  # entry point, app bootstrap
├── config.py                 # AgentConfig load/save  (C#: AgentConfig.cs)
├── credential_store.py       # DPAPI-encrypted email/password (C#: CredentialStore.cs)
├── api_client.py              # CafeMitra server HTTP client, auth+refresh (C#: CafeMitraApi.cs)
├── models.py                  # PrintJob, PassportJob, AuthResponse, DTOs (C#: Models.cs)
├── printing/
│   ├── print_service.py       # PDF/image -> printer (C#: PrintPdf/PrintImage in Form1.cs)
│   └── qr_print_service.py    # QR test-page/poster print (C#: QrPrintService.cs)
├── gemini/
│   └── gemini_automation.py   # Playwright-driven AI photo generation
├── local_server.py            # 127.0.0.1:8765 bridge for website (C#: LocalStatusServer.cs)
├── version_checker.py         # update-check + updater launch (C#: VersionChecker.cs)
├── ui/
│   ├── main_window.py         # PySide6 main window, tabs/nav
│   └── theme.py               # colors/styling (C#: Theme.cs)
└── worker/
    ├── job_poller.py          # print-queue polling loop (Form1.cs: PollAndPrintAsync)
    └── passport_poller.py     # passport-AI polling loop (Form1.cs: PollPassportPhotoJobsAsync)

print_agent_updater/           # separate small app, jaisa PrintAgentUpdater/
└── main.py                    # download zip, close+replace+relaunch main app
```

---

## 4. Feature Inventory (current app se, sab cover hona chahiye)

### 4.1 Auth & Session
- [ ] Email/password login form → `POST /api/auth/login/`
- [ ] Auto-login on startup agar saved credentials hain (DPAPI-encrypted `credentials.dat`)
- [ ] Auto-login retry with exponential backoff (`3,5,10,20,30,60s`) jab tak server unreachable ho
- [ ] Access-token 401 par automatic `POST /api/auth/refresh/` + original request ek-baar retry
- [ ] Logout → tokens clear + saved credentials delete
- [ ] "Logged in as X (email)" status label

### 4.2 Print Queue (regular orders)
- [ ] Poll `GET /api/agent/jobs/` har N seconds (configurable, min 5s enforced, default 10s)
- [ ] Pending-jobs grid dikhana (id, file, pages, copies, paper, color, amount, mode, date, status)
- [ ] Naya job detect karke: document download → printer-preset match (paper+color) → print → status update (`printing` → `printed`/`failed`)
- [ ] Cash-Counter order → confirmation dialog (collect cash?) → approve/reject API call
- [ ] Manual "Browse + Print" flow (agent operator khud ek file print kar sake, queue ke bahar)
- [ ] Copies-loop handling (ek order = N copies print)

### 4.3 Passport AI Photo Queue
- [ ] Poll `GET /api/agent/passport-jobs/` (same timer tick)
- [ ] Job claim (`POST .../claim/`) — race-safe (server-side row lock handle karta hai, client sirf 409/already-claimed graceful skip kare)
- [ ] Original photo download
- [ ] Gemini automation trigger (Playwright) — prompt + image se AI passport photo generate
- [ ] Success → `POST .../complete/` (multipart `final_image`)
- [ ] Failure → `POST .../complete/` (multipart `status=failed` + `message`)
- [ ] Same flow QR-order-triggered passport photos ke liye bhi (agent/jobs se `attireCategory` based prompt)

### 4.4 Gemini AI Automation
- [ ] Playwright browser context launch (persistent profile taaki Google login session save rahe)
- [ ] Image clipboard/upload + prompt inject + send
- [ ] Result-image detect (robust wait — Playwright's `expect`/`wait_for_selector`, not blind `imgs.length===7` count-based hack)
- [ ] Timeout handling (max wait, jaisa purana 5-min cap)
- [ ] New-chat reset after each job (context bleed avoid)
- [ ] Concurrency lock — ek time pe ek hi Gemini generation (single browser context/tab)

### 4.5 Printer Setup & QR Print
- [ ] Installed-printers list (`win32print.EnumPrinters`)
- [ ] Printer presets grid (printer + paper-size + color-mode combos), file-backed (`printer_settings.txt` ya JSON)
- [ ] Add/delete preset rows
- [ ] QR test-print page (branding + QR code + shop info)
- [ ] QR poster print (customer-facing, no printer-line)
- [ ] Grayscale conversion for B&W mode

### 4.6 Local Bridge Server (127.0.0.1:8765)
- [ ] `GET /status` — app/printer/account snapshot
- [ ] `POST /settings` — printer select from browser
- [ ] `POST /test-print`, `POST /poster-print`
- [ ] `GET /printer-presets`, `POST /printer-presets`, `POST /printer-presets/delete`
- [ ] CORS headers (`Access-Control-Allow-Origin: *`) kyunki caller localhost browser hai
- [ ] OPTIONS preflight handling

### 4.7 Auto-Update
- [ ] Startup version-check (remote source se, decide karna hai §6 me — GitHub ya cafemitra_server)
- [ ] Update available → separate updater process launch, main app close
- [ ] Updater: parent-process wait/kill → download → extract → copy-over (locked-file retry) → relaunch
- [ ] Update-fail → purana app phir bhi relaunch ho (shop kabhi bina-working-app ke na rahe)

### 4.8 UI / UX
- [ ] Navigation: Account, Print, History, Settings, Gemini tabs
- [ ] Status/log console (timestamped lines)
- [ ] Theme/branding consistent with website

---

## 5. 🔧 Improvements over the current C# app (mauka hai fix karne ka)

In sabko `PRINT_AGENT_API.md` §8 me already flag kiya tha — rewrite karte waqt inko design me hi solve karo, baad me patch mat karo:

1. **Server-persisted job dedup**: sirf in-memory `_printedIds` set ke bharose mat raho — ya to server se "agent has seen this job" signal lo, ya kam-se-kam local disk pe processed-job-ids persist karo taaki restart pe duplicate print na ho.
2. **Printer-mismatch jobs ke liye server ko signal bhejo**: abhi silently stuck ho jaate hain. Agent-side ek distinct log/UI-alert + (agar server API support kare) ek "waiting_for_printer" status update consider karo.
3. **Gemini automation Playwright se** — DOM-selector fragility kam karo, aur fail hone par distinct error categories (selector-not-found vs timeout vs network) log karo, generic "timed out" nahi.
4. **`FailPassportJob` ke liye retry-with-backoff** (kam se kam 2-3 attempts) — abhi single best-effort try hai; agar wahi fail ho jaaye to job forever `claimed` state me atka reh sakta hai.
5. **Auto-update mechanism ek hi jagah se** — decide karo GitHub raw-files ya `cafemitra_server`'s `/api/agent/version-check/`+`/update/` (abhi dono maujood hain but dusra istemal nahi hota, confusing hai). §6 me decide karo.
6. **Token storage encrypt karo** — abhi C# me `AccessToken`/`RefreshToken` plain-text `config.json` me hain jabki password DPAPI-encrypted hai. Python rewrite me tokens bhi `win32crypt` se encrypt karo (same protection level jo password ko milta hai).
7. **Local bridge ko halka sa auth do** — poori tarah open mat rakho; ek simple shared-secret (agent-generated, website ko config me dikhaya jaaye) add karne se accidental cross-app access rukega, without breaking the localhost-only trust model.
8. **`ColorMode` field**: agar server-side kabhi add ho (dekho `PRINT_AGENT_API.md` §3), to client isse turant respect kare — abhi ke text-guessing fallback ko bhi rakho as backward-compat.

---

## 6. Open Decisions (build shuru karne se pehle answer karna hai)

- [ ] **Auto-update source**: GitHub raw files continue karein, ya `cafemitra_server`'s existing `/api/agent/version-check/`+`/update/` endpoints use karein? (Dusra option better hai agar aap already un endpoints/media files ko maintain kar rahe ho.)
- [ ] **Gemini automation approach**: Playwright (separate browser binary download hota hai, ~300MB Chromium) vs `pywebview` (system WebView2 embed, current approach ke closer, chhota) — trade-off: Playwright zyada robust/testable, pywebview chhota installer.
- [ ] **Local bridge security**: shared-secret add karna hai ya as-is (open localhost) rakhna hai?
- [ ] **Distribution cadence**: har feature ke baad release, ya batched releases?
- [ ] **Backward compat window**: jab tak Python version stable na ho jaaye, kya C# agent parallel maintain hoga (dono shops ke paas ho sakte hain)?

---

## 7. Phased Development Plan

### Phase 0 — Project Setup
- Repo scaffold, `pyproject.toml`/`requirements.txt`, PySide6 hello-world window, config module, logging setup.
- **Exit criteria**: empty app launches, config.json read/write works.

### Phase 1 — Auth
- Login form, `api_client.py` (login + refresh + auto-retry-on-401 wrapper), credential store (DPAPI), auto-login loop with backoff.
- **Exit criteria**: manual login works end-to-end against local `cafemitra_server`; app restart auto-logs-in from saved credentials.

### Phase 2 — Print Queue Core
- Job polling timer, jobs grid, document download, printer matching, actual print (pywin32), status updates (`printing`/`printed`/`failed`).
- **Exit criteria**: ek real order end-to-end print ho jaaye (server se lekar physical/PDF-printer tak), status server pe correctly reflect ho.

### Phase 3 — Cash Counter Flow
- Confirmation dialog, approve/reject API calls, order-flow gating (print sirf approve ke baad).
- **Exit criteria**: cash-counter order reject karne par print na ho, approve karne par ho.

### Phase 4 — Passport AI Queue + Gemini
- Claim/complete/fail flow, Playwright automation module, concurrency lock, timeout handling.
- **Exit criteria**: dono paths (dashboard "Passport Photo Maker" tool ka job, aur QR-order ka passport_photo job) end-to-end kaam karein.

### Phase 5 — QR Print, Printer Presets
- Presets grid + persistence, QR test-page/poster print rendering, grayscale conversion.
- **Exit criteria**: website ke "PrintPilot Setup" wizard se poori tarah drive ho sake (agle phase ke bridge ke through).

### Phase 6 — Local Bridge Server
- Stdlib/FastAPI HTTP server, sab routes (`/status`, `/settings`, `/test-print`, `/poster-print`, `/printer-presets*`), CORS.
- **Exit criteria**: `cafemitra_client`'s PrintPilot Setup page bina code-change ke is naye Python agent ke against kaam kare (protocol-compatible hona chahiye).

### Phase 7 — Auto-Update + Installer
- §6 ke decisions ke hisaab se version-check + updater app, Inno Setup script, PyInstaller build pipeline.
- **Exit criteria**: purana build → naya build auto-update ek real machine pe test ho.

### Phase 8 — Hardening & Edge-Case Testing
- Section 5 ke saare "🔧 Improve" items implement/verify, offline-mode testing, printer-not-found testing, malformed-server-response testing.
- Checklist banao (jaisa `WALLET_TESTING.md` pattern) is app ke liye bhi — condition → expected result format me.
- **Exit criteria**: checklist ke saare items pass.

### Phase 9 — Distribution
- GitHub Release banao (installer `.exe` attach), download-link website pe update karo (`/api/agent/installer/` serve-path bhi update karna padega agar server-hosted rakhna hai, ya seedha GitHub-Release-link pe redirect karo).
- **Exit criteria**: fresh Windows machine pe link se download → install → login → job process, end-to-end bina kisi manual dev-intervention ke.

---

## 8. Cross-reference

- Current C# app ka poora API-usage inventory (jisse yeh roadmap derive hui): [`PRINT_AGENT_API.md`](PRINT_AGENT_API.md)
- Server-side API contract (jisse yeh naya agent bhi baat karega): [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
- Postman collection (manual testing ke liye): [`cafemitra_server/postman_collection.json`](cafemitra_server/postman_collection.json)
