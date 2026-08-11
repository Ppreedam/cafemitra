# RepetiGo Admin Dashboard — Implementation Plan

Yeh doc RepetiGo team ke naye **platform-wide super-admin dashboard** ka phase-wise implementation plan hai. Yeh cafe-owner ke apne dashboard (`cafemitra_client/app/dashboard`) aur sales-CRM (`cafemitra_leads`) se **alag** hai — is dashboard se RepetiGo team poora platform (sab shops, orders, wallet, referral-agents, leads, support) ek jagah se manage karegi.

Reference: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) (existing APIs), `cafemitra_server/api/models.py` (DB shape), `cafemitra_server/api/admin.py` (abhi ka bare Django admin).

**Naming note**: is doc me "Agent" do alag cheezon ke liye use hota hai — **Referral Agent** (Phase 6 — cybercafe/partner jo RepetiGo refer karta hai, commission-earner) vs **Desktop Print Agent** (Phase 9 — vahi purana "PrintPilot Agent" software jo shop pe print-jobs process karta hai). Jahan bhi ambiguity ho sakti hai wahan poora naam likha hai.

---

## 0. Architecture Decision

- **Naya Next.js app**: `cafemitra_admin` (root me `cafemitra_client`/`cafemitra_leads` ki tarah sibling folder) — cafe-owner-facing aur internal-tool codebases ko mix nahi karna.
- **Backend**: alag Django app **nahi** — existing `cafemitra_server/api` app me hi rahenge. Naye files: `api/admin_views.py` (saari admin-dashboard views), `api/admin_auth.py` (`require_admin()` helper). Routes `api/urls.py` me hi `admin/` prefix ke saath add honge (`path("admin/", include([...]))`), taaki final URL `/api/admin/...` bane. Models (`api.models`) same hi reuse honge, koi naya app/migration-namespace nahi.
- **Auth**: existing `AuthToken` mechanism reuse, lekin ek naya `is_platform_admin` flag (`User.is_staff` ya naya `AdminRole` model) — sirf yeh flag waale users `/api/admin/...` routes hit kar sakein. Har admin view `require_admin(request)` helper se gate hogi (`auth_user()` + role check), same pattern jo existing `api/views.py` me auth ke liye already use hota hai.
- **Internal admin-access roles (v1 simple, v2 granular)**: v1 me bas `is_staff=True` = full access. v2 me `AdminRole` (super_admin / finance / support / sales) add karenge. Yeh roles sirf RepetiGo team ke apne staff ke liye hain — **dashboard access control**.
- **Referral Agent — business-entity, admin-role nahi**: cybercafe/partner jo naye shops RepetiGo pe refer karte hain aur commission kamaate hain, wo `is_staff`/`AdminRole` waale "roles" se **alag concept** hai — wo dashboard access nahi le rahe, balki dashboard **unko manage** karega (jaise shops ko manage karta hai). Ise abhi hi (Phase 1 ke schema-stage pe) plan me shaamil kar rahe hain taaki baad me `ShopProfile`/registration-flow me backfill-migration na karni pade — detail Phase 6 me.

---

## Phase 1 — Foundation: Admin Auth & Shell + Referral Schema Hooks

**Goal**: Admin login kaam kare, empty dashboard shell load ho, koi bhi non-admin andar na aa sake. Saath hi referral-agent ke liye zaroori schema-fields abhi hi add kar dena (feature abhi live nahi hoga, lekin field-level rework Phase 6 me nahi karna padega).

- **API**:
  - `User` model pe `is_staff`/role check karta ek `require_admin()` helper (`api/admin_auth.py`)
  - `POST /api/admin/auth/login/` (existing `/auth/login/` hi reuse — bas login response me `isAdmin` flag add karo taaki frontend redirect decide kar sake)
  - `GET /api/admin/me/` — logged-in admin ka profile + role return kare
  - **Migration (early, low-risk)**: `ShopProfile` pe nullable `referred_by_agent_id` FK add karo abhi (Phase 6 tak feature dormant rahega, lekin field/migration ab se hi maujood hoga — existing rows ke liye `null`, koi backfill zaroori nahi kyunki historical shops ke paas referral-agent tha hi nahi)
