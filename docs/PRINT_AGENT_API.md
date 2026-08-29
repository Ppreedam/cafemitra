# Print Agent — API Reference

Yeh file **"Print Agent"** (desktop Windows app — `Print Agent/Print Agent/*.cs`, .NET 10/WinForms) ke saare API interactions cover karti hai: kaunsi CafeMitra server APIs yeh **consume** karta hai (client ban kar), aur kaunsi APIs yeh khud **serve** karta hai (local bridge, jo website ka browser JS hit karta hai). Har ek ke liye: kahan call hoti hai (file + line), request payload, response shape, aur edge cases.

Yeh doc `API_DOCUMENTATION.md` (server-side, `cafemitra_server`) ka companion hai — wahan har server endpoint ka full contract hai, yahan sirf **is specific client (Print Agent) ka usage pattern** hai.

> **⚠️ 2026-08-16 rewrite note**: is file ka pehla version ek **alag, purani implementation** describe karta tha jisme ek Passport AI Photo queue thi (`agent/passport-jobs/`, `claim/`, `complete/`) jo `gemini.google.com` par WebView2-automation se photo generate karti thi. **Yeh feature is actual codebase me kahin nahi hai** — poore `Print Agent/` folder me `grep -i "passport\|gemini"` **zero matches** deta hai. Yeh poora doc ab us purane content ki jagah **actual, verified current code** (dusre developer ka fresh rewrite, abhi tak git me commit nahi hua — `git status` me `?? "Print Agent/"`) describe karta hai. `LocalStatusServer.cs` ka apna comment isko confirm karta hai: *"Same local HTTP bridge protocol as PrintPilotSolution's agent"* — matlab yeh kisi pehle wale "PrintPilotSolution" agent (jo shayad passport/Gemini wala tha) ka drop-in-compatible, simpler replacement hai, feature-parity nahi.

Two separate .exe projects, ek `Print Agent.slnx` solution me:
- **`Print Agent/Print Agent`** → `PrintAgent.exe` — main app: login, job polling, printing, local bridge server, tray icon, auto-startup.
- **`Print Agent/PrintAgentUpdater`** → `Updater.exe` — sirf self-update ke liye, `PrintAgent.exe` isse launch karta hai jab naya version mile.

---

## 1. Kaise kaam karta hai — quick map

```
┌──────────────────────┐         Bearer token          ┌──────────────────────┐
│  PrintAgent.exe       │ ─────────────────────────────▶│  cafemitra_server     │
│  (CafeMitraApi.cs)    │ ◀───────────────────────────── │  /api/...             │
└──────────┬────────────┘        JSON                    └──────────────────────┘
           │  serves on 127.0.0.1:8765
           ▼
┌──────────────────────┐
│  Website browser JS   │  (PrintPilot Setup page, GET/POST /status,
│  (cafemitra_client)   │   /settings, /test-print, /printer-presets, ...)
└──────────────────────┘

┌──────────────────────┐   GitHub raw files    ┌──────────────────────────────┐
│  PrintAgent.exe       │ ────────────────────▶│ raw.githubusercontent.com/... │
│  (VersionChecker.cs,  │ ◀──────────────────── │ letest_version, update.zip,   │
│   ApiBaseUrlProvider) │                        │ print_agent_baseurl           │
└──────────────────────┘   (NOT cafemitra_server — see §5)
```

