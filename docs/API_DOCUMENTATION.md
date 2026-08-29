# CafeMitra / RepetiGo — API Documentation

Yeh file `cafemitra_server` (Django) ke **saare API endpoints** (`/api/...`) ko cover karti hai — har ek ke liye: kya hai, kahan hai (source file + line), auth kaisa hai, request/response shape, aur edge cases. Postman collection (`cafemitra_server/postman_collection.json`) me yehi saare 76 requests ready-made maujood hain, isi doc ke saath in sync.

Source of truth: [`api/urls.py`](cafemitra_server/api/urls.py) (routes) + [`api/views.py`](cafemitra_server/api/views.py) (logic) + [`api/models.py`](cafemitra_server/api/models.py) (DB shape).

---

## 1. Basics

- **Base URL**: local dev me `http://127.0.0.1:8000`, sab routes `/api/` prefix ke andar hain (root `cafemitra_server/urls.py` me `path("api/", include("api.urls"))`).
- **Content types**: JSON body waale endpoints `application/json` expect karte hain aur `parse_body()` use karte hain (invalid JSON silently `{}` ban jaata hai — validation aage ke required-field checks khud handle karte hain). File-upload waale endpoints `multipart/form-data` expect karte hain.
- **Auth**: Bearer token — header `Authorization: Bearer <token>`. `auth_user(request)` header parse karke `AuthToken` table me lookup karta hai; token expired ho ya na mile to `None` (view phir `401 {"message":"Unauthorized."}` deta hai). Koi session/cookie/CSRF nahi hai — sab views `@csrf_exempt` hain.
- **Token lifecycle**: Login/Verify Email/Refresh har baar ek **naya** `AuthToken` row banate hain (ek user ke multiple concurrent sessions ke liye — browser tab aur desktop Print Agent ek dusre ka token invalidate nahi karte). Access token 1 hour, refresh token 30 din. Access expire hone par `/api/auth/refresh/` call karo naye access token ke liye (refresh token khud renew nahi hota, expire hone par dubara login karna padega).
- **Standard error shape**: zyada tar errors `{"message": "<human readable text>"}` ke saath ek non-200 status code return karte hain. Kuch batch-create endpoints `{"created": [...], "skipped": [...]}` jaisa richer shape bhi dete hain.
- **Common status codes across the API**: `400` validation fail, `401` missing/invalid/expired token, `402` wallet balance/limit block (Payment Required — literal wallet-money context, HTTP-payment nahi), `403` permission/state not allowed, `404` not found (ya ownership mismatch — dono cases same 404 taaki existence leak na ho), `409` conflict/duplicate, `413` file too bada, `502` upstream/third-party provider error, `503` feature not configured/library missing on server.
- **OPTIONS**: har `@require_http_methods` waala endpoint OPTIONS ko bhi accept karta hai aur turant `{}` return karta hai (CORS preflight ke liye) — isliye Postman collection me OPTIONS ko alag se list nahi kiya gaya.

### Wallet — jo har billable action ke peeche hai

RepetiGo ka apna **wallet system** cafe-owners (shop) ke against chalta hai, customers ke against nahi:
- Har cafe ka `UserProfile.balance` — negative bhi ja sakta hai (`credit_limit` tak, default `-50`, per-cafe override possible).
- Jab balance `<= 0` ho jaaye to ek **daily grace-usage cap** (`daily_grace_limit`, default Rs. 5/day) lagta hai — usse upar paid tools block ho jaate hain (`402`).
- `wallet_usage_gate()` = **pre-flight check** (job shuru karne se pehle), `charge_wallet_for_tool()` = **actual deduction** (job success hone ke baad). Dono jagah check hoti hai kyunki job beech me fail bhi ho sakta hai.
- Full config `GET /api/wallet/config/` se milta hai (public, no auth) — signup bonus, referral bonus, credit limit, daily grace limit, aur har billable tool ka price. Yeh DB (`WalletSetting`/`ToolPricing`, Django admin se editable) se aata hai, code me hardcoded nahi — isliye price change ke liye deploy nahi chahiye.

