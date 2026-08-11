import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Status hues from the dataviz skill's validated palette (references/palette.md) -
// kept as exact hex rather than Tailwind's red/amber/green so the tones stay
// consistent with the rest of the design system if other charts are added later.
const TONE_COLORS = {
  neutral: "#4f46e5",
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
} as const;

export type StatTileTone = keyof typeof TONE_COLORS;

// Delta color = direction of the change × whether up is "good" for this
// metric (e.g. revenue up is good; failed-jobs up is not) - never just
// "green because positive number".
export type StatTileDelta = {
  percent: number | null; // null when the comparison period was zero (no % is meaningful)
  comparisonLabel: string; // e.g. "vs yesterday"
  goodDirection?: "up" | "down";
};

const GOOD_COLOR = "#0ca30c";
const CRITICAL_COLOR = "#d03b3b";
const MUTED_COLOR = "#898781";

function DeltaBadge({ delta }: { delta: StatTileDelta }) {
  const { percent, comparisonLabel, goodDirection = "up" } = delta;

  if (percent === null) {
    return <span className="text-xs text-slate-400">{comparisonLabel}: new</span>;
  }

  const isUp = percent > 0;
  const isFlat = percent === 0;
  const isGood = isFlat ? null : isUp === (goodDirection === "up");
  const color = isFlat ? MUTED_COLOR : isGood ? GOOD_COLOR : CRITICAL_COLOR;
  const Icon = isFlat ? Minus : isUp ? ArrowUp : ArrowDown;

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color }}>
      <Icon size={12} />
      {Math.abs(percent).toFixed(1)}% <span className="text-slate-400 font-normal">{comparisonLabel}</span>
    </span>
  );
}

export default function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
  delta,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatTileTone;
  href?: string;
  delta?: StatTileDelta;
}) {
  const color = TONE_COLORS[tone];

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            <Icon size={16} />
          </span>
        )}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      {delta && (
        <div className="mt-1">
          <DeltaBadge delta={delta} />
        </div>
      )}
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 transition">
        {content}
      </Link>
    );
  }

  return <div className="rounded-xl border border-slate-200 bg-white p-4">{content}</div>;
}
