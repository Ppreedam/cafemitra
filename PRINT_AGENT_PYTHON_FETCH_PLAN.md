# Print Agent — Python "Fetch Jobs" MVP Plan

Yeh file **first buildable milestone** ka focused plan hai: ek chhota Python agent jo CafeMitra account se login kare aur `cafemitra_server` se pending print-job orders **fetch/poll+list** kare. Printing, QR, local bridge, auto-update — yeh sab is plan me **nahi** hain, wo bade [`PRINT_AGENT_PYTHON_ROADMAP.md`](PRINT_AGENT_PYTHON_ROADMAP.md) ke baad ke phases me already planned hain. Iska maqsad hai jaldi se ek kaam karta hua chhota agent khada karna — login + job-list dikhna — jispe baaki sab tarah-tarah ki features baad me layer ho sakein.

---

## 1. Goal

Ek CLI/console Python script jo:
1. `email` + `password` se `POST /api/auth/login/` par login kare, `accessToken`/`refreshToken` memory (ya local config file) me rakhe.
2. Har `N` seconds (default 10s) `GET /api/agent/jobs/` poll kare.
3. Naye/pending jobs ko console me print kare (id, file name, pages, copies, paper, color mode, amount, status).
4. Access-token expire (`401`) hone par khud `POST /api/auth/refresh/` se refresh kare aur wahi request ek baar retry kare.

**Is plan me NAHI hai** (baad ke milestones): actual printing, cash-counter approve/reject, printer presets, QR print, local bridge server (`127.0.0.1:8765`), auto-update, passport/Gemini flow (§ dekho `PRINT_AGENT_PYTHON_ROADMAP.md` §1 — yeh purane C# agent se hi chalta hai, is rewrite me carry nahi ho raha).

---

## 2. Reference — API contract (jo already `PRINT_AGENT_API.md` me detail me hai)

### `POST /api/auth/login/`
- Request: `{"email": "...", "password": "..."}` (koi auth header nahi)
- Response: `{"token": "...", "refreshToken": "...", "user": {"fullName": "...", "email": "..."}}`
- Edge case: token khaali/null → login failed maano, retry mat karo (galat credentials).

### `POST /api/auth/refresh/`
- Request: `{"refreshToken": "..."}` (koi auth header nahi)
- Response: naya `token` (aur kabhi-kabhi naya `refreshToken`)
- Trigger: sirf jab koi authenticated call `401` de — kabhi bhi manually mat bulao.

### `GET /api/agent/jobs/`
- Header: `Authorization: Bearer {accessToken}`, `User-Agent: CafeMitra-PrintAgent/1.0-py`
- Response: `{"jobs": [ {id, file, pages, copies, paper, priceLabel/priceItemId/serviceName, amount, paymentStatus, status, date, downloadUrl, ...}, ... ]}`
- Edge case: `accessToken` khaali ho to poll hi mat chalao (login required state).

Poora field-level detail aur edge-cases ke liye: [`PRINT_AGENT_API.md`](PRINT_AGENT_API.md) §2–§3.

---

## 3. Minimal Module Structure

```
print_agent_fetch/
├── main.py            # entry point: login, phir poll-loop start
├── config.py          # base URL, poll interval, config.json load/save (accessToken/refreshToken)
├── api_client.py       # login(), refresh_token(), fetch_jobs() — httpx wrapper, auto-refresh-on-401
└── models.py           # PrintJob dataclass/pydantic model
```

- **HTTP client**: `httpx` (sync client theek hai is MVP ke liye, async baad me agar zarurat pade).
- **Config storage**: shuru me sirf plain `config.json` (`%APPDATA%\CafeMitra\PrintAgent\config.json` ya current-dir) — DPAPI encryption baad ke milestone me (roadmap §5 Improve #4 dekho), MVP ko blocked mat karo isse.

---

## 4. Build Steps

1. **Project setup**: `print_agent_fetch/` folder, `requirements.txt` (`httpx`, `pydantic`), virtualenv.
2. **`config.py`**: `BASE_URL` (cafemitra_server root), `POLL_INTERVAL_SECONDS = 10`, `load_config()`/`save_config()` (accessToken/refreshToken read-write to `config.json`).
3. **`models.py`**: `PrintJob` model — id, file, pages, copies, paper, color_mode (text-guess fallback jaisa C# `PrintColorMode` — dekho `PRINT_AGENT_API.md` §3), amount, payment_status, status, date, download_url.
4. **`api_client.py`**:
   - `login(email, password) -> tokens`
   - `refresh_token(refresh_token) -> new_access_token`
   - `fetch_jobs(access_token) -> list[PrintJob]` — `401` aaye to internally `refresh_token()` call karke ek baar retry kare (jaisa C# `allowRefresh` flag pattern).
5. **`main.py`**:
   - Agar saved `accessToken` config me nahi hai → email/password prompt (input()) → `login()` → config me save.
   - Poll-loop: `while True: fetch_jobs() → naye jobs console-print → time.sleep(POLL_INTERVAL_SECONDS)`.
   - `Ctrl+C` par graceful exit.
6. **Manual test**: local `cafemitra_server` (ya staging) ke against chalao, ek real pending order banao dashboard se, verify karo agent usse fetch karke console me sahi dikhata hai.

**Exit criteria**: script chalao → login ho jaaye (ya saved token se auto-resume) → pending jobs list console me correctly dikhein → token expire simulate karke dikhao ki refresh silently ho jaata hai (job-fetch break nahi hota).

---

## 5. Next Steps (is MVP ke baad)

Yeh fetch-only agent taiyar hone ke baad, `PRINT_AGENT_PYTHON_ROADMAP.md` ke phases follow karo:
- Phase 2 me actual printing (pywin32) add karo isi job-list par.
- Phase 3 me cash-counter approve/reject.
- Phase 4+ me QR print, local bridge, auto-update.

---

## 6. Cross-reference

- Poora rewrite roadmap (is MVP ke aage kya banega): [`PRINT_AGENT_PYTHON_ROADMAP.md`](PRINT_AGENT_PYTHON_ROADMAP.md)
- Current C# app ka poora API-usage inventory: [`PRINT_AGENT_API.md`](PRINT_AGENT_API.md)
- Server-side API contract: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md)