---

## 2. System

### `GET /api/check/server/status/`
**File**: `views.check_server_status` — **Auth**: none.
Health-check only. Hamesha `200 {"status":"ok","message":"Server is running version7."}` — koi DB call nahi karta.

### `POST /api/contact-us/`
**File**: `views.contact_message` — **Auth**: none.
"Contact Us" form submit — `ContactMessage` row DB me save karta hai (**koi email kisi ko nahi jaata**, sirf Django admin me dikhta hai — `ADMIN_FEATURES.md` me is gap ka mention hai).
- Body: `fullName`, `email`, `phone` (optional), `subject`, `message`.
- Edge cases: `fullName` < 2 chars → 400; email regex fail → 400; `phone` diya ho aur `^[0-9+\-\s()]{7,24}$` match na kare → 400; `subject` < 2 chars → 400; `message` < 10 ya > 5000 chars → 400. Success → `201`.

---

## 3. Tools (standalone utilities, no auth)

In sabka common pattern: `multipart/form-data` me file upload, size/type validate, kaam karo, binary response (`Content-Disposition: attachment`) wapas bhejo. Koi bhi tool "billable" nahi hai by default (`ToolPricing.is_billable=False` tab tak jab tak admin flip na kare) — sirf `remove-image-background` me wallet-billing ka **hook already wired hai** (agar auth token bheja jaaye), baaki tools me abhi wallet touch hi nahi hota.

| Endpoint | Kya karta hai | Server dependency |
|---|---|---|
| `POST /tools/ai-upscale-image/` | Third-party AI provider (`AI_UPSCALE_API_URL`) ko relay karke image upscale karta hai | External API configured hona chahiye |
| `POST /tools/extract-pdf-text/` | PDF se page-wise text nikaalta hai | PyMuPDF (`fitz`) installed |
| `POST /tools/remove-image-background/` | Background hataata hai (transparent PNG) | Local background-remover module |
| `POST /tools/enhance-background-image/` | Pehle se transparent PNG ke edges/color-halo clean karta hai (background remover NAHI hai, sirf post-processing step) | Local processor module |
| `POST /tools/website-to-image/` | Kisi public website ka full-page screenshot leta hai | External API (`WEBSITE_SCREENSHOT_API_URL`) |
| `POST /tools/detect-faces/` | Image me face bounding boxes detect karta hai (normalized %) | opencv-python + numpy installed |

**Common edge cases (sab image tools pe apply):**
- File missing → `400`. File > 15MB (PDF: 30MB) → `413`. Content-type allow-list se bahar → `400` (`enhance-background-image` sirf **exactly `image/png`** accept karta hai, jpeg/webp reject).
- Third-party-dependent tools (`ai-upscale-image`, `website-to-image`): env var configured nahi → `503`; provider ne error diya → `502` (with `providerDetail`); provider unreachable/timeout → `502`; provider ne image ke alawa kuch bheja/khaali bheja → `502`.
- Library missing on server (`fitz` ya `cv2`/`numpy`) → `503`.
- `website-to-image` ek **SSRF guard** karta hai: hostname `localhost` ya kisi bhi private/non-global IP pe resolve ho to `400` (DNS resolve karke check hota hai, sirf regex se nahi).
- `remove-image-background`: agar `Authorization` header bheja aur tool billable hai to wallet-gate check hoga (balance kam ho to `402`); token na bheje to hamesha free.

---

## 4. Auth

Registration flow: `register` → email verification link (24h TTL) → `verify-email` (activates account + one-time signup-bonus wallet credit + auto-login token pair). Login inactive account ke liye `403` deta hai, active-but-wrong-password ke liye `401`.

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `POST /auth/register/` | none | Naya inactive user + `UserProfile` + `ShopProfile` banata hai, verification email bhejta hai |
| `POST /auth/login/` | none | Access+refresh token pair issue karta hai |
| `POST /auth/refresh/` | none (refresh token body me) | Naya access token (same row pe, refresh token same rehta hai) |
| `POST /auth/verify-email/` | none | Account activate + signup bonus + auto-login |
| `POST /auth/resend-verification/` | none | Verification email dobara bhejta hai |
| `POST /auth/request-password-reset/` | none | Reset link email karta hai (30 min TTL) |
| `POST /auth/reset-password/` | none | Naya password set karta hai |
| `POST /auth/change-password/` | **required** | Logged-in user apna password change karta hai |
| `POST` / `DELETE /auth/delete-account/` | none | Account permanently delete |