- **Auth**: `CafeMitraApi.cs` sabhi authenticated calls me `Authorization: Bearer {AccessToken}` header attach karta hai (`AddAuth()`, `CafeMitraApi.cs:179-186`). Har request `User-Agent: CafeMitra-PrintAgent/1.0` bhi bhejta hai.
- **Auto-refresh**: koi bhi authenticated call `401` de to `CafeMitraApi` khud-ba-khud ek baar `POST /api/auth/refresh/` try karta hai aur original request **ek hi baar** retry karta hai (`allowRefresh` flag se infinite-loop nahi banta) — `CafeMitraApi.cs:117-120` (JSON calls), `DownloadFile` me bhi same pattern (`:74-84`).
- **Token storage**: `AccessToken`/`RefreshToken` `%APPDATA%\CafeMitra\PrintAgent\config.json` me plain JSON me save hote hain (koi encryption nahi — sirf email/password, `credentials.dat`, DPAPI-encrypted hota hai, token nahi). `AgentConfig.cs`.
- **API base URL bhi ab remotely-configurable hai** (naya, purane doc me nahi tha): `ApiBaseUrlProvider.RefreshBaseUrl()` — Form-load ke sabse pehle step me `https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/print_agent_baseurl` se GitHub raw-file fetch karke `config.json`'s `ApiBaseUrl` (default `https://api.repetigo.com/`) ko silently update kar deta hai agar change ho. Network fail ho to chup-chaap current value hi use hoti rehti hai — `ApiBaseUrlProvider.cs`.
- **Polling**: ek hi `System.Windows.Forms.Timer` (`_pollTimer`, interval = `max(config.PollIntervalSeconds, 5)` seconds, **default 10s**) har tick pe `PollAndPrintAsync()` chalata hai — `Form1.cs:922-928`. Form-load pe ek immediate fetch bhi hoti hai. **Sirf ek hi queue hai** — koi separate passport/AI-photo poll nahi.
- **Single-instance**: `Program.cs` named `Mutex` se dusri baar launch hone par purani window ko tray se restore kar deta hai, naya process khud band ho jaata hai.

---

## 2. Auth APIs (CafeMitra server)

### `POST /api/auth/login/`
**Kahan**: `CafeMitraApi.Login()` — `CafeMitraApi.cs:10-41`. Do jagah se trigger hoti hai:
1. **Manual**: `btnLogin_Click` — user email/password type karke Login button dabaye — `Form1.cs:373-419`. Success par credentials `CredentialStore.Save()` se DPAPI-encrypted `credentials.dat` me save hoti hain (agle launch pe auto-login ke liye).
2. **Auto-login loop**: app start hone par agar `AccessToken` khaali hai to `CredentialStore.Load()` se saved email/password uthaakar background me retry-loop chalti hai — `Form1.cs:309-371` (`BootstrapLoginAsync` → `AutoLoginLoop`).

**Request**: `{email, password}` (auth: false — koi Bearer header nahi jaata is call me).
**Response consumed**: `Token`, `RefreshToken`, `User.FullName`, `User.Email` — save ho jaate hain `config.json` me.

**Edge cases (client-side handling):**
- `response.Token` khaali/null aaye → `AuthenticationFailedException("Login response token missing.")` throw hota hai.
- Server `401`/`400` de (galat email/password) → `AuthenticationFailedException` with server ka raw message; auto-login loop **turant ruk jaati hai** (user ko manual login karna padega).
- Network error / timeout → `HttpRequestException` wrap hoti hai; auto-login loop **exponential backoff** se retry karti hai: `3, 5, 10, 20, 30, 60` seconds (aakhri delay pe hi ruk jaati hai, capped) — `Form1.cs:333`. Yeh loop **infinite** chalti hai jab tak login successful na ho ya app band na ho.
- Manual login me network/generic error par user ko ek friendly `MessageBox` dikhta hai ("Could not reach the server..."), auto-login me sirf log line (koi popup nahi).

### `POST /api/auth/refresh/`
**Kahan**: `CafeMitraApi.RefreshToken()` (private) — `CafeMitraApi.cs:137-177`. **Kabhi seedha kisi UI action se trigger nahi hoti** — sirf internally jab koi authenticated call `401` deti hai.
**Request**: `{refreshToken: config.RefreshToken}` (auth: false).
**Edge cases:**
- `config.RefreshToken` khaali hai → seedha `false` return, refresh try hi nahi hota.
- Server error/network fail → `catch` me silently `false` (best-effort, exception throw nahi karta).
- Success → naya `AccessToken` (aur agar mila to naya `RefreshToken`, warna purana wahi rehta hai) `config.json` me save. Original failed request khud dobara try hoti hai (ek retry, `allowRefresh:false` ke saath).