- **UI**:
  - `cafemitra_admin` app scaffold (Next.js, same UI-kit/Tailwind config jo `cafemitra_client` me hai — consistency ke liye copy karo)
  - Login page, protected-route wrapper (token na ho ya `isAdmin=false` ho to login pe redirect)
  - Sidebar shell + empty dashboard layout (baaki saare phases isi shell ke andar screens add karenge) — sidebar structure abhi hi "Shops / Orders / Wallet / Agents / Support / Leads / Print Agent / Security" jaisa plan kar lo taaki Phase 6 me naya top-level nav-item add karna sirf ek entry ho, restructure na ho
- **Integration**: Login → token store → protected route round-trip test. Non-admin user login karke try kare → blocked hona chahiye.

---

## Phase 2 — Overview / Home KPIs

**Goal**: Landing page pe platform-wide health ek nazar me dikhe.

- **API**: `GET /api/admin/overview/` — ek aggregated endpoint jo return kare:
  - total shops (active/inactive), naye signups (today/week/month)
  - orders today/week (service-wise split), stuck-order counts
  - total wallet balance across shops, top-ups today, pending withdrawals count
  - active payment gateway (`active_payment_gateway()` jo pehle se hai use karo)
  - unread contact-us messages count
  - (Phase 6 ke baad) referral-agent count + is-week ka total commission payout — abhi placeholder tile, data Phase 6 me live hoga
- **UI**: Stat-tile grid (dataviz skill follow karo colors/layout ke liye), recent-activity feed (latest orders/topups/withdrawals mixed timeline)
- **Integration**: Real data ke against numbers verify (seed/staging DB pe manually cross-check karo ki counts sahi hain)

---

## Phase 3 — Shops / Cafe Owners

**Goal**: Sab shops ki list + detail + edit-controls.

- **API**:
  - `GET /api/admin/shops/?search=&balanceFilter=&cashCounter=&status=` — paginated list (`UserProfile` + `ShopProfile` join) — list response me `referred_by_agent` bhi include karo (Phase 1 me field add ho chuka hai, ab bas surface karna hai)
  - `GET /api/admin/shops/{id}/` — full detail (profile + pricing + recent orders + wallet summary, ek jagah)
  - `PUT /api/admin/shops/{id}/` — `credit_limit_override`, `cash_counter_permitted` edit
  - `POST /api/admin/shops/{id}/adjust-balance/` — manual wallet adjustment, **mandatory reason field**, `WalletTransaction` row banaye (audit trail)
  - `POST /api/admin/shops/{id}/suspend/` — deactivate (delete se safer)