**Edge cases:**
- `register`: email format invalid → `400`; `fullName` < 2 chars → `400`; phone exactly 10 digits nahi → `400`; password < 8 chars → `400`; email already registered (`username=email` match) → `409`; SMTP fail ho jaaye to abhi-abhi banaya user **rollback** ho jaata hai aur `500`.
- `login`: account inactive but password sahi → `403` ("verify your email"); email/password galat → `401` (dono cases same generic message, taaki attacker ko pata na chale kaunsa field galat tha).
- `verify-email`: token na mile / already used / expired (24h) → `400`.
- `resend-verification`, `request-password-reset`: **jaan-boojh kar** hamesha generic `200` message dete hain chahe account exist kare ya na kare (anti-enumeration) — sirf agar condition match kare tab actually email jaati hai.
- `reset-password`: password < 8 chars → `400`; token invalid/used/expired (30 min) → `400`; token valid but account abhi bhi unverified → `403`.
- `refresh`: refreshToken blank → `401`; token na mile ya 30-din expiry paar ho gayi → `401` "session expired, please login again" (koi auto-renew nahi hai, dobara login zaroori).
- `change-password`: current password galat → `400`; naya password < 8 chars → `400`.
- **`delete-account` — ⚠️ SECURITY GAP**: is endpoint pe **na koi auth token chahiye, na current password** — sirf email address bhejo aur account permanently delete ho jaata hai (`on_delete=CASCADE` se profile/shop/orders/wallet history/tokens sab saath delete, plus uploaded files bhi disk se hat jaate hain). Matlab jo bhi kisi cafe owner ka email jaanta hai, wo unka poora account + order history ek single unauthenticated POST se udaa sakta hai. Team ke saath confirm karne layak item hai ki yeh intentional hai ya bug.

---

## 5. Profile

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `GET /profile/` | required | `{user, shop}` return karta hai (missing rows auto-create ho jaate hain) |
| `PUT /profile/` | required | Partial update — jo field body me nahi hai wo unchanged rehta hai |

**Edge case**: `PUT` me email/phone/pinCode format validate **nahi** hota (register ke uske viपरीत) — jo bhi bhejo save ho jaayega. `user.email` update karne se login-username (`user.username`) change **nahi** hota — matlab profile-email aur login-email alag ho sakte hain.

---

## 6. Wallet

Sabse zyada moving-parts wala section — payment gateway (Razorpay / PayU / PhonePe / direct-UPI) me se jo bhi `active_payment_gateway()` priority order (`phonepe > payu > razorpay > direct_upi`) me sabse pehle **enabled aur fully configured** mile, wahi is-waqt live gateway hota hai. `product_setting.py` me env vars se control hota hai.

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `GET /wallet/config/` | none | Public pricing numbers (signup bonus, credit limit, tool prices) |
| `GET /wallet/` | required | Balance, collection summary, limits, paginated ledger, withdrawal history |
| `POST /wallet/withdraw/` | required | Withdrawal request banata hai + turant ledger debit karta hai |
| `POST /wallet/topup/` | required | Naya top-up row banata hai (current active gateway se scoped) |
| `POST /wallet/topup/{id}/razorpay/order/` | required | Razorpay order create/reuse |
| `POST /wallet/topup/{id}/razorpay/verify/` | required | Signature verify + credit |
| `POST /wallet/topup/{id}/payu/order/` | required | PayU hosted-checkout fields |
| `POST /wallet/topup/{id}/payu/callback/` | **none** (PayU ka redirect target) | Hash verify + credit + 302 redirect |
| `POST /wallet/topup/{id}/phonepe/order/` | required | PhonePe checkout URL |
| `GET /wallet/topup/{id}/phonepe/callback/` | **none** (PhonePe ka redirect target) | Status re-check + credit + 302 redirect |