---

## 3. Print Queue API (`PollAndPrintAsync` — ek hi queue, koi passport/AI-photo alag queue nahi)

### `GET /api/agent/jobs/`
**Kahan**: `CafeMitraApi.FetchJobs()` → `PollAndPrintAsync()` — `Form1.cs:937-974`. Har timer-tick pe (default 10s) aur form-load pe ek baar turant.
**Response**: `{jobs: [PrintJob...]}` — grid (`dataGridPendingPrintData`) refresh hoti hai, phir har naye job (`job.Id` `_printedIds` HashSet me nahi hai to) ke liye ek independent `ProcessJobAsync()` fire-and-forget spawn hoti hai.
**Edge cases:**
- `AccessToken` khaali → poll hi nahi chalti (silent return, login required).
- Koi bhi exception (network/parse) → log-only, agli tick pe phir try hoga.
- `job.Id <= 0` ya `job.DownloadUrl` khaali → wo job **skip** ho jaata hai.
- **Dedup**: `_printedIds` in-memory HashSet hai (app restart hone par reset ho jaata hai) — agent restart hote hi saare abhi-tak-printed-na-hue jobs dobara process honge; server-side koi "already sent to agent" flag nahi hai, sirf client-memory dedup hai.

### `PrintJob.ColorMode` — model me field hai, lekin server abhi bhi kabhi nahi bhejta ⚠️
`Models.cs`'s `PrintJob.ColorMode` (nullable `string?`) ek "explicit color instruction from the server" ke liye ready hai — lekin `cafemitra_server`'s `public_order()` (jo `/api/agent/jobs/` backend karta hai) yeh field abhi bhi kabhi return nahi karta. Isliye `PrintColorMode` getter hamesha fallback path use karta hai — `priceItemId`/`priceLabel`/`serviceName` text me "color"/"colour" dhoondhta hai, na mile to Black & White maan leta hai — `Models.cs:39-60`. Server-side `colorMode` field bhejna shuru karne se yeh guesswork khatam ho jaayega (client already ready hai isko consume karne ke liye).

### Cash-Counter confirmation → `POST /api/orders/{orderId}/approve-cash/` ya `/reject-cash/`
**Kahan**: `ProcessJobAsync()` — `Form1.cs:1005-1018`. Agar `job.IsCashApprovalPending` (paymentStatus=cash_counter AND status=awaiting_approval) to ek **custom modal dialog** (`CashConfirmForm.ShowConfirm()`, `Form1.cs:1419-1583`) aata hai — teal-branded, rounded-corner, borderless, draggable, "₹{amount}" bade font me, Confirm/Reject buttons. **Purane `MessageBox.Show` se replace ho chuka hai** (purana blocking-messagebox wala code commented-out chhod diya gaya hai `Form1.cs:1106-1117` me, dead code).
- User **Confirm** kare → `POST /api/orders/{orderId}/approve-cash/` (no body).
- User **Reject** kare → `POST /api/orders/{orderId}/reject-cash/` (no body), aur job yahin **ruk jaata hai** — download/print nahi hota.

**Edge case ⚠️**: `CashConfirmForm` bhi modal (`ShowDialog()`) hai, isliye UI thread ko block karti hai — same issue jo blocking `MessageBox` ka tha: do cash-counter orders same poll cycle me aayein to popups back-to-back milte hain (ek dialog band hone tak dusra nahi khulta).

