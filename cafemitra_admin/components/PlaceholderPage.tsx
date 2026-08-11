export default function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500">
        {phase} — see <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">ADMIN_DASHBOARD_PLAN.md</code> for scope.
      </p>
    </div>
  );
}
