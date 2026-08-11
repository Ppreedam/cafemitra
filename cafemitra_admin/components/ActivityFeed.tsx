import { ArrowDownCircle, ArrowUpCircle, Printer } from "lucide-react";
import type { ActivityEvent } from "@/lib/api";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

const TYPE_ICON = {
  order: Printer,
  topup: ArrowDownCircle,
  withdrawal: ArrowUpCircle,
} as const;

const TYPE_LABEL = {
  order: "Order",
  topup: "Top-up",
  withdrawal: "Withdrawal",
} as const;

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No recent activity.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100">
      {events.map((event) => {
        const Icon = TYPE_ICON[event.type];
        return (
          <li key={`${event.type}-${event.id}`} className="flex items-center gap-3 py-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-900 truncate">{event.label}</p>
              <p className="text-xs text-slate-500">
                {TYPE_LABEL[event.type]} · {event.status} · {formatRelativeTime(event.createdAt)}
              </p>
            </div>
            <span className="text-sm font-medium text-slate-900 shrink-0">{formatCurrency(event.amount)}</span>
          </li>
        );
      })}
    </ul>
  );
}