### `GET <job.DownloadUrl>` (document download)
**Kahan**: `CafeMitraApi.DownloadFile()` — `CafeMitraApi.cs:69-90`, called from `Form1.cs:1024`. `job.DownloadUrl` server ne already-absolute URL diya hota hai, Bearer auth ke saath fetch hota hai, `%APPDATA%\CafeMitra\PrintAgent\jobs\{id}-{filename}` pe save hota hai.
**Edge cases**: `response.EnsureSuccessStatusCode()` — non-2xx par exception throw hoti hai jo `ProcessJobAsync`'s catch me pakdi jaati hai. Filename `SafeFileName()` se sanitize hota hai (invalid path chars `_` se replace).

### `POST /api/agent/jobs/{orderId}/status/`
**Kahan**: `CafeMitraApi.UpdateStatus(orderId, status, message)` — `CafeMitraApi.cs:49-57`. Teen jagah call hoti hai (`Form1.cs:1036, 1086, 1093`):
1. `status="printing"` — printer match ho jaane ke turant baad, actual print se **pehle**.
2. `status="printed"` — sab copies print ho jaane ke baad.
3. `status="failed"` — `ProcessJobAsync` ke `catch` block me, exception ka `.Message` bhej ke — best-effort (`try/catch` me lipti hai, is call ka fail hona further exception throw nahi karta).

**Edge cases:**
- Koi matching printer nahi mila (`FindMatchingPrinter` null) → koi status-update call hoti hi nahi, job `_printedIds` se **hata diya jaata hai** taaki agli poll pe phir try ho — `Form1.cs:1027-1033`. Server ko kabhi pata nahi chalta ki job kyun atka hai, jab tak operator khud Printer Setting me matching preset add na kare.
- **⚠️ Paper-size hamesha `"A4"` hardcoded maana jaata hai** (`DefaultPaperSize` constant, `Form1.cs:30`) — printer-matching aur grid dono isi ko use karte hain, job ka apna paper-size (agar server kabhi bheje bhi) consume hi nahi hota. Agar shop A5/Letter jobs bhi lete hain, in dono ke liye Printer Setting me A4-labelled printer preset hi match karega.
- Printing ke dauraan koi exception (printer offline, driver error, etc.) → job `_printedIds` se hata diya jaata hai (retry next poll) **aur** `status="failed"` bhejne ki koshish hoti hai — best-effort catch, network-fail ho to yeh bhi silently fail ho sakti hai.
- `copies > 1` ho aur beech ke kisi copy pe error aaye to loop turant `return` kar deta hai — bacha hua copies print nahi hote, aur `"printed"` status bhi nahi jaata.

---

## 4. Local Bridge API — Print Agent khud serve karta hai (`127.0.0.1:8765`)

Yeh **cafemitra_server ki API nahi hai** — ulta direction hai: Print Agent apne andar ek chhota raw-TCP HTTP server chalata hai (`LocalStatusServer.cs`) jise website ka **browser JS** (PrintPilot Setup wizard page, `cafemitra_client`) hit karta hai. Yeh CORS-open hai (`Access-Control-Allow-Origin: *`) kyunki caller hamesha same-machine browser hota hai.

**Implementation note**: raw `TcpListener` (port 8765, loopback-only), manual request-line/header parsing — sirf `Content-Length` header parse karta hai. Koi auth nahi hai (localhost-only trust model).

