# Wallet Testing Checklist — Service Credits & Settlement

Yeh checklist wallet system (`UserProfile.balance`, `WalletTransaction` ledger, `WalletTopup`, `WithdrawalRequest`, `ToolPricing`) aur usse linked Cash Counter payment-mode gating ke saare logic branches cover karta hai. Har item: **condition → expected result**. Test karte waqt `[ ]` ko `[x]` kar dena.

Priority order: pehle **B, C, F, G** (tool charging, order settlement, withdrawal, top-up) — yeh core money-movement paths hain.

---

## A. Signup Bonus

- [ ] New user signup + email verify → `KIND_SIGNUP_BONUS` credit exactly once.
- [ ] Same user dobara verify/trigger try kare → dusri baar bonus credit NA ho (dedup check on `kind=SIGNUP_BONUS` without order).

## B. Tool Usage Charging — `charge_wallet_for_tool` (B2B aur B2C dono flows ka core)

- [ ] Tool ka `ToolPricing` row hi nahi hai → free, koi transaction nahi.
- [ ] `is_billable=False` → free.
- [ ] Effective price (price/price_b2b/price_b2c resolve karke) `<= 0` → free.
- [ ] Balance sufficient hai → normal deduct, `balance_after` sahi record ho.
- [ ] Deduct karne se balance `credit_limit` se neeche chala jayega → **blocked**, `KIND_TOOL_USAGE_BLOCKED` (info-only, balance untouched) log ho, error message me sahi limit dikhe.
- [ ] Balance already `<= 0` hai (grace zone me) → daily grace limit check trigger ho:
  - [ ] `used_today + charge <= daily_limit` → allowed, deduct ho.
  - [ ] `used_today + charge > daily_limit` → blocked, `KIND_TOOL_USAGE_BLOCKED` log ho.
- [ ] Grace-limit calculation sirf **aaj ke calendar date** ka usage count kare (kal ka usage carry-forward na ho — date rollover test karo).
- [ ] Same tool ka **double-click / race** (do parallel requests same user ke liye) → lock ki wajah se sirf ek deduct ho, dusra updated balance ke against re-check ho.
- [ ] `order=None` (B2B — cafe khud tool use kare, jaise background remover) vs `order=<PrintOrder>` (B2C — customer ke order se trigger) → dono cases test karo separately.
- [ ] Idempotency: same `order` + same `kind` ke liye dobara call (jaise webhook retry ya duplicate settlement call) → dusri baar deduct NA ho.

## C. B2B vs B2C Pricing Resolution

- [ ] `price_b2b` aur `price_b2c` dono null → dono context me shared `price` use ho.
- [ ] Sirf `price_b2b` set hai, `price_b2c` null → B2B usage `price_b2b` se charge ho, B2C usage shared `price` se.
- [ ] Sirf `price_b2c` set → ulta.
- [ ] Dono set (alag-alag values) → har context apni value use kare.
- [ ] `price_b2b` ya `price_b2c` explicitly `0` set kiya (null nahi) → us specific context me tool free ho jaye, dusre context me apni price lage (0 aur null ka fark test karo).

## D. Pre-flight Gate — `wallet_usage_gate`

- [ ] Free tool → hamesha pass.
- [ ] `balance <= effective_credit_limit` → blocked (job start hi na ho).
- [ ] Balance limit se upar → pass, job start ho, real deduction baad me `charge_wallet_for_tool` se ho.

## E. Print/Passport Order Settlement — `settle_printed_order_wallet` (B2C ka credit side)

- [ ] Order abhi `PRINTED` status me nahi hai → koi wallet transaction na bane.
- [ ] `payment_status = paid` (online gateway se aaya) → `KIND_ONLINE_ORDER_CREDIT`, `affects_balance=True`, balance badhe.
- [ ] `payment_status = cash_counter` → `KIND_CASH_COUNTER_COLLECTION`, `affects_balance=False`, balance na badle, sirf reporting me count ho.
- [ ] Order print hone ke baad turant tool-usage charge bhi trigger ho (print_bw_page/print_color_page/passport_photo ke hisaab se pages×copies quantity sahi ho).
- [ ] Wallet balance kam hone ki wajah se yeh tool-charge block ho jaye (service already deliver ho chuki, phir bhi charge nahi laga) → `KIND_TOOL_USAGE_BLOCKED` audit trail bane, order print hone se blocked nahi hota (already printed hai).
- [ ] Same order do baar settle trigger ho (jaise agent retry) → credit aur tool-charge dono dobara na bane (order+kind dedup).

