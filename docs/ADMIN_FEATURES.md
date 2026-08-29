# Admin (Platform Owner) Features — Tracker

Yeh file un sabhi controls ko track karti hai jo **RepetiGo platform owner** (aap, Django admin `/admin/` panel se) cafes/shops par exercise kar sakte hain — kya already ban chuka hai, kya database me hai lekin admin se access nahi hai, aur kya future me banana chahiye. Naye admin-facing feature ka idea aaye to yahin add karte jaana.

---

## 1. Already Live — Django Admin Panel (`/admin/`)

### Wallet & Money Controls (`WalletSetting`)
Global numbers jo har cafe pe apply hote hain, `is_active` toggle ke saath:
- `signup_bonus` — naye cafe ko signup pe kitna credit milta hai.
- `referral_bonus` — referral program (abhi `is_active=False` by default).
- `credit_limit` — global negative-balance floor (default `-50`) jispe paid tools block ho jaate hain.
- `daily_grace_limit` — jab balance already negative ho, to per-day free-usage cap.
- `collection_commission_rate` — DB me row abhi bhi hai lekin **ab code me kahin use nahi hoti** (commission hata diya gaya — dead setting, chaho to hata sakte ho).

### Per-Cafe Overrides (`UserProfile`)
- `credit_limit_override` — kisi specific cafe ke liye global `credit_limit` ke bajaye custom negative-limit set karna (trusted cafe ko zyada grace, risky cafe ko kam).
- `cash_counter_permitted` — kya yeh cafe apne customers ko "Online Payment + Cash Counter" offer kar sakta hai (default ON, admin har cafe ke liye individually OFF kar sakta hai).
- `balance` — cafe ka current wallet balance dikhta hai (read/edit dono, but manual balance edit se koi `WalletTransaction` audit-trail nahi banti — emergency-only use karo, normally topup/tool-charge flow se hi balance badalna chahiye).

### Tool Pricing (`ToolPricing`)
- `price` — RepetiGo ka per-use charge har tool ke liye (print page, passport photo, etc.).
- `price_b2b` / `price_b2c` — optional alag rate jab cafe khud tool use kare (B2B) vs customer ke order se trigger ho (B2C); null ho to shared `price` fallback.
- `is_billable` — tool free hai ya charge lagta hai (flip karke bina deploy ke monetize/free kar sakte ho).

### Withdrawals (`WithdrawalRequest`)
- `status` (pending → paid/rejected) — cafe ke payout requests approve/reject karna.

### Wallet Top-ups (`WalletTopup`) — read-only monitoring
- Har gateway-backed top-up ka record: amount, gateway, status, gateway order/payment IDs. Admin se directly edit nahi karte (payment gateway hi status manage karta hai), sirf audit/debug ke liye.

### Wallet Ledger (`WalletTransaction`) — read-only audit
- Har wallet-affecting event ka permanent record: kind, direction, amount, `balance_after`, note. Kisi bhi dispute/confusion ko trace karne ke liye source-of-truth.

### Leads / CRM (`GooglePlace`, `GooglePlaceDetail`, `LeadActivity`)
- Scraped Google Maps leads ka pipeline (new → follow-up → discussion → interested → converted), notes aur status-change timeline ke saath. Yeh cafemitra ke apne sales/outreach ke liye hai, cafes ke liye nahi.

---

## 2. Database me hai, lekin Admin Panel se access nahi (Gaps)

- **`ContactMessage`** — website ke "Contact Us" form se aaye messages ka koi admin view nahi hai abhi. Platform owner ko yeh dekhne ke liye directly DB query karni padegi. **Suggestion: admin panel me register karo, `is_read` list_editable ke saath.**
- **`ShopProfile`** — cafe ka branding info (shop name, address, logo, contact). Support/dispute ke waqt admin ko yeh dekhna pad sakta hai. **Suggestion: read-only admin registration.**
- **`ServicePricing`** — raw JSON settings (`paymentMode`, `priceItems`, `isOpen`, etc.) per cafe per service. Debug ke waqt (jaise "cash counter save nahi ho raha" jaisa issue) admin ko yeh directly dekhna padta hai. **Suggestion: read-only admin registration taaki DB shell kholne ki zaroorat na pade.**
- **`PrintOrder`** — customer orders ka koi admin view nahi hai. Disputes/refund cases me helpful hoga. **Suggestion: read-only, filterable by shop/status/payment_status.**

---

## 3. Roadmap — Aage Kya Banana Chahiye

- [ ] **Withdrawal reject → auto-refund**: Abhi `WithdrawalRequest` reject karne par cafe ka debited balance wapas credit nahi hota (`WALLET_TESTING.md` ke Known Gaps me already flagged). Admin action se hi automatic refund trigger hona chahiye.
- [ ] **Bulk cash-counter permission toggle**: Abhi ek-ek cafe ka `cash_counter_permitted` manually toggle karna padta hai. Bulk action (jaise "sabhi 30-din-purane verified cafes ko enable karo") admin list view se helpful hoga.
- [ ] **ContactMessage / ServicePricing / PrintOrder admin registration** (section 2 se) — low-effort, high-value, jaldi ho sakta hai.
- [ ] **Audit trail search improvements**: `WalletTransaction` admin me abhi basic filters hain (kind, direction) — date-range filter aur ek "negative-balance events" saved filter add karna useful hoga.
- [ ] **Cash Counter lock reason per-cafe customization**: Abhi generic message hai ("Cash Counter is not enabled..."). Kabhi specific reason (jaise "KYC pending", "fraud flag") admin note ke roop me store + display karna ho sakta hai.
- [ ] **Notification on auto-lock/unlock**: Jab kisi cafe ka Cash Counter balance ki wajah se auto-lock/unlock ho, cafe ko email/WhatsApp notify karna (abhi silent hai, sirf UI pe dikhta hai jab wo khud dashboard khole).
- [ ] **Dedicated admin dashboard** (Django admin se aage): Abhi sab kuch generic Django admin list/edit views hain. Ek custom dashboard (revenue summary, active cafes, pending withdrawals count, low-balance cafes list) platform-level visibility ke liye future me consider karo.

---

Naya admin-facing feature discuss ho ya ban jaye, ise yahin update karte jaana — implemented hote hi section 1 me move kar dena, roadmap se hata dena.
