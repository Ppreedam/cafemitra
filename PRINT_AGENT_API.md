# Print Agent — API Reference

Yeh file **"Print Agent"** (desktop Windows app — `Print Agent/Print Agent/*.cs`, .NET/WinForms) ke saare API interactions cover karti hai: kaunsi CafeMitra server APIs yeh **consume** karta hai (client ban kar), aur kaunsi APIs yeh khud **serve** karta hai (local bridge, jo website ka browser JS hit karta hai). Har ek ke liye: kahan call hoti hai (file + line), request payload, response shape, aur edge cases.

Yeh doc `API_DOCUMENTATION.md` (server-side, `cafemitra_server`) ka companion hai — wahan har server endpoint ka full contract hai, yahan sirf **is specific client (Print Agent) ka usage pattern** hai (kaunsa endpoint kab/kyun/kaise call hota hai, retry/timeout/error-handling samet).

Two separate .exe projects is repo me:
- **`Print Agent/Print Agent`** → `PrintAgent.exe` — main app: login, job polling, printing, Gemini AI photo generation, local bridge server.
- **`Print Agent/PrintAgentUpdater`** → `Updater.exe` — sirf self-update ke liye, `PrintAgent.exe` isse launch karta hai jab naya version mile.

---

## 1. Kaise kaam karta hai — quick map

```
┌──────────────────────┐         Bearer token          ┌──────────────────────┐
│  PrintAgent.exe       │ ─────────────────────────────▶│  cafemitra_server     │
│  (CafeMitraApi.cs)    │ ◀───────────────────────────── │  /api/...             │
└──────────┬────────────┘        JSON / multipart        └──────────────────────┘
           │  serves on 127.0.0.1:8765
           ▼
┌──────────────────────┐
│  Website browser JS   │  (PrintPilot Setup page, GET/POST /status,
│  (cafemitra_client)   │   /settings, /test-print, /printer-presets, ...)
└──────────────────────┘

┌──────────────────────┐   GitHub raw file    ┌──────────────────────────────┐
│  PrintAgent.exe       │ ────────────────────▶│ raw.githubusercontent.com/... │
│  (VersionChecker.cs)  │ ◀──────────────────── │ letest_version, update.zip    │
└──────────────────────┘   (NOT cafemitra_server — see §5)
```