## F. Withdrawal

- [ ] Amount `< Rs.1` → error.
- [ ] Method UPI/Bank ke alawa kuch aur → error.
- [ ] Account detail 3 characters se kam → error.
- [ ] UPI method + invalid UPI ID format → error.
- [ ] Amount > `netWithdrawable` (= `max(balance,0)`, ab commission-free) → "higher than withdrawable" error.
- [ ] Amount = exactly `netWithdrawable` → allowed (boundary case).
- [ ] Do parallel withdrawal requests same user se (double submit) → lock ki wajah se dusra request updated (already-debited) balance ke against re-check ho, overdraw na ho.
- [ ] Successful request → `WithdrawalRequest` (status=pending) + turant `KIND_WITHDRAWAL` debit ho jaata hai (balance turant kam ho jata hai, approval se pehle hi).
- [ ] **Gap jo verify karna zaroori hai**: Admin agar withdrawal ko admin panel se "rejected" kare, to kya balance wapas refund hota hai? (Abhi code me koi automatic refund logic nahi hai — confirm karo, agar chahiye to alag se fix karna padega.)
- [ ] Admin "paid" mark kare → sirf status update, wallet balance pe koi asar nahi (already debited tha).

## G. Wallet Top-up

- [ ] Amount `< Rs.10` → error.
- [ ] Koi gateway enabled/configured nahi hai, ya active gateway `direct_upi` hai → 503 "online top-up not available".
- [ ] **Razorpay**: order create → checkout khule → payment complete → signature verify pass → `KIND_TOPUP` credit ho, balance badhe.
- [ ] Razorpay: galat/tampered signature bheja jaye → verify fail ho, koi credit na ho.
- [ ] Razorpay: `gateway_order_id` match na kare → reject.
- [ ] Razorpay: dusre user ka topup_id apne token se access karne ki koshish → 404 (ownership check).
- [ ] Razorpay: verify endpoint dobara call ho (user refresh/double click) jab already paid ho chuka ho → dusri baar credit NA ho (idempotency guard).
- [ ] **PayU**: successful hosted-checkout → hash verify pass → credit ho, redirect `/wallet?topup=X&payment=success` pe aaye.
- [ ] PayU: forged/tampered callback (galat hash) → reject, credit na ho.
- [ ] PayU: amount mismatch (kisi ne request tamper kiya) → reject.
- [ ] PayU: `status != success` (customer ne cancel kiya) → credit na ho, redirect `payment=failure`.
- [ ] PayU: browser back-button se callback dobara submit ho (duplicate POST) → dusri baar credit na ho.
- [ ] **PhonePe**: order create → redirect → return callback status API se re-verify kare (redirect ke query params par bharosa na kare) → sahi credit ho.
- [ ] PhonePe: return callback tamper kiya jaye (URL me `payment=success` manually daal diya) → phir bhi server status-API check karega, fake credit na ho.
- [ ] PhonePe webhook: galat `Authorization` header → 401, koi processing na ho.
- [ ] PhonePe webhook: same `merchantOrderId` do baar aaye (retry) → sirf ek baar credit ho.
- [ ] PhonePe webhook aur redirect-callback dono race karein (dono ek hi payment confirm karne ki koshish karein) → sirf ek credit lage (lock-based idempotency).
- [ ] PhonePe/PayU webhook ya callback me `gateway_order_id` — PrintOrder ("cm" prefix) vs WalletTopup ("wt" prefix) — cross na ho, sahi table match ho (dono flows ek hi webhook endpoint share karte hain, isliye specifically test karo ki ek print-order payment galti se wallet credit na kar de ya vice versa).
- [ ] Top-up flow me active gateway create-time aur order-time ke beech switch ho jaye (config change) → graceful error, silent wrong-charge na ho.

## H. Per-cafe Credit Limit Override