**Get Wallet query params** (`GET /wallet/`, sab optional): `ledgerPage` (default 1, out-of-range ho to last page pe clamp), `ledgerPageSize` (default 8, **max 50**), `ledgerType=all|withdrawable|tracked` (`withdrawable` = `affects_balance=True`, `tracked` = info-only entries jaise cash-counter collection), `ledgerFrom`/`ledgerTo=YYYY-MM-DD` (invalid date ho to silently ignore ho jaata hai, error nahi deta).

**Edge cases:**
- `withdraw`: amount < Rs.1 → `400`; method `UPI`/`Bank` ke alawa → `400`; `accountDetail` < 3 chars → `400`; UPI method me ID pattern (`name@bank`) match na kare → `400`; amount current withdrawable balance se zyada → `400`. Balance-check + debit ek row-locked transaction ke andar hota hai, taaki 2 parallel withdrawal requests dono ek hi stale balance ke against pass na ho jaayein.
- `create_wallet_topup`: amount < Rs.10 → `400`; koi gateway enabled nahi, ya sirf `direct_upi` enabled hai (jiska yahan koi online flow nahi hai) → `503`.
- Razorpay/PayU/PhonePe order endpoints (topup ho ya order): topup/order na mile ya caller ka na ho → `404`; wrong/inactive gateway → `400`; status already terminal (pending nahi hai) → `400`; upstream API fail → `502`.
- Razorpay verify: HMAC-SHA256 signature match na kare → `400`. Credit function (`credit_wallet_topup`) row-locked hai — verify call aur webhook dono race karein to bhi sirf ek baar credit hota hai (idempotent).
- **PayU/PhonePe callback routes browsers ke redirect targets hain**, direct API clients ke liye nahi — inhe manually call karne ka koi matlab nahi, gateway khud inhe hit karta hai.
- PhonePe ka redirect payload verify nahi kiya ja sakta (koi signature nahi aati) — isliye callback view khud PhonePe ke authenticated Order Status API se dobara status check karta hai, browser jo bhi laaya usko blindly trust nahi karta.

---

## 7. Pricing Settings

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `GET /pricing-settings/` | required | Shop ke saare services ki pricing + Cash Counter availability |
| `PUT /pricing-settings/` | required | Ek service ki settings update (shallow-merge, replace nahi) |

**Edge cases:**
- `serviceKey` `auto_document_print` / `passport_photo` ke alawa → `400`.
- `settings` JSON object nahi hai → `400`.
- `paymentMode: "Both"` save karne ki koshish karo lekin `UserProfile.cash_counter_permitted=False` (platform-level permission) → `403`. **Note**: sirf *permission* yahan check hoti hai — agar permission hai lekin balance abhi low hai, to save phir bhi ho jaayega (live availability alag se `cash_counter_available()` se compute hoti hai order-time pe, taaki temporary low-balance ke liye owner ko baar-baar setting re-save na karni pade).

---

## 8. Owner Orders (authenticated)

| Endpoint | Kya karta hai |
|---|---|
| `GET /orders/` | Latest 100 orders (sab services), media-fields strip kiye hue (payload size) |
| `GET /orders/{id}/` | Ek order ka full detail (media samet) |
| `POST /orders/{id}/mark-paid/` | Unpaid passport-photo order ko manually paid mark karna |
| `POST /orders/{id}/approve-cash/` | Cash-Counter order approve → queue me jaata hai |
| `POST /orders/{id}/reject-cash/` | Cash-Counter order reject → failed |
| `GET /orders/{id}/file/` | Original uploaded document download |

Har route pe ownership check hota hai (`PrintOrder.objects.filter(id=order_id, user=user)`) — order exist na kare ya kisi aur owner ka ho, dono cases me **same `404`** (ownership leak nahi hoti).