| Method | Path | Handler (Form1.cs) | Request body | Response |
|---|---|---|---|---|
| `GET` | `/status` | `GetStatusSnapshot()` | — | `AgentStatusSnapshot`: App, Status (running\|stopped), Account, Printer, Printers[], ApiBaseUrl, LastCheckAt, Online |
| `POST` | `/settings` | `SavePrinterFromLocalApi()` | `{printer}` | Updated `AgentStatusSnapshot` |
| `POST` | `/test-print` | `RunQrPrintFromLocalApi(isPoster:false)` | `LocalTestPrintRequest` (printer, shopName, shopCode, qrUrl, qrImage, colorMode) | `LocalTestPrintResult` (message, printer, printedAt, printers[]) |
| `POST` | `/poster-print` | `RunQrPrintFromLocalApi(isPoster:true)` | Same as test-print | Same shape |
| `POST` | `/print-file` | ❌ **NOT IMPLEMENTED** — falls through to `any other → 404` | — | — |
| `GET` | `/printer-presets` | `ListPresetsFromLocalApi()` | — | `PrinterPresetsResponse`: presets[], printers[], paperSizes[], colorModes[] |
| `POST` | `/printer-presets` | `SavePresetFromLocalApi()` | `SavePrinterPresetRequest` (printer, paperSize, colorMode, original?) | `PrinterPresetsResponse` |
| `POST` | `/printer-presets/delete` | `DeletePresetFromLocalApi()` | `PrinterPresetDto` (printer, paperSize, colorMode) | `PrinterPresetsResponse` |
| `OPTIONS` | (koi bhi path) | — | — | `204` (CORS preflight) |
| any other | — | — | — | `404 {"message":"Not found"}` |

**⚠️ `/print-file` missing (confirmed again is rewrite me bhi)**: `cafemitra_client/lib/printpilot-agent.ts`'s `runAgentPrintFile()` (`POST http://127.0.0.1:8765/print-file`, body `{printer, fileName, pdfBase64, paperSize?, colorMode?}`) Resume Builder/Biodata Maker ke "Print via PrintPilot" button se already call ho raha hai — is naye rewrite me bhi `LocalStatusServer.cs` me is path ka koi handler nahi hai. Feature broken hai.

**Edge cases:**
- `/settings`: `printer` khaali ho to koi change nahi hota, chup-chaap current snapshot return ho jaata hai.
- `/test-print`, `/poster-print`: printer resolve na ho (na request me, na currently-selected combobox me) → `InvalidOperationException("Select printer first.")` → server 500 bhejta hai `{"message": "..."}` ke saath (koi structured 400 nahi).
- `/printer-presets` (save): `printer`/`paperSize`/`colorMode` me se koi khaali → `InvalidOperationException` → `500`.
- Koi bhi handler exception throw kare → generic `500 {"message": error.Message}` (raw .NET exception message directly browser tak jaata hai).
- Port `8765` already kisi aur process ne le rakha ho → `Start()` exception silently log ho jaati hai, bridge disabled reh jaata hai lekin poora app crash nahi hota — `LocalStatusServer.cs:25-38`.
- `colorMode` string free-form parse hoti hai (`ParseColorMode`, `Form1.cs:1354-1366`) — `"color"`/`"colour"`/`"c"` (case-insensitive) → Color, baaki sab → Black & White default.

---

## 5. Auto-update & remote config — GitHub, **NOT** `cafemitra_server` ⚠️

`cafemitra_server` API me `GET /api/agent/version-check/` aur `GET /api/agent/update/` endpoints maujood hain (dekho `API_DOCUMENTATION.md` §13) — lekin **Print Agent inhe kabhi call nahi karta**. Teen alag cheezein GitHub raw files se aati hain:

### `GET .../print_agent_baseurl` — API base URL
**Kahan**: `ApiBaseUrlProvider.RefreshBaseUrl()` — Form-load ke sabse pehle step me, 8s timeout. `§1` me detail hai.

### `GET .../letest_version` — version check
**Kahan**: `VersionChecker.CheckAndLaunchUpdaterIfNeeded()` — `VersionChecker.cs:17-45`. Base-URL refresh ke turant baad. Response text ko current build-version label se compare karta hai (case-insensitive).
**Edge cases**: khaali response, network error, ya koi bhi exception → **hamesha** "no update available" treat hota hai (shop ka internet down ho to bhi app chalna chahiye).