- [ ] `credit_limit_override = null` (default) → global `WalletSetting.credit_limit` apply ho.
- [ ] Admin ek specific cafe ke liye override set kare (jaise `-500`) → us cafe ke liye hi apply ho, dusre cafes unaffected rahe.
- [ ] Override `0` set kare → us cafe ke liye bilkul negative allowed na ho.
- [ ] `wallet_usage_gate`, `charge_wallet_for_tool`, aur `/api/wallet/` dashboard — teeno jagah override consistently apply ho (ek jagah global aur doosri jagah override use na ho jaye, mismatch check karo).
- [ ] Admin override change kare mid-session → agla request turant naya limit use kare (koi stale caching issue nahi honi chahiye).

## I. Ledger & Dashboard Display

- [ ] `ledgerType=all/withdrawable/tracked` filters sahi rows dikhayein (`affects_balance` field ke hisaab se).
- [ ] Date range (`from`/`to`) filter sahi kaam kare.
- [ ] Pagination: `page` param total pages se zyada ho to clamp ho jaye.
- [ ] `isLowBalance` (`balance <= 0`) aur `isBlocked` (`balance <= effective credit limit`) flags sahi compute hon — override wale user ke liye bhi.
- [ ] `todayGraceUsed` sirf aaj ki grace-zone usage dikhaye, purane din ka carry na ho.

## J. General / Cross-cutting

- [ ] Naye user ka pehla wallet access (`UserProfile` abhi tak exist nahi karta) → auto-create ho jaye, koi error na aaye.
- [ ] Topup + tool-usage ek hi waqt (parallel) ho rahe ho same user ke → dono properly serialize hon (koi lost update na ho, final balance dono transactions ka sahi net result ho).
- [ ] `WalletSetting` ka koi key `is_active=False` set kar diya jaye (jaise `credit_limit` disable) → uska effective value `0` treat ho — is case ka impact tools/withdrawal pe test karo.

## K. Cash Counter Auto-Lock / Auto-Unlock (wallet-linked)

Cash Counter payment mode do cheezon se gate hota hai — `UserProfile.cash_counter_permitted` (admin-controlled, sirf permission) aur wallet balance (live, `cash_counter_available()` har request pe fresh compute karta hai). **Shop ka saved preference ("Both") kabhi bhi automatically "Online Payment" me downgrade nahi hota** — sirf availability dynamically on/off hoti hai. Isliye balance recover hote hi sab kuch apne aap wapas unlock ho jata hai, owner ko dobara save karne ki zaroorat nahi.

- [ ] `cash_counter_permitted=False` (admin ne off kiya) → "Both" save karne ki koshish 403 + clear reason ke saath fail ho; already-saved "Both" preference bhi live availability me `False` dikhe.
- [ ] `cash_counter_permitted=True` lekin `balance <= effective_credit_limit` → `cash_counter_available()` `False` return kare, reason me balance aur limit dono numbers sahi dikhein.
- [ ] Balance limit se neeche jaate waqt shop ka saved `paymentMode="Both"` preference DB me **as-is rahe** (downgrade na ho) — verify: `ServicePricing.settings.paymentMode` query karke dekho.
- [ ] Balance wapas limit se upar aaye (topup/online-order-credit se) → **agli hi request pe**, bina kisi manual re-save ke, `cash_counter_available()` `True` ho jaye.
- [ ] Owner ka `/auto-print` Step 4 page reload kare balance-recovery ke baad → "Both" button automatically unlock (enabled) dikhe, koi stale/cached locked state na rahe.
- [ ] Customer-facing storefront (`/s/<code>`) → `public_shop_by_code` ka response balance-recovery ke baad automatically `paymentMode: "Both"` dikhaye (pehle se resolve hoke aata hai, frontend kuch extra nahi karta).
- [ ] Order creation (`public_print_order`) → balance-recovery ke baad customer "Cash Counter" select karke order successfully place kar sake (`payment_status=cash_counter`, `status=awaiting_approval`).
- [ ] Isi cycle (lock → unlock) ko do-teen baar repeat karke dekho (balance up-down-up) — koi stuck/stale state na aaye, har baar sahi resolve ho.

---

## Known gaps (test karke confirm karo, fix baad me discuss karenge)

- **F.10** — Withdrawal reject hone par balance refund nahi hota (abhi code me handled nahi hai).
- **G** — Sirf Razorpay/PayU/PhonePe automatic top-up verify kar sakte hain; `direct_upi` gateway active ho to top-up UI disable/unavailable rahega (jaisa print-order flow me bhi hai).