**Edge cases:**
- `mark-paid`: order passport_photo na ho, ya `payment_status != 'no_payment'` (already paid ya online-payment order) → `400`.
- `approve-cash`: `payment_status != 'cash_counter'` → `400`; `status != 'awaiting_approval'` (already approved/rejected) → `400`.
- `reject-cash`: `payment_status != 'cash_counter'` → `400`. **Note**: approve ke unlike, iska koi current-status check nahi hai — matlab ek already-printed cash order ko bhi reject kiya ja sakta hai as long as payment_mode cash counter hai.
- `file`: document field khaali hai (passport-photo orders yahan hamesha khaali hote hain — wo base64 use karte hain — ya customer ne already delete kar diya) → `404`.

---

## 9. Public Shop & Orders (anonymous, customer-facing)

Yeh saare **completely unauthenticated** hain — koi bhi jo `shop_code`/`order_id` jaanta hai wo status dekh/poll kar sakta hai (customer-facing storefront polling ke liye design kiya gaya hai, koi secondary secret token nahi hai).

| Endpoint | Kya karta hai |
|---|---|
| `GET /public-shop/{code}/` | Storefront bootstrap: shop profile + pricing + open/closed |
| `POST /public-shop/{code}/orders/` | Naya print/passport order create karta hai |
| `GET /public-orders/{id}/` | Order ka current status |
| `POST /public-orders/{id}/check-upi-payment/` | direct-UPI gateway ke liye poll-based payment check |
| `POST /public-orders/{id}/razorpay/order/` + `/razorpay/verify/` | Razorpay online-payment flow |
| `POST /public-orders/{id}/payu/order/` + `/payu/callback/` | PayU hosted-checkout flow |
| `POST /public-orders/{id}/phonepe/order/` + `GET /phonepe/callback/` | PhonePe checkout flow |
| `POST /webhooks/phonepe/` | PhonePe server-to-server webhook (payment status source-of-truth) |
| `POST /public-orders/{id}/delete-document/` | Customer khud apna document print hone ke baad delete kar sake |

**`Create Public Print Order` ke important behaviours:**
- Server **hamesha khud total recalculate karta hai** (`rate × pages × copies`) — client jo bhi `totalAmount` bheje, mismatch hone par silently override ho jaata hai. Isliye client-side total tamper karke under-pay karna possible nahi hai.
- `paymentMode: "Cash Counter"` chuna hai lekin us waqt available nahi hai (permission ya balance ki wajah se) → `400` with specific reason.
- Service band hai (`isOpen=false`) → `403`.
- **Shop ke apne wallet ka gate bhi yahan check hota hai** — agar cafe khud RepetiGo ka credit-limit paar kar chuka hai, to naya customer order accept hi nahi hoga jab tak wo top-up na kare (`402`). Matlab ek defaulting cafe customers se naye orders le hi nahi sakta.
- passport_photo service ka raw upload file ke bajaye base64 data-URI ke roop me DB row pe store hota hai.

**Edge cases (baaki endpoints):**
- Sabhi routes: `order_id` invalid → `404`.
- `check-upi-payment`: order already paid → seedha `200` short-circuit; order `pending` state me nahi hai (jaise cash-counter/no-payment/already-queued) → `400`; upstream UPI-provider errors bhi `200 pending` ban jaate hain (5xx surface nahi hoti — provider down hone aur "abhi tak paid nahi hua" dono client ko same dikhte hain).
- Razorpay/PayU/PhonePe order endpoints: gateway inactive ya order pe recorded gateway se mismatch → `400`; order already `pending` nahi hai → `400`; upstream error → `502`.
- Razorpay verify: signature invalid → `400`.
- `payu/callback` aur `phonepe/callback`: yeh **browser redirect targets hain**, gateway khud customer ke browser ko yahan bhejta hai — direct API call ke liye nahi bane. Success/failure ke baad `{FRONTEND_URL}/s/{shop_code}?order={id}&payment=success|failure` pe 302 redirect karte hain.
- `delete-document`: order `status != 'printed'` → `400`; already deleted → `200` (error nahi, safe-to-call-twice message).
- **PhonePe Webhook**: static shared-secret auth — `Authorization` header ko `sha256(f"{webhook_username}:{webhook_password}")` se match hona chahiye (dono PhonePe dashboard aur env vars me set karne padte hain). Yeh **sabse reliable payment-confirmation path** hai kyunki customer ka browser callback tak pahunche ya na pahunche, webhook independently aata hai. `merchantOrderId` ko **PrintOrder aur WalletTopup dono** me dhoondta hai (prefix `cm...` vs `wt...` se pehchaan, `payment_gateway='phonepe'` scoped) — jo match kare use credit karta hai. Config missing → `503`; auth galat → `401`; koi match na mile → phir bhi `200 "ok"` (PhonePe ke retries रोकने ke liye hamesha ack karta hai, chahe kuch match na hua ho).