- **UI**:
  - Shops list table: name, owner, balance (red highlight if negative), credit-limit, cash-counter toggle, signup date, referred-by (agent badge, agar hai to)
  - Shop detail page: tabs — Profile | Orders | Wallet Ledger | Pricing
  - Manual-adjustment modal (amount + reason, confirm dialog since it's money-affecting)
- **Integration**: Balance-adjust action se `WalletTransaction` + shop ka live balance dono update ho rahe hain, verify karo. Suspend ke baad us shop ka public storefront `isOpen=false` jaisa behave kare.

---

## Phase 4 — Orders Monitoring (platform-wide)

**Goal**: Sab shops ke `PrintOrder` ek jagah, filter/search ke saath, stuck-order alerts.

- **API**:
  - `GET /api/admin/orders/?shop=&service=&paymentMode=&status=&from=&to=` — paginated, filtered list (existing `/orders/` sirf apne-shop ka hai, yeh sab-shops ka hai)
  - `GET /api/admin/orders/{id}/` — full detail (existing owner-order-detail logic reuse, bas ownership-check hatao, admin-check lagao)
  - `GET /api/admin/orders/stuck/` — `awaiting_approval` 30min+, passport jobs `pending`/`claimed` 60s+ — proactive alert list
- **UI**:
  - Orders table with filters (shop, service, status, date range)
  - Order detail drawer/page — full trail timeline (created → paid → queued → printed → wallet-settled)
  - "Stuck Orders" alert widget on Overview (Phase 2) linking here
- **Integration**: Filter combos test karo (empty states, date-range edge cases jaisa existing `/wallet/` ledger filters silently-ignore-invalid-date behavior hai, wahi pattern follow karo consistency ke liye)

---

## Phase 5 — Wallet & Finance

**Goal**: Platform ka sabse critical financial control panel — sabse zyada care se banana hai. **Yeh phase Phase 6 (Referral Agent commission) ka foundation hai**, isliye withdrawal/ledger design abhi hi generic rakho (sirf "shop" ke liye hardcoded nahi — "wallet-holder" concept, chahe wo shop ho ya agent).

- **API**:
  - `GET /api/admin/wallet/ledger/?shop=&type=&from=&to=` — platform-wide `WalletTransaction` feed
  - `GET /api/admin/wallet/topups/?gateway=&status=` — gateway-wise top-up list + success/fail rate
  - `GET /api/admin/withdrawals/?status=` — pending withdrawal queue (**generic query jo `user`-based hai, shop-specific nahi** — isi endpoint ko Phase 6 me referral-agent payouts ke liye bhi reuse karenge, koi naya endpoint nahi banana padega)
  - `POST /api/admin/withdrawals/{id}/approve/` / `/reject/` — row-locked transaction (existing withdraw-debit pattern jaisa), status change pe audit log entry
  - `GET /api/admin/wallet-settings/` + `PUT` — `WalletSetting` global config (signup bonus, credit limit, grace limit)
  - `GET /api/admin/tool-pricing/` + `PUT` — `ToolPricing` edit (price, price_b2b, price_b2c, is_billable)
- **UI**:
  - Withdrawal queue (approve/reject buttons, confirm dialog, reason-on-reject)
  - Ledger explorer (filterable table, export-to-CSV agar time mile)
  - Wallet-settings form + Tool-pricing editable table
  - Defaulters list (negative-balance shops) — links back to Phase-3 shop detail
- **Integration**: **Sabse zyada test karne wali cheez** — approve/reject race conditions (2 admins ek hi withdrawal simultaneously na process kar dein), balance-adjust ke baad ledger consistent rahe. Staging pe dummy withdrawal end-to-end chalao.

---

## Phase 6 — Referral Agent / Partner Program

**Goal**: Cybercafes/partners jo RepetiGo refer karte hain unko "Agent" mark karna, unka apna referral-code, referred-shops tracking, commission-earning aur special-offers — sab admin-dashboard se manage ho.

- **Data model** (naya, `api/models.py` me):
  - `Agent` — `user` (FK, existing `User`/shop bhi ho sakta hai ya naya standalone partner), `referral_code` (unique, auto-generated), `commission_type` (`percentage`/`fixed`), `commission_rate`, `status` (`pending`/`active`/`suspended`), `special_offer_note` (free-text ya structured discount config), `created_at`
  - `ShopProfile.referred_by_agent` — Phase 1 me hi field add ho chuka hai, ab wire karna hai
  - Commission-ledger ke liye **naya model nahi** — existing `WalletTransaction` reuse karo, bas `kind='referral_commission'` ek naya choice add karo (agent ka apna `UserProfile.balance` hi commission-wallet ban jaata hai — isliye withdrawal bhi Phase-5 ka existing flow reuse hota hai, alag payout-system nahi banana)
- **API**:
  - `GET /api/admin/agents/?status=` — agents list (referral-code, referred-shops count, total-commission-earned, current balance)
  - `POST /api/admin/agents/` — naya agent onboard (existing `User` se link, ya naya invite)
  - `PUT /api/admin/agents/{id}/` — commission-rate/type edit, status (approve/suspend), special-offer config
  - `GET /api/admin/agents/{id}/` — detail: referred-shops list + commission ledger (Phase-5 ka `WalletTransaction` filter reuse)
  - **Registration hook**: existing `POST /auth/register/` me optional `referralCode` param add karo — valid code mile to `ShopProfile.referred_by_agent` set ho aur agent ko signup-bonus-jaisa ek-baar commission credit ho
  - **Commission-accrual hook**: existing `agent_job_status(status='printed')` → `settle_printed_order_wallet` ke andar hi (jahan RepetiGo apna platform-fee deduct karta hai) — agar order ke shop ka `referred_by_agent` set hai, to us fee ka ek % agent ke wallet me `referral_commission` transaction ke roop me credit karo. Isse naya settlement-hook nahi banana padta, existing point pe hi ek branch add hoti hai
  - **Special-offer application**: referred-shop ke liye signup-bonus ya tool-pricing discount — `WalletSetting`/`ToolPricing` ke existing config-driven pattern follow karo (per-agent override table, hardcode nahi)
- **UI**:
  - Agents list: referral-code, status, referred-shops count, total-commission, current-balance
  - Agent detail: referred-shops table (link to Phase-3 shop detail), commission ledger (Phase-5 ledger-component reuse), commission-rate edit, special-offer config form
  - Agent onboarding form (approve pending applications)
  - Payout: Phase-5 ka Withdrawal-queue UI hi reuse (agent bhi ek wallet-holder hai, alag screen nahi)
- **Integration**: End-to-end test — naya shop referral-code ke saath register kare → `referred_by_agent` set ho → us shop ka ek order printed ho → agent ke wallet me commission credit ho → agent withdrawal request kare → admin approve kare (Phase-5 flow). Race-condition check: ek hi order ka commission do baar credit na ho (Section 12 ke existing double-settlement gap se hi juda hua risk hai — isi ke saath fix karna).

---

## Phase 7 — Support Inbox (Contact-Us)

**Goal**: `ContactMessage` abhi sirf raw DB me padi hai (koi email nahi jaata — known gap) — dashboard se dekhna/manage karna.

- **API**:
  - `GET /api/admin/contact-messages/?status=unread|resolved` — list
  - `PUT /api/admin/contact-messages/{id}/` — resolved mark karna, internal note add karna
- **UI**: Inbox-style list, detail panel, resolved-toggle
- **Integration**: Overview (Phase 2) ka "unread count" tile isi API se live-link hona chahiye

---

## Phase 8 — Leads CRM Security + Embed

**Goal**: `cafemitra_leads` backend abhi **completely unauthenticated** hai (`GooglePlace`, `GooglePlaceDetail`, `LeadActivity` routes) — pehle isko secure karna, phir admin-dashboard se link/embed karna.

- **API**:
  - Existing `/google-places/`, `/google-place-details/`, activities routes ko `require_admin()` ke peeche laana (ya minimum ek shared-secret header, agar `cafemitra_leads` alag deploy hai jise turant refactor nahi kar sakte)
  - `cafemitra_leads` frontend ko bhi same admin-auth-token use karne ke liye update karna
- **UI**: Ya to `cafemitra_admin` sidebar se `cafemitra_leads` app ko iframe/link karo, ya lambi-term me leads-CRM ko `cafemitra_admin` ke andar hi ek section bana do (recommend: link rakho abhi, merge baad me)
- **Integration**: Auth-gate lagaane ke baad `cafemitra_leads` ka existing flow (scraping script jo bhi data push karta hai) bhi naye auth ke saath test karo — wo script bhi token bhejna seekhe

---

## Phase 9 — Desktop Print Agent Monitoring

**Goal**: Desktop "PrintPilot" Print Agent software ka version/health visibility (yeh Phase 6 ke Referral Agent se **alag cheez hai** — software hai, partner nahi).

- **API**:
  - `GET /api/admin/print-agent/stats/` — version distribution, download count, last-seen per shop (**naya**: agent ko har job-poll pe `last_seen_at` update karna hoga — `agent/jobs/` view me ek chhota addition)
  - Failed-job rate (existing `PrintOrder.status=failed` se hi derive)
- **UI**: Agent-version table (shop-wise), failed-print-job list
- **Integration**: `last_seen_at` field migration + Desktop-app-side (`Print Agent/` folder) ka koi change chahiye ho to uska scope confirm karo

---

## Phase 10 — Security Fixes & Audit Alerts

**Goal**: `API_DOCUMENTATION.md` Section 15 ke known gaps ko dashboard-visible banana (jab tak root-fix na ho).

- **API**:
  - `delete-account` ke liye — kam-se-kam ek `AccountDeletionLog` model + admin-visible list (root-fix: is endpoint pe auth+password required karna, alag security ticket)
  - `agent/passport-jobs/{id}/original-image/` — auth add karna (root-fix, dashboard-dependent nahi)
  - `status=printed` double-settlement — `PrintOrder` pe `settled_at` field add karke idempotency-guard (**Phase 6 ka commission-accrual bhi isi guard pe depend karta hai**, isliye yeh fix Phase 6 se pehle ya saath-saath priority pe le lo)
  - `public_mark_order_paid` dead code — remove karna
- **UI**: "Security Alerts" widget on Overview — in gaps ka status (fixed/pending) track kare
- **Integration**: Yeh phase backend-heavy hai — dashboard UI kam, actual bug-fixes zyada. Regression-test karo ki fix ke baad normal flows (delete-account legit use, printed-status settlement, referral-commission accrual) tootein na.

---

## Phase 11 — Polish, Internal Roles, Reporting

**Goal**: v1 se v2 — granular **internal admin-access** roles (Referral Agent se confuse mat karo — yeh sirf RepetiGo staff ke liye hai) + reporting.

- **API**: `AdminRole` model (super_admin/finance/support/sales), per-role route-gating; CSV/PDF export endpoints for ledger & orders (agent-commission report bhi isi export me shaamil karo)
- **UI**: Role-based sidebar (finance role sirf Wallet+Agents dekhe, support role sirf Contact-messages+Orders dekhe), export buttons, date-range reports
- **Integration**: Role-matrix test — har role sirf apni cheez dekh/edit kar paaye, baaki 403

---

## Suggested Order & Dependencies

```
Phase 1 (Foundation + referral schema hooks)
   └─▶ Phase 2 (Overview) ─┬─▶ Phase 3 (Shops)
                            ├─▶ Phase 4 (Orders)
                            ├─▶ Phase 5 (Wallet) ──┬─▶ Phase 6 (Referral Agent Program)
                            │                       │   (depends on Phase 3 shops + Phase 5 wallet/withdrawal reuse)
                            └─▶ Phase 7 (Support)
Phase 8 (Leads CRM security) — independent, parallel-able
Phase 9 (Desktop Print Agent monitoring) — independent, parallel-able
Phase 10 (Security fixes) — parallel-able, prioritize gaps #1/#2/#3 early (real risk);
                             double-settlement fix (#3) prioritize before/with Phase 6
Phase 11 (Internal roles/Reporting) — last, after core modules stable
```

Phase 1–2 sequentially karo (foundation zaroori hai — isi me referral-agent ke schema-hooks bhi daal do taaki baad me rework na ho). Uske baad Phase 3–5, 7 largely parallel ho sakte hain. **Phase 6 (Referral Agent) Phase 3 aur Phase 5 dono complete hone ke baad start karo** — kyunki wo shops-list aur wallet/withdrawal dono reuse karta hai. Phase 8–9 independent hain, kabhi bhi le sakte ho. Phase 10 ke security items (khaaskar delete-account, original-image auth gaps, aur double-settlement) jaldi nikaal do — double-settlement fix Phase 6 ke commission-accrual ki correctness ke liye bhi zaroori hai.

---

## V2 — Post-launch Enhancements (Implemented)

Phase 1–11 (v1) complete hone ke baad, in-dashboard-use se nikle ideas ka ek round — sab implemented aur end-to-end verified. Naming: "V2-A" se "V2-G" tak, koi strict order-dependency nahi thi, isliye alphabetic hi hain.

| # | Feature | Kya banaya | Key files |
|---|---|---|---|
| V2-A | Notification badges | Sidebar me har section ke liye live count-badge (pending withdrawals, unread messages, pending agents) — `GET /api/admin/notifications/` ko har 30s poll karta hai | `admin_views.admin_notifications`, `components/Sidebar.tsx` |
| V2-B | Signup/growth analytics | Naya `/analytics` page — date-range + granularity (day/week/month) signups-over-time bar chart (dataviz-skill compliant SVG), aur referral-agent-wise signup breakdown | `admin_views.admin_signup_analytics`, `app/analytics/page.tsx`, `components/SignupBarChart.tsx` |
| V2-C | Admin activity log | Naya `AdminActivityLog` model — har mutating admin-action (balance-adjust, suspend, withdrawal approve/reject, agent onboard/edit, contact-message resolve, wallet-setting/tool-pricing edit, bulk actions, role-changes) audit-logged with admin's email + detail | `models.AdminActivityLog`, `admin_activity.log_admin_activity`, `app/activity-log/page.tsx` |
| V2-D | Password reset + impersonate | Admin ek shop ke liye standard password-reset-email trigger kar sakta hai; **"Impersonate"** button ek fresh token issue karke `cafemitra_client` ko naye tab me shop ke apne dashboard pe le jaata hai (hash-fragment se token pass hota hai, URL se turant clear ho jaata hai) — dono actions **hamesha** activity-log me jaate hain | `admin_views.admin_shop_send_password_reset`, `admin_shop_impersonate`, `cafemitra_client/app/impersonate/page.tsx` |
| V2-E | Bulk shop actions | Shops list me checkboxes + "Suspend selected"/"Reactivate selected" — ek hi call me multiple shops | `admin_views.admin_shops_bulk_set_active`, `app/shops/page.tsx` |
| V2-F | Shop activity timeline | Shop-detail page me naya **Timeline** tab — orders + wallet-transactions + us-shop-targeting-wale admin-activity-log entries (bulk-action logs bhi, comma-separated target_id regex-match se) ek hi chronological feed me | `app/shops/[id]/page.tsx` (Timeline tab), `admin_activity_log`'s `targetId` filter |
| V2-G | Granular roles | Naya `AdminRole` model (`super_admin` / `finance` / `support` / `sales`) — **backward-compatible**: koi role-row na ho to `super_admin` (full access) default hai, taaki existing staff accounts lock-out na hon. `require_section(request, "section")` har admin-endpoint-group ko role ke against gate karta hai; sidebar bhi role ke hisaab se sections hide karta hai (UX-only, real enforcement backend pe hai) | `models.AdminRole`, `admin_auth.require_section` + `SECTION_ROLES`, `admin_views.admin_staff` / `admin_staff_set_role`, `app/staff/page.tsx` |

**Role → section matrix** (V2-G, `admin_auth.SECTION_ROLES`):

| Section | Allowed roles (super_admin always) |
|---|---|
| Shops | finance, support |
| Orders | support |
| Wallet & Finance | finance |
| Referral Agents | finance, sales |
| Support Inbox | support |
| Leads CRM | sales (⚠️ **sidebar-only** — `cafemitra_leads` ka backend abhi bhi sirf "is-staff" check karta hai, role-specific nahi, since it's a separate app; koi security-regression nahi hai, pehle se hi is_staff-gated tha, bas utna hi granular nahi jitna baaki sections) |
| Print Agent monitoring | support |
| Analytics | finance, sales |
| Activity Log | super_admin only |
| Security Alerts | super_admin only (frontend-only page, koi backend endpoint nahi) |
| Staff & Roles | super_admin only |
| Overview / Notifications | sab roles |

**Known trade-offs / follow-ups** (agar future me revisit karna ho):
- Impersonate token URL hash-fragment se pass hota hai (browser history me thodi der reh sakta hai, access-token expiry 1hr per existing convention) — production-grade version isse ek short-lived one-time-use server-side code se replace kar sakta hai.
- `leads` section sirf UI-level filter hai, backend-level nahi (upar note kiya).
- CSV export cap 5000 rows hai (Phase 11 se carried forward).