### `GET .../update.zip` — actual update package
**Kahan**: `UpdaterForm.RunUpdate()` in `Updater.exe` — `UpdaterForm.cs:85-118`. `PrintAgent.exe` sirf `Updater.exe --pid <self> --dir <installDir> --exe <exePath>` launch karke turant close ho jaata hai — `VersionChecker.cs:47-82`. Updater:
1. **Sabhi** running `PrintAgent.exe` instances close karta hai (sirf jo PID diya gaya wahi nahi — naam se find karke, `MainModule.FileName` match karke same-install ke sabko) — pehle graceful `CloseMainWindow()` + 8s wait, phir `Kill(entireProcessTree: true)` + 10s wait — `UpdaterForm.cs:126-193`.
2. Zip download (progress bar ke saath) → extract temp dir me → install-dir pe file-by-file copy, **locked file par 6 attempts retry** (500ms × attempt delay).
3. `PrintAgent.exe` relaunch karta hai.

**Edge cases**: `Updater.exe` file hi missing ho install-dir me → update skip. Download/extract/copy me koi bhi failure → error dikhta hai UI me lekin **purana app phir bhi relaunch ho jaata hai** (comment: "Don't leave the shop stuck without a working app").

> **⚠️ Follow-up worth raising**: `cafemitra_server`'s `/api/agent/version-check/` aur `/api/agent/update/` is-waqt **dead/unused** hain — real update-distribution GitHub se ho raha hai (version, base-URL, aur update-package teeno).

---

## 6. App lifecycle — non-API behaviors worth knowing

Yeh REST calls nahi hain, lekin app ka core behavior samajhne ke liye zaroori hain:

- **Single-instance** (`Program.cs`): named `Mutex` — dusri baar launch hone par ek `EventWaitHandle` signal bhejta hai jo pehli instance ko tray se restore kar deta hai, naya process turant exit.
- **Tray icon** (`Form1.cs` — `InitTrayIcon`, `MinimizeToTray`, `RestoreFromTray`): window minimize/close (X button) karne par app band nahi hoti, tray me chali jaati hai (`OnFormClosing` — `_isExiting` flag guard). Sirf tray-menu "Exit" ya update-relaunch se `_isExiting=true` set hoke actually close hoti hai.
- **Auto-startup + shortcuts** (`ShortcutInstaller.cs`, `StartupRegistrar.cs`): first launch pe — Desktop shortcut, Start-Menu shortcut, best-effort taskbar-pin (COM `WScript.Shell`/`Shell.Application` via reflection), HKCU `Run` registry key + `shell:startup` folder shortcut — sab ek marker-file (`autostart_installed.flag`) se gated (ek baar hi chalta hai, user delete kare to dubara force nahi hota — sirf shortcuts har launch pe recheck hote hain, registry entry sirf pehli baar).
- **Manual print** (`btnPrint_Click`, `PrintPdf`/`PrintImage`): operator khud file browse karke kisi bhi printer pe manually bhi print kar sakta hai — koi server-call involved nahi, poora local (PDF rendering `PDFtoImage` + `SkiaSharp` se).

---

## 7. Summary table — CafeMitra server APIs jo Print Agent consume karta hai

| Endpoint | Method | Kab | File |
|---|---|---|---|
| `/api/auth/login/` | POST | Manual login button + auto-login startup loop | CafeMitraApi.cs:10 |
| `/api/auth/refresh/` | POST | Internal, kisi bhi 401 par automatically | CafeMitraApi.cs:137 |
| `/api/agent/jobs/` | GET | Har poll tick (default 10s) | CafeMitraApi.cs:43 |
| `/api/agent/jobs/{id}/status/` | POST | printing / printed / failed transitions | CafeMitraApi.cs:49 |
| `/api/orders/{id}/approve-cash/` | POST | Cash-counter dialog → Confirm | CafeMitraApi.cs:59 |
| `/api/orders/{id}/reject-cash/` | POST | Cash-counter dialog → Reject | CafeMitraApi.cs:64 |
| `<job.DownloadUrl>` (media file) | GET | Print document download | CafeMitraApi.cs:69 |
| `/api/agent/version-check/`, `/api/agent/update/` | — | **Kabhi call nahi hote** (GitHub use hota hai, §5) | — |
| `POST /print-file` (local bridge, agent khud serve karta hai) | POST | ❌ Frontend already call kar raha hai, agent me implement nahi hai — §4 | — |