> **⚠️ Dead code note**: `views.py` me ek `public_mark_order_paid` function bhi maujood hai (line ~2622) jo koi bhi order ko turant `paid`+`queued` mark kar deta hai — **koi validation ke bina**. Lekin `urls.py` me yeh **kisi bhi route se wire nahi hai**, isliye is-waqt unreachable/dead code hai. Postman collection me isse jaan-boojh kar shaamil nahi kiya gaya hai. Agar future me kabhi accidentally isse route kar diya gaya, to yeh ek serious payment-bypass bug banega (koi bhi order ko "already paid" bana sakta hai bina actually pay kiye) — cleanup ya explicit-remove karne layak hai.

---

## 10. Passport Photo (authenticated wizard flow)

Yeh flow customer ke AI-generated passport photo ka **cafe-owner-driven** wizard hai (customer khud nahi, cafe dashboard se karta hai).

| Endpoint | Kya karta hai |
|---|---|
| `POST /save-raw-passport-photo/` | Raw photo + AI prompt upload karke ek order create karta hai (queue me jaata hai) |
| `POST /api-passport-photo-check/` | AI-generated final photo ke liye poll karta hai |

**Edge cases:**
- `save-raw-passport-photo`: `photo` file missing → `400`; `prompt` khaali → `400`; wallet gate fail (shop credit-limit se neeche) → `402` — job **shuru hi nahi hone diya jaata**.
- `check-passport-photo`: **⚠️ yeh call up to ~25 seconds tak block ho sakti hai** (server-side long-polling: 5 retries, har baar 5s sleep) — client-side HTTP timeout kam-se-kam 30s rakhna. `id` invalid/missing → `400`; order na mile/na apna ho/passport-type na ho → `404`; agar job 60 second se zyada `pending`/`claimed` state me stuck hai to mid-poll automatically `failed` mark ho jaata hai ("agent did not respond in time"); saare retries ke baad bhi ready nahi hua → `404`; agent ka raw error text (HTML/.NET stack trace ho sakta hai) kabhi bhi seedha client ko nahi dikhaya jaata — `friendly_photo_error_message()` se sanitize hokar generic fallback message jaata hai.

---

## 11. Agent Passport Jobs (desktop Print Agent — AI photo queue)

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `GET /agent/passport-jobs/` | required | Pending jobs list (max 20, oldest-first) |
| `POST /agent/passport-jobs/{job_id}/claim/` | required | Job atomically claim karta hai (row-locked) |
| `POST /agent/passport-jobs/{job_id}/complete/` | required | Final image upload ya failure report |
| `GET /agent/passport-jobs/{job_id}/original-image/` | **none** | Raw uploaded photo binary serve karta hai |

**Edge cases:**
- `claim`: job na mile/na apna ho → `404`; job pehle se `pending` state me nahi hai (already claimed/done/failed) → `409` Conflict.
- `complete`: `status=failed` bheja to `message` record hota hai, `final_image` zaroori nahi; warna `final_image` file zaroori hai (`400` agar missing) — success par turant `passport_photo` tool ke liye wallet charge hota hai. Iska koi "must be claimed first" check nahi hai — kisi bhi state se seedha complete kiya ja sakta hai.
- **`original-image` — ⚠️ SECURITY GAP**: yeh ek-akela `/agent/` endpoint hai jispe **koi auth check hi nahi hai** — sirf `job_id` se lookup hota hai. Matlab agar `job_id` guessable/sequential hai, to koi bhi kisi bhi customer ka raw uploaded photo download kar sakta hai bina login kiye. Team ko flag karne layak potential information-disclosure gap.

