const ITEMS = [
  {
    title: "Account deletion required no auth or password",
    detail:
      "POST /auth/delete-account/ used to accept just an email and delete that account permanently - anyone who knew a cafe owner's email could wipe their account, orders, and wallet history. Now requires a valid session token AND the account's current password, and only deletes the caller's own account.",
    status: "Fixed",
  },
  {
    title: "Passport photo raw upload had no auth",
    detail:
      "GET /agent/passport-jobs/{id}/original-image/ served any customer's raw uploaded photo to anyone who guessed the job_id, no login required. Now requires a valid session token. Verified neither the web client nor the current desktop Print Agent source actually calls this route today, so the fix doesn't break any deployed caller.",
    status: "Fixed",
  },
  {
    title: "Double wallet settlement on retried print status",
    detail:
      "A retried \"status=printed\" call from the desktop Print Agent (slow network response) could re-run wallet crediting and RepetiGo's platform-fee deduction a second time for the same order. Added a settled_at timestamp on the order, checked and set under a row lock so retries and true concurrent calls are both safely idempotent.",
    status: "Fixed",
  },
  {
    title: "Unreachable payment-bypass function removed",
    detail:
      "views.py had a public_mark_order_paid function that could mark any order \"paid\" with zero validation. It was never wired to a URL (unreachable), but stayed in the codebase as a risk if it were ever accidentally routed. Removed entirely.",
    status: "Fixed",
  },
  {
    title: "Leads CRM was completely unauthenticated",
    detail:
      "Google Places / Google Place Details / Lead Activities routes accepted any GET/POST/PUT/DELETE from anyone on the internet. Now gated behind the same staff-only auth as this dashboard; the cafemitra_leads frontend logs in and sends the token on every request.",
    status: "Fixed",
  },
] as const;

export default function SecurityPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Security Fixes & Audit Alerts</h1>
      <p className="text-sm text-slate-500 mb-4">
        Known gaps flagged during the API documentation pass (see <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">API_DOCUMENTATION.md</code> section 15), tracked here.
      </p>

      <div className="space-y-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
              <span className="shrink-0 inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                {item.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