- **Auth**: `CafeMitraApi.cs` sabhi authenticated calls me `Authorization: Bearer {AccessToken}` header attach karta hai (`AddAuth()`, [CafeMitraApi.cs:238-245](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L238-L245)). Har request `User-Agent: CafeMitra-PrintAgent/1.0` bhi bhejta hai.
- **Auto-refresh**: koi bhi authenticated call `401` de to `CafeMitraApi` khud-ba-khud ek baar `POST /api/auth/refresh/` try karta hai aur original request **ek hi baar** retry karta hai (`allowRefresh` flag se infinite-loop nahi banta) — [CafeMitraApi.cs:176-178](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L176-L178) (JSON calls) aur [CafeMitraApi.cs:115-119](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L115-L119) (file uploads). `DownloadFile` me bhi same pattern hai.
- **Token storage**: `AccessToken`/`RefreshToken` `%APPDATA%\CafeMitra\PrintAgent\config.json` me plain JSON me save hote hain (koi encryption nahi — sirf email/password, `credentials.dat`, DPAPI-encrypted hota hai, token nahi). [AgentConfig.cs](Print%20Agent/Print%20Agent/AgentConfig.cs)
- **Polling**: ek hi `System.Windows.Forms.Timer` (`_pollTimer`, interval = `max(config.PollIntervalSeconds, 5)` seconds, **default 10s**) har tick pe do cheezein sequentially karta hai: `PollAndPrintAsync()` phir `PollPassportPhotoJobsAsync()` — [Form1.cs:738-745](Print%20Agent/Print%20Agent/Form1.cs#L738-L745). Form-load pe ek immediate fetch bhi hoti hai.

---

## 2. Auth APIs (CafeMitra server)

### `POST /api/auth/login/`
**Kahan**: `CafeMitraApi.Login()` — [CafeMitraApi.cs:10-41](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L10-L41). Do jagah se trigger hoti hai:
1. **Manual**: `btnLogin_Click` — user email/password type karke Login button dabaye — [Form1.cs:195-241](Print%20Agent/Print%20Agent/Form1.cs#L195-L241). Success par credentials `CredentialStore.Save()` se DPAPI-encrypted `credentials.dat` me save hoti hain (agle launch pe auto-login ke liye).
2. **Auto-login loop**: app start hone par agar `AccessToken` khaali hai to `CredentialStore.Load()` se saved email/password uthaakar background me retry-loop chalti hai — [Form1.cs:151-193](Print%20Agent/Print%20Agent/Form1.cs#L151-L193).

**Request**: `{email, password}` (auth: false — koi Bearer header nahi jaata is call me).
**Response consumed**: `token`, `refreshToken`, `user.fullName`, `user.email` — save ho jaate hain `config.json` me.

**Edge cases (client-side handling):**
- `response.Token` khaali/null aaye → `AuthenticationFailedException("Login response token missing.")` throw hota hai (server ka bug maana jaata hai, retry nahi hoti).
- Server `401`/`400` de (galat email/password) → `AuthenticationFailedException` with server ka raw message; auto-login loop **turant ruk jaati hai** (user ko manual login karna padega — retry karne ka koi fayda nahi jab tak saved password hi galat hai).
- Network error / timeout → `HttpRequestException` wrap hoti hai; auto-login loop **exponential backoff** se retry karti hai: `3, 5, 10, 20, 30, 60` seconds (aakhri delay pe hi ruk jaati hai, capped) — [Form1.cs:155, 183](Print%20Agent/Print%20Agent/Form1.cs#L155). Yeh loop **infinite** chalti hai jab tak login successful na ho ya app band na ho (shop ka internet down ho to agent chup-chaap retry karta rehta hai).
- Manual login me network/generic error par user ko ek friendly `MessageBox` dikhta hai ("Could not reach the server..."), auto-login me sirf log line (koi popup nahi — background process hai).

### `POST /api/auth/refresh/`
**Kahan**: `CafeMitraApi.RefreshToken()` (private) — [CafeMitraApi.cs:196-236](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L196-L236). **Kabhi seedha kisi UI action se trigger nahi hoti** — sirf internally jab koi authenticated call `401` deti hai.
**Request**: `{refreshToken: config.RefreshToken}` (auth: false).
**Edge cases:**
- `config.RefreshToken` khaali hai → seedha `false` return, refresh try hi nahi hota (original 401 hi caller tak bubble up hoti hai).
- Server error/network fail → `catch` me silently `false` (poora refresh attempt best-effort hai, exception throw nahi karta).
- Success → naya `AccessToken` (aur agar mila to naya `RefreshToken`, warna purana wahi rehta hai) `config.json` me save. **Is response ke baad original failed request ko caller khud dobara try karta hai** (ek retry, `allowRefresh:false` ke saath — dusri baar 401 aaya to seedha exception throw hogi, infinite retry nahi).

---

## 3. Print Queue APIs (regular print/passport orders — `PollAndPrintAsync`)

### `GET /api/agent/jobs/`
**Kahan**: `CafeMitraApi.FetchJobs()` → `PollAndPrintAsync()` — [Form1.cs:1241-1278](Print%20Agent/Print%20Agent/Form1.cs#L1241-L1278). Har timer-tick pe (default 10s) aur form-load pe ek baar turant.
**Response**: `{jobs: [PrintJob...]}` — grid (`dataGridPendingPrintData`) refresh hoti hai, phir har naye job (`job.Id` `_printedIds` HashSet me nahi hai to) ke liye ek independent `ProcessJobAsync()` fire-and-forget spawn hoti hai.
**Edge cases:**
- `AccessToken` khaali → poll hi nahi chalti (silent return, login required).
- Koi bhi exception (network/parse) → log-only, agli tick pe phir try hoga.
- `job.Id <= 0` ya `job.DownloadUrl` khaali → wo job **skip** ho jaata hai (koi log bhi nahi).
- **Dedup**: `_printedIds` in-memory HashSet hai (app restart hone par reset ho jaata hai) — matlab agent restart hote hi saare abhi-tak-printed-na-hue jobs dobara process honge; agar ek job pehli baar print ho chuka tha lekin `printed` status update fail ho gaya tha, to restart ke baad wahi job **dobara print ho sakta hai** (server-side koi "already sent to agent" flag nahi hai, sirf client-memory dedup hai).

### `PrintJob.ColorMode` — server ne kabhi nahi bheja ⚠️
`Models.cs` me `PrintJob.ColorMode` field hai jise server se "explicit color instruction" milne ki umeed hai, lekin `cafemitra_server`'s `public_order()` (jo `/api/agent/jobs/` backend karta hai) yeh field **kabhi return nahi karta**. Isliye `PrintColorMode` getter hamesha fallback path use karta hai — `priceItemId`/`priceLabel`/`serviceName` text me "color"/"colour" dhoondhta hai, na mile to Black & White maan leta hai — [Models.cs:41-62](Print%20Agent/Print%20Agent/Models.cs#L41-L62). Agar kabhi shop ka price-label "color" word use nahi karta (jaise sirf "Premium Print"), to yeh galat B&W print bhej sakta hai. Server-side `colorMode` field add karna is guesswork ko khatam kar dega.

### Cash-Counter confirmation → `POST /api/orders/{orderId}/approve-cash/` ya `/reject-cash/`
**Kahan**: `ProcessJobAsync()` — [Form1.cs:1309-1322](Print%20Agent/Print%20Agent/Form1.cs#L1309-L1322). Agar `job.IsCashApprovalPending` (paymentStatus=cash_counter AND status=awaiting_approval) to ek **blocking `MessageBox.Show`** dialog aata hai ("Customer se Rs. X cash collect karke hi print confirm karein") — [Form1.cs:1532-1546](Print%20Agent/Print%20Agent/Form1.cs#L1532-L1546).
- User **Yes** kare → `POST /api/orders/{orderId}/approve-cash/` (no body).
- User **No** kare → `POST /api/orders/{orderId}/reject-cash/` (no body), aur job yahin **ruk jaata hai** — download/print nahi hota.

**Edge case ⚠️**: yeh `MessageBox` UI thread ko block karti hai. Agar do cash-counter orders same poll cycle me aayein, dono independent `ProcessJobAsync` tasks hain lekin `MessageBox.Show` WinForms me effectively serialize ho jaata hai (ek dialog band hone tak dusra nahi khulta) — operator ko back-to-back popups milte hain, thoda confusing ho sakta hai high-volume shop me.

### `GET <job.DownloadUrl>` (document download)
**Kahan**: `CafeMitraApi.DownloadFile()` — [CafeMitraApi.cs:128-149](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L128-L149), called from [Form1.cs:1328](Print%20Agent/Print%20Agent/Form1.cs#L1328). `job.DownloadUrl` server ne already-absolute URL diya hota hai (`agent_order()` me `request.build_absolute_uri(order.document.url)`), Bearer auth ke saath fetch hota hai, `%APPDATA%\CafeMitra\PrintAgent\jobs\{id}-{filename}` pe save hota hai.
**Edge cases**: `response.EnsureSuccessStatusCode()` — non-2xx par exception throw hoti hai jo `ProcessJobAsync`'s catch me pakdi jaati hai (neeche dekho). Filename `SafeFileName()` se sanitize hota hai (invalid path chars `_` se replace).

### `POST /api/agent/jobs/{orderId}/status/`
**Kahan**: `CafeMitraApi.UpdateStatus(orderId, status, message)` — [CafeMitraApi.cs:49-57](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L49-L57). Teen jagah call hoti hai:
1. `status="printing"` — printer match ho jaane ke turant baad, actual print se **pehle** — [Form1.cs:1346](Print%20Agent/Print%20Agent/Form1.cs#L1346).
2. `status="printed"` — sab copies print ho jaane ke baad — [Form1.cs:1398](Print%20Agent/Print%20Agent/Form1.cs#L1398). **(Server-side yehi call wallet settlement trigger karti hai — dekho `API_DOCUMENTATION.md` §12 ka double-settlement note.)**
3. `status="failed"` — `ProcessJobAsync` ke `catch` block me, exception ka `.Message` bhej ke — [Form1.cs:1401-1406](Print%20Agent/Print%20Agent/Form1.cs#L1401-L1406). Yeh call khud **best-effort** hai (apne aap ek `try/catch` me lipti hai — is call ka fail hona further exception throw nahi karta).

**Edge cases:**
- Koi matching printer nahi mila (`FindMatchingPrinter` null) → koi status-update call hoti hi nahi, job `_printedIds` se **hata diya jaata hai** taaki agli poll pe phir try ho — [Form1.cs:1338-1343](Print%20Agent/Print%20Agent/Form1.cs#L1338-L1343). Matlab is case me server ko kabhi pata nahi chalta ki job kyun atka hai (koi "waiting_for_printer" status nahi jaata), jab tak operator khud Printer Setting me matching preset add na kare.
- Printing ke dauraan koi exception (printer offline, driver error, etc.) → job `_printedIds` se hata diya jaata hai (retry next poll) **aur** `status="failed"` bhejne ki koshish hoti hai — lekin agar wahi exception network-related hai (server hi unreachable hai), to yeh status-update call bhi silently fail ho jaayegi (best-effort catch).
- `copies > 1` ho aur beech ke kisi copy pe MessageBox/error aaye to loop turant `return` kar deta hai — bacha hua copies print nahi hote, aur `"printed"` status bhi nahi jaata (order technically stuck jab tak operator manually retry na kare via full poll cycle).

---

## 4. Passport AI Photo Queue APIs (`PollPassportPhotoJobsAsync`)

Yeh alag queue hai — dashboard ke "Passport Photo Maker" tool (`save-raw-passport-photo`) se aaye jobs, jo Gemini AI se generate hote hain (customer ke QR-order wale passport_photo se ALAG — wo `agent/jobs/` me kabhi nahi aata, dekho §3 note).

### `GET /api/agent/passport-jobs/`
**Kahan**: `PollPassportPhotoJobsAsync()` — [Form1.cs:1416-1439](Print%20Agent/Print%20Agent/Form1.cs#L1416-L1439). Same timer tick, `PollAndPrintAsync()` ke turant baad.
**Response**: `{jobs: [PassportJob...]}`. Har job (agar `_claimedPassportJobIds` me nahi hai) ke liye independent `ProcessPassportPhotoAiJobAsync()` spawn hoti hai.

### `POST /api/agent/passport-jobs/{jobId}/claim/`
**Kahan**: `ProcessPassportPhotoAiJobAsync()` — [Form1.cs:1441-1486](Print%20Agent/Print%20Agent/Form1.cs#L1441-L1486). Row-locked server-side (dekho `API_DOCUMENTATION.md` §11).
**Edge case**: response `null` aaye ya `claimed.Status != "claimed"` (matlab dusre agent-instance ne pehle claim kar liya, server `409` deta hai jo yahan exception ban jaata — but code isse bhi handle karta hai as "already taken, skip") → job silently skip, `_claimedPassportJobIds` se turant hata diya jaata hai (`finally` block).

### `GET <job.OriginalImageUrl>` (= `/api/agent/passport-jobs/{jobId}/original-image/`)
**Kahan**: `CafeMitraApi.DownloadFile()`, called [Form1.cs:1454](Print%20Agent/Print%20Agent/Form1.cs#L1454). `claimed.OriginalImageUrl` server-generated absolute URL hai. **Note**: `AddAuth()` yahan bhi Bearer header attach karta hai, lekin server-side `agent_passport_original_image` view me **koi auth check hi nahi hai** (`API_DOCUMENTATION.md` §11 ka security gap) — token bheja jaata hai but server ignore kar deta hai.

### Gemini AI generation (koi backend API nahi — browser automation)
Downloaded photo `WebView2` (embedded Chromium) me `gemini.google.com` par clipboard-paste + prompt-inject + send-button-click automation se process hoti hai — [Form1.cs:903-1096](Print%20Agent/Print%20Agent/Form1.cs#L903-L1096). Yeh koi REST call nahi hai (DOM automation via `ExecuteScriptAsync`), isliye "payload/edge case" is sense me apply nahi hote, lekin timing directly agli API call decide karti hai:
- Result image ke liye **poll every 3s, max 100 attempts = up to 5 minutes** — [Form1.cs:1169-1171](Print%20Agent/Print%20Agent/Form1.cs#L1169-L1171). Expects exactly 7 `<img>` tags on page (Gemini ka current DOM layout) aur decoded image size > 100KB (placeholder/thumbnail avoid karne ke liye).
- Timeout ya koi bhi step fail (editor not found, paste fail, send button disabled after 6×300ms retries, page layout badal gaya) → `null` return, saari calling paths isse "Gemini did not return a photo in time" jaisi failure treat karte hain.
- **Fragile point**: yeh selectors (`.ql-editor`, `button[aria-label="Send message"]`, `imgs.length !== 7`, `a[data-test-id="new-chat-button"]`) Gemini web-app ke current DOM se hard-coupled hain — Google agar UI change kare to yeh silently poll-timeout ho jaayega (koi structural-error signal nahi milega, sirf generic timeout).
- `_geminiLock` (SemaphoreSlim(1,1)) ek time pe sirf **ek hi** Gemini generation allow karta hai (chahe wo manual tBoxSource use ho, ya passport-order queue, ya passport-AI-tool queue) — teeno paths isi ek WebView2 tab/clipboard ko share karte hain.

### `POST /api/agent/passport-jobs/{jobId}/complete/` — success path
**Kahan**: `CafeMitraApi.CompletePassportJob(jobId, filePath)` — [CafeMitraApi.cs:85-88](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L85-L88), [Form1.cs:1474](Print%20Agent/Print%20Agent/Form1.cs#L1474). Multipart, field name **`final_image`**.

### `POST /api/agent/passport-jobs/{jobId}/complete/` — failure path
**Kahan**: `CafeMitraApi.FailPassportJob(jobId, message)` — [CafeMitraApi.cs:90-101](Print%20Agent/Print%20Agent/CafeMitraApi.cs#L90-L101). Same endpoint, different body: multipart fields `status="failed"` + `message`. Do jagah se trigger:
1. Gemini timeout/fail → message = `"Gemini did not return a photo in time."`
2. Koi bhi unhandled exception `ProcessPassportPhotoAiJobAsync`'s catch me → message = `ex.Message` (raw .NET exception text — server-side yeh `friendly_photo_error_message()` se sanitize hoke hi customer-facing response me jaata hai, `API_DOCUMENTATION.md` §10 dekho).

**Edge case ⚠️**: `FailPassportJob` khud ek `try { } catch { /* best effort */ }` ke andar call hoti hai — agar yeh call bhi fail ho jaaye (server down), to job server-side **hamesha `claimed` state me atka reh jaata hai**, kabhi `failed`/`pending` nahi banta — koi automatic timeout-recovery client-side nahi hai (server-side bhi sirf `check_passport_photo` poll ke andar 60s-stale-job auto-fail logic hai, `agent/passport-jobs/` ke apne queue ke liye nahi).

---

## 5. Auto-update — GitHub, **NOT** `cafemitra_server` ⚠️

`cafemitra_server` API me `GET /api/agent/version-check/` aur `GET /api/agent/update/` endpoints maujood hain (dekho `API_DOCUMENTATION.md` §13) — lekin **Print Agent inhe kabhi call nahi karta**. Actual update-check GitHub raw files se hota hai:

### `GET https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/letest_version`
**Kahan**: `VersionChecker.CheckAndLaunchUpdaterIfNeeded()` — [VersionChecker.cs:17-45](Print%20Agent/Print%20Agent/VersionChecker.cs#L17-L45). Form-load ke sabse pehle step me chalta hai, 8-second timeout ke saath. Response text ko current build-version label se compare karta hai (case-insensitive string match).
**Edge cases**: khaali response, network error, ya koi bhi exception → **hamesha** "no update available" treat hota hai (never blocks app startup — "shop ka internet down ho to bhi app chalna chahiye" wala explicit design decision, comment me likha hai).

### `GET https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/update.zip`
**Kahan**: `UpdaterForm.DownloadWithProgress()` in `Updater.exe` — [UpdaterForm.cs:195-218](Print%20Agent/PrintAgentUpdater/UpdaterForm.cs#L195-L218). `PrintAgent.exe` sirf `Updater.exe --pid <self> --dir <installDir> --exe <exePath>` launch karke turant close ho jaata hai — [VersionChecker.cs:47-82](Print%20Agent/Print%20Agent/VersionChecker.cs#L47-L82). Updater khud parent process ko gracefully-then-forcefully close karta hai, zip download+extract karta hai, files copy karta hai (locked-file retry ke saath, 6 attempts), aur `PrintAgent.exe` dobara launch karta hai.
**Edge cases**: `Updater.exe` file hi missing ho install-dir me → update skip, purane version se chalta rehta hai. Download/extract/copy me koi bhi failure → error dikhta hai UI me lekin **purana app phir bhi relaunch ho jaata hai** (shop kabhi bina-working-app ke nahi rehta, yeh bhi explicit design hai — comment: "Don't leave the shop stuck without a working app").

> **⚠️ Follow-up worth raising**: `cafemitra_server`'s `/api/agent/version-check/` aur `/api/agent/update/` (jinke liye `media/agent/version.txt` aur `PrintPilot-latest.zip` serve karne ka poora setup already hai) is-waqt **dead/unused** hain jahan tak yeh actual client ka sawaal hai — real update-distribution GitHub se ho raha hai. Ya to yeh server endpoints hata do (agar GitHub hi permanent mechanism hai), ya `VersionChecker`/`Updater` ko inpe switch karo (agar GitHub sirf temporary tha) — abhi dono mechanism maujood hain aur confusing hain kisi naye dev ke liye jo `views.py` padh ke sochega yehi live update path hai.

---

## 6. Local Bridge API — Print Agent khud serve karta hai (`127.0.0.1:8765`)

Yeh **cafemitra_server ki API nahi hai** — ulta direction hai: Print Agent apne andar ek chhota raw-TCP HTTP server chalata hai (`LocalStatusServer.cs`) jise website ka **browser JS** (PrintPilot Setup wizard page, `cafemitra_client`) hit karta hai taaki agent ko control kar sake (printer select karna, test print, printer presets manage karna) bina kisi cloud round-trip ke. Yeh CORS-open hai (`Access-Control-Allow-Origin: *`) kyunki caller hamesha same-machine browser hota hai.

**Implementation note**: yeh `System.Net.HttpListener` nahi, raw `TcpListener` + manual request-line/header parsing hai — sirf `Content-Length` header parse karta hai, chunked-encoding ya kisi aur header ko samajhta nahi. Koi auth nahi hai (localhost-only trust model).

| Method | Path | Handler (Form1.cs) | Request body | Response |
|---|---|---|---|---|
| `GET` | `/status` | `GetStatusSnapshot()` | — | `AgentStatusSnapshot`: app, status (running\|stopped), account, printer, printers[], apiBaseUrl, lastCheckAt, version, online |
| `POST` | `/settings` | `SavePrinterFromLocalApi()` | `{printer}` | Updated `AgentStatusSnapshot` |
| `POST` | `/test-print` | `RunQrPrintFromLocalApi(isPoster:false)` | `LocalTestPrintRequest` (printer, shopName, shopCode, qrUrl, qrImage, colorMode) | `LocalTestPrintResult` (message, printer, printedAt, printers[]) |
| `POST` | `/poster-print` | `RunQrPrintFromLocalApi(isPoster:true)` | Same as test-print | Same shape |
| `GET` | `/printer-presets` | `ListPresetsFromLocalApi()` | — | `PrinterPresetsResponse`: presets[], printers[], paperSizes[], colorModes[] |
| `POST` | `/printer-presets` | `SavePresetFromLocalApi()` | `SavePrinterPresetRequest` (printer, paperSize, colorMode, original?) | `PrinterPresetsResponse` |
| `POST` | `/printer-presets/delete` | `DeletePresetFromLocalApi()` | `PrinterPresetDto` (printer, paperSize, colorMode) | `PrinterPresetsResponse` |
| `OPTIONS` | (koi bhi path) | — | — | `204` (CORS preflight) |
| any other | — | — | — | `404 {"message":"Not found"}` |

**Edge cases:**
- `/settings`: `printer` khaali ho to koi change nahi hota, chup-chaap current snapshot return ho jaata hai (error nahi).
- `/test-print`, `/poster-print`: printer resolve na ho (na request me, na currently-selected combobox me) → `InvalidOperationException("Select printer first.")` → server 500 bhejta hai `{"message": "..."}`  ke saath (koi structured 400 nahi, sab errors yahan 500 hi hote hain — [LocalStatusServer.cs:140-143](Print%20Agent/Print%20Agent/LocalStatusServer.cs#L140-L143)).
- `/printer-presets` (save): `printer`/`paperSize`/`colorMode` me se koi khaali → `InvalidOperationException` → `500`.
- Koi bhi handler exception throw kare → generic `500 {"message": error.Message}` (raw .NET exception message directly browser tak jaata hai, sanitize nahi hota).
- Server sirf `127.0.0.1` (loopback) pe bind hota hai — LAN/remote se accessible nahi. Agar port `8765` already kisi aur process ne le rakha ho (dusra agent-instance chal raha ho) → `Start()` exception silently log ho jaati hai, bridge disabled reh jaata hai lekin poora app crash nahi hota.
- `colorMode` string free-form parse hoti hai (`ParseColorMode`) — `"color"`/`"colour"`/`"c"` (case-insensitive) → Color, baaki sab (khaali samet) → Black & White default.

---

## 7. Summary table — CafeMitra server APIs jo Print Agent consume karta hai

| Endpoint | Method | Kab | File:Line |
|---|---|---|---|
| `/api/auth/login/` | POST | Manual login button + auto-login startup loop | CafeMitraApi.cs:10 |
| `/api/auth/refresh/` | POST | Internal, kisi bhi 401 par automatically | CafeMitraApi.cs:196 |
| `/api/agent/jobs/` | GET | Har poll tick (default 10s) | CafeMitraApi.cs:45 |
| `/api/agent/jobs/{id}/status/` | POST | printing / printed / failed transitions | CafeMitraApi.cs:49 |
| `/api/orders/{id}/approve-cash/` | POST | Cash-counter dialog → Yes | CafeMitraApi.cs:59 |
| `/api/orders/{id}/reject-cash/` | POST | Cash-counter dialog → No | CafeMitraApi.cs:64 |
| `/api/agent/jobs/{id}/gemini-photo/` | POST | (dead path — agent/jobs/ never returns passport_photo, dekho §3) | CafeMitraApi.cs:69 |
| `<job.DownloadUrl>` (media file) | GET | Print document download | CafeMitraApi.cs:128 |
| `/api/agent/passport-jobs/` | GET | Har poll tick, jobs list | CafeMitraApi.cs:74 |
| `/api/agent/passport-jobs/{id}/claim/` | POST | Job claim before processing | CafeMitraApi.cs:80 |
| `<job.OriginalImageUrl>` (= .../original-image/) | GET | Raw source photo download | CafeMitraApi.cs:128 (DownloadFile) |
| `/api/agent/passport-jobs/{id}/complete/` | POST (multipart `final_image`) | Gemini success | CafeMitraApi.cs:85 |
| `/api/agent/passport-jobs/{id}/complete/` | POST (multipart `status=failed`) | Gemini/any failure | CafeMitraApi.cs:90 |
| `/api/agent/version-check/`, `/api/agent/update/` | — | **Kabhi call nahi hote** (GitHub use hota hai, §5) | — |

---

## 8. Known Gaps / Follow-ups (is client-side review se mile)

1. **`PrintJob.ColorMode` server se kabhi aata hi nahi** — agent hamesha text-guessing fallback use karta hai. (§3)
2. **Client-side dedup sirf in-memory hai** (`_printedIds`, `_claimedPassportJobIds`) — app restart hone par reset, jisse ek job dobara print/claim ho sakta hai agar pehli baar status-update fail hua ho. (§3, §4)
3. **Printer-mismatch jobs silently stuck rehte hain** — koi status update server ko nahi jaata jab tak operator khud matching printer preset add na kare. (§3)
4. **Gemini automation UI-selector-fragile hai** — Google ke DOM change se silently timeout hoga, koi distinct error signal nahi. (§4)
5. **`FailPassportJob` khud best-effort hai** — agar yeh bhi fail ho jaaye to job hamesha `claimed` state me atka reh sakta hai, koi client-side ya `/agent/passport-jobs/` queue-specific timeout-recovery nahi. (§4)
6. **Auto-update do alag mechanism** — server ke `/api/agent/version-check/`+`/update/` endpoints dead hain, actual updates GitHub se aate hain. Consolidate karne layak. (§5)
7. **Local bridge (`127.0.0.1:8765`) me koi auth nahi**, saare errors generic `500` ban jaate hain (raw exception message browser ko jaata hai), aur port-conflict silently bridge disable kar deta hai. (§6)
8. **Config token store unencrypted** (`config.json` me `AccessToken`/`RefreshToken` plain text) jabki password `credentials.dat` DPAPI-encrypted hai — inconsistent protection level for two both-sensitive secrets on the same machine.

---

## 9. Cross-reference

- Server-side full contract (request/response/edge cases) har endpoint ka: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
- Postman collection (sabhi server endpoints, is doc se independently testable): [`cafemitra_server/postman_collection.json`](cafemitra_server/postman_collection.json).
- Admin/platform controls jo in jobs/orders ko affect karte hain: [`ADMIN_FEATURES.md`](ADMIN_FEATURES.md).