---

## 12. Agent (desktop Print Agent — print queue)

| Endpoint | Auth | Kya karta hai |
|---|---|---|
| `GET /agent/jobs/` | required | Queued/awaiting-approval print jobs (passport_photo exclude) |
| `POST /agent/jobs/{order_id}/status/` | required | Print status update: `printing` \| `printed` \| `failed` |
| `POST /agent/jobs/{order_id}/gemini-photo/` | required | Kisi bhi order pe AI-generated photo attach karna |

**Edge cases:**
- `status`: invalid status value (in teeno ke alawa) → `400`; order na mile/na apna → `404`.
- **`status=printed` hi wo point hai jahan wallet settle hota hai** (`settle_printed_order_wallet`): online-paid orders ka amount cafe ke wallet me credit hota hai, cash-counter orders ka ek info-only (balance-unaffecting) collection-entry log hota hai, aur isi call me RepetiGo ka apna per-page/per-photo usage-fee bhi deduct hota hai.
  - **⚠️ Double-settlement risk**: yeh settlement sirf `order.status == 'printed'` check karta hai, koi separate "already settled" flag nahi hai. Agar Agent kisi slow-response ki wajah se `printed` status **do baar** bhej de (retry), to settlement bhi do baar chal jaata hai — double wallet credit + double platform-fee deduction ho sakta hai. Isko idempotency-guard ki zaroorat hai (jaise ek `settled_at` timestamp field).
- `gemini-photo`: `photo` file missing → `400`.

---

## 13. Agent Update & Installer (anonymous)

Desktop "PrintPilot Agent" ka self-update aur pehli-baar-install mechanism — dono anonymous hain kyunki agent login se pehle bhi in tak pahunch sakta hai.

| Endpoint | Kya karta hai |
|---|---|
| `GET /agent/version-check/` | `media/agent/version.txt` ka content plain text me deta hai |
| `GET /agent/update/` | `media/agent/PrintPilot-latest.zip` download karta hai |
| `GET /agent/installer/` | `media/installer/RepetigoInstaller.exe` download karta hai (Setup page ka "Download Agent" button) |

**Naya version ship karna**: bas `version.txt` bump karo aur naya zip usi folder me daal do — koi code deploy nahi chahiye. **Edge case**: file/zip/exe disk pe na ho → `version-check` khaali string return karta hai (404 nahi), lekin `update`/`installer` download `404` dete hain.

---

## 14. Google Places & Google Place Details (internal lead-scraping CRM)

⚠️ **Yeh poora section (Google Places, Google Place Details, Lead Activities) completely unauthenticated hai** — koi bhi GET/POST/PUT/DELETE kar sakta hai. Yeh RepetiGo team ke apne internal sales/outreach tool ke liye hai (cafes/customers ke liye nahi), lekin agar yeh routes public internet pe expose hain to koi bhi is CRM data ko padh/badal/delete kar sakta hai. Firewall/internal-network-only access ya kam-se-kam ek shared secret header add karna consider karo.

### Google Places (`GooglePlace` — scraped Maps links, extraction-tracking ke liye)

| Endpoint | Kya karta hai |
|---|---|
| `GET /google-places/?extracted_status=all\|true\|false` | List, filter optional |
| `POST /google-places/` | Single object **ya JSON array (batch)** — create |
| `PUT`/`PATCH /google-places/{id}/` | **Sirf** `extracted_status=True` mark karta hai (body ignore hoti hai) |
| `DELETE /google-places/{id}/` | Hard delete |

- Create: `link`/`name` blank → skip; `name` (globally unique) already exist ya batch ke andar hi duplicate → skip. Single-object mode me skip → `400`/`409`, batch mode me hamesha `{created, skipped}` array (kam-se-kam 1 create hua to `201`, warna `400`).
- List: `extracted_status` invalid value → `400`.