**Note**: `agent/passport-jobs/`, `.../claim/`, `.../complete/`, `.../original-image/` — yeh sab server-side (`API_DOCUMENTATION.md`, `API_UPDATES.md`) exist karte hain, lekin **is Print Agent se kabhi call nahi hote**, kyunki iska koi passport-photo feature hi nahi hai.

---

## 8. Known Gaps / Follow-ups

1. **`PrintJob.ColorMode` server se kabhi nahi aata** — client-side field ready hai, server abhi bhi nahi bhejta, agent text-guessing fallback use karta hai. (§3)
2. **Paper-size hardcoded `"A4"`** — job ka apna paper-size kabhi consume nahi hota, printer-matching hamesha A4-preset dhoondta hai. (§3)
3. **Client-side dedup sirf in-memory hai** (`_printedIds`) — app restart hone par reset, jisse ek job dobara print ho sakta hai agar pehli baar status-update fail hua ho. (§3)
4. **Printer-mismatch jobs silently stuck rehte hain** — koi status update server ko nahi jaata jab tak operator khud matching printer preset add na kare. (§3)
5. **Cash-confirm dialog abhi bhi UI-blocking/modal hai** (`CashConfirmForm.ShowDialog()`) — `MessageBox` se replace hua hai but blocking-behavior same hai; back-to-back cash orders me popups serialize hote hain. (§3)
6. **`/print-file` local-bridge endpoint missing** — `cafemitra_client` (Resume Builder, Biodata Maker) already isko call kar raha hai, agent me handler nahi hai (404). Feature broken hai. (§4)
7. **Auto-update/config do-tarah GitHub-dependent hai** (version, base-URL, update-package) — server ke `/api/agent/version-check/`+`/update/` endpoints dead hain. (§5)
8. **Local bridge (`127.0.0.1:8765`) me koi auth nahi**, saare errors generic `500` ban jaate hain, port-conflict silently bridge disable kar deta hai. (§4)
9. **Config token store unencrypted** (`config.json` me `AccessToken`/`RefreshToken` plain text) jabki password `credentials.dat` DPAPI-encrypted hai.
10. **Passport AI Photo feature poori tarah missing hai is rewrite me** — agar yeh intentional simplification hai (feature deprecate ho raha hai) to theek, lekin agar nahi, to yeh sabse bada functional gap hai purane implementation ke comparison me. Confirm karna zaroori hai ki yeh jaanbujh kar hua hai.
11. **Fab-Icon.png aur logo.png** (solution root pe) currently kahin bhi reference nahi hote — unused loose assets.
12. **Yeh poora `Print Agent/` folder git me untracked hai** — koi commit history nahi, `.gitignore` se abhi-abhi hataya gaya hai (uncommitted). Jab tak commit nahi hota, is doc ka baseline bhi "point in time" hi hai.

---

## 9. Cross-reference

- Server-side full contract (request/response/edge cases) har endpoint ka: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
- Postman collection (sabhi server endpoints): [`cafemitra_server/postman_collection.json`](cafemitra_server/postman_collection.json).
- Admin/platform controls jo in jobs/orders ko affect karte hain: [`ADMIN_FEATURES.md`](ADMIN_FEATURES.md).
- Server-side 2026-08 delta (double-settlement fix, passport-photo shared-queue, Gemini fallback, referral program, admin API, resume/biodata tools): [`API_UPDATES.md`](API_UPDATES.md) — **note**: us doc ka §1 (passport-photo pipeline) aur uske passport-specific gaps is Print Agent pe apply **nahi** hote, kyunki yeh feature hi is rewrite me nahi hai. Baaki sections (admin API, resume/biodata tools, double-settlement fix, wallet changes) platform-wide hain, unse koi lena-dena nahi is specific client se.
