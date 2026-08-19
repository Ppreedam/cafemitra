# API Updates — since last doc snapshot (2026‑08‑07 → 2026‑08‑15)

`API_DOCUMENTATION.md` aur `PRINT_AGENT_API.md` dono last baar commit `4e5ff3f` (2026‑08‑07) pe likhe gaye the. Us commit ke baad `dev` branch me `cafemitra_server/api/` me **~3,900 lines** ka change aaya hai (24 files: `views.py`, naya `admin_views.py`, naye modules, models, migrations). Yeh file un dono docs ko **replace nahi karti** — sirf **delta** cover karti hai: kya naya aaya, kya badla, kya (agent-side) abhi bhi missing hai.

**Sabse important finding (Print Agent ke liye):** frontend ek naya local-bridge endpoint (`POST /print-file`) already call kar raha hai jo **desktop Print Agent me implement hi nahi hua** — dekho [§4](#4-not-yet-implemented-in-print-agent-verified-gap). Ismein saara analysis actual code diff (`git diff 4e5ff3f..HEAD`) padh ke verify kiya gaya hai, guesswork nahi.

Reference commit range: `4e5ff3f` (docs baseline) → `85bb827` (current `dev` HEAD, 2026‑08‑15).

---

## 1. Passport-Photo pipeline — architecture change (directly affects Print Agent)

`PRINT_AGENT_API.md` §4 ke saare claims **ab bhi mostly sahi hain**, lekin server-side teen badlaav hue hain jo Print Agent ke behavior ko change karte hain bina Print Agent ka apna code chhue:

### 1.1 Passport queue ab per-shop nahi, **shared/pooled** hai
`GET /api/agent/passport-jobs/`, `POST /api/agent/passport-jobs/{id}/claim/`, aur `POST /api/agent/passport-jobs/{id}/complete/` — teeno pehle `user=user` (sirf apni shop ke jobs) filter karte the. Ab **nahi karte**:

```python
# agent_passport_jobs — pehle: filter(user=user, service_key="passport_photo", ...)
# ab:
jobs = PrintOrder.objects.filter(
    service_key="passport_photo", photo_status=PrintOrder.PHOTO_STATUS_PENDING,
).order_by("created_at")[:20]
```

Matlab **koi bhi authenticated account** (kisi bhi shop ka login token) ab **kisi bhi shop ke** pending passport-photo job ko claim/complete kar sakta hai — code-comment isse "bulk agent" bolta hai ("Bill the order's own owner even when the bulk agent (a different account) is the one completing the job on their behalf" — `views.py` line ~3885). Billing ab hamesha `order.user` (order ka asli owner) ko charge hoti hai, claim/complete karne wale account ko nahi.

**Kyun important hai Print Agent ke liye**: agar future me RepetiGo ek centralized/bulk photo-processing agent-instance chalata hai (ek hi Gemini-automation session poore platform ke liye), to yeh pattern usko support karta hai. Lekin isका ek side-effect bhi hai: **koi bhi Print Agent user (kisi bhi shop ka)** ab technically kisi doosri shop ka bhi passport job claim kar sakta hai — is-waqt koi ownership check nahi hai us endpoint pe. `PRINT_AGENT_API.md` §4/§8 me isko naya known-gap ke roop me add karna chahiye.

### 1.2 Server-side Gemini fallback — naya, poora backend-only
Naya module-level code (`views.py`, `generate_passport_photo_with_gemini`, `apply_gemini_fallback`) — server khud seedha Gemini's REST image API (`gemini-2.5-flash-image`, `GEMINI_API_KEY` env var) hit kar sakta hai, **Print Agent ke WebView2 automation ke bina**. Do jagah trigger hota hai:
1. `GET /api/public-orders/passport-photo/check/` (`check_passport_photo`) — agar `photo_status == FAILED`, pehle `apply_gemini_fallback(order)` try hota hai; success ho to customer ko turant photo mil jaata hai (agent ki zaroorat hi nahi padi).
2. `POST /api/agent/passport-jobs/{id}/complete/` — agar Print Agent khud `status=failed` bhejta hai (`request.POST.get("status") == "failed"`), server usi request ke andar `apply_gemini_fallback(order)` bhi try karta hai — matlab **Print Agent ki reported failure ko server chup-chaap "recover" kar sakta hai**, customer ko pata bhi nahi chalega ki desktop agent fail hua tha.

Yeh `PRINT_AGENT_API.md` §4 ke "Gemini AI generation (koi backend API nahi)" wale claim ko **partially outdated** kar deta hai — ab ek backend Gemini path bhi exist karta hai (fallback-only, agent ka primary path replace nahi karta).

### 1.3 Watermark removal ab centralized, server-side
Naya module `cafemitra_server/api/background_remover/watermark_remover.py` (`remove_gemini_watermark()`) — doc-baseline commit (`4e5ff3f`) ke time yeh file exist hi nahi karti thi. Ab dono paths (agent-uploaded `final_image` **aur** server's apna Gemini fallback output) isi function se guzarte hain, taaki watermark-removal consistent ho chahe photo kahin se bhi aaya ho. `complete_passport_job` me content-type bhi ab filename-extension se guess hota hai (`mimetypes.guess_type`) kyunki agent generic `application/octet-stream` bhejta hai — content-type ka fallback-chain thoda robust hua hai.

---

## 2. Double-settlement bug — **fixed** (was a known gap in the docs)

`PRINT_AGENT_API.md` §3 pehle likhta tha: *"`status=printed` yehi call wallet settlement trigger karti hai"* bina kisi idempotency guard ke. Ab `agent_job_status` (`POST /api/agent/jobs/{orderId}/status/`) row-locked check-and-set karta hai:

```python
with transaction.atomic():
    locked_order = PrintOrder.objects.select_for_update().get(id=order.id)
    if locked_order.settled_at is None:
        settle_printed_order_wallet(locked_order)
        locked_order.settled_at = timezone.now()
        locked_order.save(update_fields=["settled_at"])
```

Naya `PrintOrder.settled_at` field (migration `0015`) is guard ke liye hai. Ab agar Print Agent ka `status=printed` call slow-response ki wajah se retry ho (jaisa `PRINT_AGENT_API.md` khud mention karta hai ki ho sakta hai), settlement **sirf ek baar** hoga. Yeh `API_DOCUMENTATION.md` §12 ke "double-settlement note" ko resolve kar deta hai — us section ko ab "fixed" mark karna chahiye.

---

## 3. Naya: Print-Agent heartbeat + Admin monitoring

- `GET /api/agent/jobs/` ab har poll pe `UserProfile.agent_last_seen_at = now()` stamp karta hai (naya field, migration `0014`) — pehli baar koi "is this shop's agent alive" signal server ko milta hai.
- Naya `GET /api/admin/print-agent/stats/` (admin dashboard, `print_agent` role-section) is field ko use karke **online/offline shops list** (5-min cutoff) + last-7-days ke `status=failed` jobs dikhata hai.
- Note (code-comment se): abhi bhi **agent apna version report nahi karta** — sirf last-seen-timestamp hai, version-distribution nahi. Yeh existing gap-list (§8 #6, GitHub-vs-server update mechanism) se related hai lekin alag issue hai.

---

## 4. Not-yet-implemented in Print Agent — verified gap

`cafemitra_client/lib/printpilot-agent.ts` me ek naya function hai:

```ts
// Prints an arbitrary already-generated PDF (e.g. a Resume Builder download)
// directly on the shop's configured printer via the local desktop agent -
// no server-side PrintJob involved, unlike the QR-order queue.
export async function runAgentPrintFile(request: PrintFileRequest) {
  return fetchAgentEndpoint<PrintFileResult>(["http://127.0.0.1:8765/print-file"], { ... });
}
```

Yeh Resume Builder aur Biodata Maker dono ke build-page ("Print via PrintPilot" button — `ResumeBuilderClient.tsx`, `BiodataBuilderClient.tsx`) se already call ho raha hai. **Lekin `Print Agent/Print Agent/LocalStatusServer.cs` me `/print-file` path handle hi nahi hota** — verified via grep, koi match nahi mila kisi bhi `.cs` file me "print-file" ya "PrintFile" ke liye. `Print Agent` folder me doc-baseline commit ke baad **koi commit hi nahi aayi** (`git log 4e5ff3f..HEAD -- "Print Agent"` empty hai).

**Result**: jab bhi koi shop-owner Resume Builder/Biodata Maker se "Print via PrintPilot" dabaata hai, request `127.0.0.1:8765/print-file` pe jaati hai, jo `LocalStatusServer.cs`'s catch-all se `404 {"message":"Not found"}` return karta hai (dekho `PRINT_AGENT_API.md` §6 table, "any other → 404"). **Yeh feature is-waqt broken hai** jab tak Print Agent me `/print-file` handler add na ho.

Server-side is naye print-model ka reasoning: `resume_builder`/`biodata_maker` orders ab kabhi bhi `agent_jobs()` (physical print queue) me nahi aate — inhe explicitly exclude kiya gaya hai (§5.1 neeche) — kyunki inka print path **hamesha** local-bridge `/print-file` hona chahiye tha, server-queued job nahi. Matlab yeh naya feature end-to-end design ho chuka hai server+frontend side, sirf Print Agent ka apna hissa baaki hai.

**Suggested `/print-file` contract** (frontend ke request/response types se reverse-engineered, `printpilot-agent.ts` lines 37-50):
- `POST /print-file` — body `{printer, fileName, pdfBase64, paperSize?, colorMode?}` (base64-encoded PDF, koi server-side PrintJob involved nahi — pura payload hi client bhejta hai)
- Response `{message?, printer?, printedAt?, printers?}` — same shape as `/test-print`/`/poster-print`.

---

## 5. Naye endpoints — full inventory

### 5.1 Resume Builder & Biodata Maker (naye tools)

| Endpoint | Method | Note |
|---|---|---|
| `/api/tools/resume-builder-charge/` | POST | Per-template PDF-download charge gate (free jab tak `ToolPricing` row `resume_builder_{templateId}` configured na ho) |
| `/api/tools/resume-builder/save/` | POST | Draft save/update as `PrintOrder` (`service_key="resume_builder"`, status seedha `PRINTED` — **never** queued, agent_jobs isse explicitly exclude karta hai) |
| `/api/tools/resume-builder/saved/` | GET | Caller ke saved resumes |
| `/api/tools/resume-builder/saved/{id}/delete/` | POST | Delete one |
| `/api/tools/resume-builder/saved/{id}/mark-paid/` | POST | Owner cash-payment confirm karta hai customer ke resume order ke liye (mirrors passport `mark_passport_order_paid`) — dedupe `(user, order, kind)` pe |
| `/api/public-shop/{code}/resume-builder/save/` | POST | Anonymous customer apna resume order create/update kare (public/QR flow) |
| `/api/tools/biodata-maker-charge/`, `/save/`, `/saved/`, `/saved/{id}/delete/`, `/saved/{id}/mark-paid/` | — | Same pattern as resume, `service_key="biodata_maker"` |
| `/api/public-shop/{code}/biodata-maker/save/` | POST | Same as resume public path |

Dono tools ka data `PrintOrder.resume_data` / `PrintOrder.biodata_data` (naye `JSONField`s, migrations `0020`/`0022`) me store hota hai — poora structured form-data, taaki draft dobara khol ke edit ho sake (sirf re-download nahi).

**Print flow yaad rakhna**: yeh orders **kabhi** `GET /api/agent/jobs/` se print-queue me nahi aate. `agent_jobs()` ab explicitly `service_key__in=["passport_photo", "resume_builder", "biodata_maker"]` exclude karta hai. Actual printing sirf local-bridge `/print-file` se hoti hai (§4 dekho — abhi broken hai).

### 5.2 Admin Dashboard API (`/api/admin/...`) — poori nayi surface, ~35 endpoints

`cafemitra_admin` (Next.js) ke liye naya staff-only REST API, `admin_views.py` (1856 lines, naya file) me. Auth: same Bearer-token mechanism (`auth_user()`), plus `user.is_staff` check (`admin_auth.require_admin`), plus optional per-section role-gate (`admin_auth.require_section` — roles: `super_admin` (sab kuch), `finance`, `support`, `sales`; sections: `shops`, `orders`, `wallet`, `agents`, `support`, `leads`, `print_agent`, `analytics`, `activity_log`, `security`). Har mutating endpoint `AdminActivityLog` me audit-logged hota hai (naya model, migration `0016`).

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/auth/login/` | POST | Staff-only login, issues token pair (non-staff ko sahi password ke baad bhi reject karta hai) |
| `/api/admin/me/` | GET | Current admin profile |
| `/api/admin/overview/` | GET | Platform-wide KPI tiles + recent-activity feed |
| `/api/admin/shops/` | GET | Paginated/filtered shop list |
| `/api/admin/shops/{id}/` | GET/PUT | Full shop detail / credit-limit + cash-counter permission edit |
| `/api/admin/shops/{id}/adjust-balance/` | POST | Manual wallet credit/debit, mandatory reason, audit-logged |
| `/api/admin/shops/{id}/suspend/`, `/reactivate/` | POST | Deactivate / reactivate shop account |
| `/api/admin/shops/bulk-suspend/`, `/bulk-reactivate/` | POST | `{shopIds: [...]}` bulk versions |
| `/api/admin/shops/{id}/send-password-reset/` | POST | Trigger standard password-reset email |
| `/api/admin/shops/{id}/impersonate/` | POST | Fresh token pair for the shop's own account (support/debug, logged) |
| `/api/admin/orders/stuck/` | GET | Awaiting-approval / stuck photo jobs, all shops |
| `/api/admin/orders/`, `/orders/{id}/` | GET | Platform-wide order list / detail |
| `/api/admin/orders/export/` | GET | CSV, same filters as list, capped 5000 rows |
| `/api/admin/wallet/ledger/`, `/ledger/export/` | GET | Platform-wide wallet ledger + CSV |
| `/api/admin/wallet/topups/` | GET | Gateway-wise top-up list |
| `/api/admin/withdrawals/` | GET | Withdrawal queue |
| `/api/admin/withdrawals/{id}/approve/` | POST | Mark paid |
| `/api/admin/withdrawals/{id}/reject/` | POST | Reject **and reverses the debit** (fixes `ADMIN_FEATURES.md` roadmap item — see §6) |
| `/api/admin/wallet-settings/`, `/wallet-settings/{key}/` | GET/PUT | Global wallet config |
| `/api/admin/wallet/earnings-summary/` | GET | Today/week/month platform earning vs prior period |
| `/api/admin/tool-pricing/`, `/tool-pricing/{key}/` | GET/PUT | Per-tool usage fees |
| `/api/admin/agents/`, `/agents/{id}/` | GET/POST/PUT | Referral Agent Program (§7 dekho) |
| `/api/admin/contact-messages/`, `/{id}/` | GET/PUT | Contact-us inbox, mark resolved + `admin_note` (naya field) |
| `/api/admin/print-agent/stats/` | GET | §3 dekho |
| `/api/admin/notifications/` | GET | Sidebar-badge counts |
| `/api/admin/analytics/signups/` | GET | Signup time-series + referral breakdown |
| `/api/admin/activity-log/` | GET | Audit trail |
| `/api/admin/staff/`, `/staff/{id}/role/`, `/staff/{id}/revoke/` | GET/POST/PUT | Staff account + role management (`super_admin` only) |
| `/api/admin/recent-activity/` | GET | Merged orders+topups+withdrawals feed |
| `/api/admin/leads/scrape/run/`, `/scrape/status/` | POST/GET | §8 dekho |

### 5.3 Other new tool endpoints

None outside resume/biodata — `tools/enhance-background-image`, `tools/website-to-image`, `tools/detect-faces` sab pehle se the (`4e5ff3f` se pehle).

---

## 6. Wallet — naye transaction kinds + logic changes

- `WalletTransaction.KIND_WITHDRAWAL_REVERSAL` — naya, `admin_withdrawal_reject` use karta hai (§5.2).
- `WalletTransaction.KIND_ADMIN_ADJUSTMENT` — naya, `admin_shop_adjust_balance` use karta hai.
- `WalletTransaction.KIND_REFERRAL_COMMISSION` — naya, §7 dekho.
- `settle_printed_order_wallet` ab return value (`fee_txn`) capture karta hai taaki `accrue_referral_commission` ko hook kiya ja sake — dekho §2 aur §7.

---

## 7. Naya: Referral Agent Program (business feature, dormant-ish)

Naya `Agent` model (naam collision se bacho — yeh **desktop Print Agent nahi hai**, yeh ek referral **business partner** hai, jaisे koi cybercafe jo doosre cafes ko RepetiGo refer karta hai). `ShopProfile.referred_by_agent` (naya FK) track karta hai kis agent ne kis shop ko refer kiya.

- Jab ek referred shop ka koi print-order settle hota hai, `accrue_referral_commission()` (naya, `views.py`) automatically agent ko commission credit karta hai (`percentage` ya `fixed`, `Agent.commission_type`/`commission_rate` se) — `create_wallet_transaction`'s `(user, order, kind)` dedupe hi double-credit se bachata hai (retried settlement ab `settled_at` guard se already prevented hai, §2).
- Full CRUD admin se: `/api/admin/agents/` (list/onboard), `/api/admin/agents/{id}/` (detail + referred shops + commission ledger, edit rate/type/status/offer).
- Status lifecycle: `pending → active → suspended`. **Suspended/pending agents ko commission nahi milta** (`accrue_referral_commission` explicitly `status != ACTIVE` pe skip karta hai).

---

## 8. Naya: Leads scraper — background job runner

Naya `cafemitra_server/api/lead_scraper_runner.py` + `gmaps_scraper.py` (Selenium-based Google Maps extractor, `google_maps_scraper_selenium/` repo-root folder se related lagta hai) — admin dashboard se ek "Run Extractor" button background thread me `ScrapeRun` (naya model, migration `0018`) progress-track karte hue chalata hai, taaki HTTP request block na ho.

- `POST /api/admin/leads/scrape/run/` — background start
- `GET /api/admin/leads/scrape/status/` — latest run ka progress poll

**`GET /api/google-places/` abhi bhi intentionally unauthenticated hai** — naya code-comment isko explicitly confirm karta hai ("reverted 2026-08-11"): Chrome scraping extension Authorization header nahi bhej sakta, isliye yeh intake endpoint khula rehta hai. `API_DOCUMENTATION.md` §15 #5 ka known-gap **abhi bhi valid hai**, aur ab explicitly-intentional documented ho chuka hai (accidental gap nahi, design decision). Downstream Leads CRM endpoints (`google_place_details`, `google_place_detail_item`, `lead_activities`) auth+role-gated hi hain, koi change nahi.

---

## 9. Chhote/dead-code cleanups

- `public_mark_order_paid` view function delete ho gaya — lekin yeh already dead code tha (koi URL route pehle se hi ismein map nahi tha `4e5ff3f` pe bhi), koi behavior change nahi.
- `AdminRole` model (migration `0017`): koi staff (`is_staff=True`) account jiska koi `AdminRole` row nahi hai, wo `super_admin` maana jaata hai (backward-compat — purane staff accounts lock-out nahi hote naye role-system se).

---

## 10. `ADMIN_FEATURES.md` roadmap — kya fulfil ho chuka hai

Us tracker-file ke "Roadmap" section (§3) ke kai items ab **already ban chuke hain** is update ke through:
- ✅ "Dedicated admin dashboard (Django admin se aage)" — poora `cafemitra_admin` + `/api/admin/...` API ban chuka hai.
- ✅ "Withdrawal reject → auto-refund" — `admin_withdrawal_reject` ab debit reverse karta hai (§5.2, §6).
- ✅ "ContactMessage admin view" — `/api/admin/contact-messages/` + `admin_note` field.
- ✅ "PrintOrder admin view" — `/api/admin/orders/`.
- ✅ "ShopProfile admin view" — `/api/admin/shops/{id}/`.
- ⬜ "Bulk cash-counter permission toggle" — **abhi bhi nahi hai**; bulk-suspend/bulk-reactivate mila hai, lekin cash-counter-permission sirf per-shop (`admin_shop_detail` PUT) hai, bulk nahi.
- ⬜ "Cash Counter lock reason per-cafe customization", "Notification on auto-lock/unlock" — **abhi bhi pending** roadmap items, is update me touch nahi hue.

`ADMIN_FEATURES.md` ko is delta ke hisaab se refresh karna worth hai — abhi bhi purane "Django admin only" world describe karta hai jabki asli platform ab REST API + custom dashboard pe chala gaya hai.

---

## 11. Summary — Print Agent (`.cs` desktop app) ke liye action items

1. **`POST /print-file` implement karo** local bridge (`LocalStatusServer.cs`) me — is-waqt Resume Builder/Biodata Maker ka "Print via PrintPilot" button broken hai (§4).
2. `agent/passport-jobs/` claim/complete ab shared-pool hai — agar isse security-concern lagta hai (kisi doosri shop ka job claim ho sakta hai), server-side ownership-check wapas add karne ki request raise karo, ya confirm karo ki yeh intentional hai.
3. Server ab khud-ba-khud "recover" kar sakta hai jab Print Agent `status=failed` bhejta hai (Gemini fallback) — Print Agent ke apne logs/UI me is silent-recovery ka koi signal nahi milega; agar operator-facing "recovered by server" indication chahiye to naya response-field maang sakte ho.
4. `agent_last_seen_at` heartbeat already ho raha hai passively (har `agent/jobs/` poll pe) — koi Print Agent code-change zaroori nahi, bas isko documented rakhna hai.

---

*Yeh file ek point-in-time delta hai (`4e5ff3f` → `85bb827`). Agla update likhte waqt is file ke commit-range ko naya baseline maano, ya isi file ko refresh karo.*