### Google Place Details (`GooglePlaceDetail` — full scraped record + sales pipeline)

| Endpoint | Kya karta hai |
|---|---|
| `GET /google-place-details/?name=&status=&follow_up=` | List + filter (name = contains search) |
| `POST /google-place-details/` | Single **ya batch array** — create |
| `GET /google-place-details/{id}/` | Single record |
| `PUT`/`PATCH /google-place-details/{id}/` | Partial update (PUT bhi partial hai, full-replace nahi) |
| `DELETE /google-place-details/{id}/` | Hard delete (cascades activities bhi) |
| `GET /google-place-details/{id}/activities/` | Timeline (status-changes + notes) |
| `POST /google-place-details/{id}/activities/` | Manual note add |

- `status` values: `new, follow_up, discussion, interested, call_discussed, converted, not_interested`. Create-time invalid/missing status → silently `new` (reject nahi hota); update-time invalid status → `400` (yahan reject hota hai — create aur update ka behaviour alag hai, dhyaan rakhna).
- `follow_up` filter: `overdue | today | upcoming | none | all` — invalid value → `400`.
- `maps_url` globally unique hai (dedupe key) — create ya update me duplicate → `409`.
- Update: `status` change karne par automatically ek `LeadActivity(kind=status_change)` timeline-entry ban jaati hai — is route se direct status-change activity manually nahi daal sakte, sirf `note` kind ka activity `POST .../activities/` se add hota hai.
- `latitude`/`longitude`/`rating`/`reviews` jaise numeric fields agar parse na ho paayein to reject nahi hote, chup-chaap `null` save ho jaate hain.

---

## 15. Known Gaps / Follow-ups (is documentation pass me mile)

In sabko main cross-check ke dauraan flag kiya, team ke saath review karne layak:

1. **`POST /auth/delete-account/` — no auth, no password.** Sirf email jaan kar poora account delete ho sakta hai. (Section 4)
2. **`GET /agent/passport-jobs/{job_id}/original-image/` — no auth.** Customer ka raw photo kisi bhi guessable job_id se download ho sakta hai. (Section 11)
3. **`agent_job_status(status='printed')` me double-settlement risk** — retry se wallet credit/debit do baar chal sakta hai, koi idempotency-guard nahi. (Section 12)
4. **`public_mark_order_paid` dead code** — `views.py` me function hai jo bina validation order ko "paid" bana deta hai, lekin `urls.py` me route nahi hai (abhi unreachable). Accidentally future me route ho gaya to payment-bypass bug banega. (Section 9)
5. **Google Places / Google Place Details / Lead Activities — poora CRM section unauthenticated.** (Section 14)
6. **`check-upi-payment` upstream errors `pending` bankar chhup jaate hain** — provider down hone aur payment abhi pending hone me client-side koi fark nahi dikhta. (Section 9)
7. **Contact-us messages kahin email nahi hoti**, sirf DB me save hoti hain, dekhne ke liye Django admin registration bhi abhi nahi hai (`ADMIN_FEATURES.md` me already tracked).

---

## 16. Postman Collection

`cafemitra_server/postman_collection.json` me sabhi 76 requests (14 folders, System se leke Google Place Details tak) is doc ke exact structure me hain. Import karne ke baad:

1. `base_url` variable apne local server (default `http://127.0.0.1:8000`) ya deployed URL se set karo.
2. **Register User → Verify Email (console/email se `verification_token` copy karo) → Login User** chalao — `token`, `refresh_token`, `shop_code` collection variables auto-set ho jaate hain (test scripts already lagi hain).
3. `document_path` / `image_path` variables apne local file paths se set karo file-upload requests ke liye.
4. Payment-gateway order/verify requests ke liye `.env` me kam-se-kam ek gateway (Razorpay/PayU/PhonePe) enable + configure hona chahiye (`cafemitra_server/product_setting.py`), warna wo `400`/`503` denge.
