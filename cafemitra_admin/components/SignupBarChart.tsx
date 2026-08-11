"use client";

import { useState } from "react";

const BAR_COLOR = "#2a78d6";
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#c3c2b7";
const MUTED_TEXT = "#898781";

export default function SignupBarChart({ series }: { series: { date: string; count: number }[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (series.length === 0) {
    return <p className="text-sm text-slate-500">No signups in this range.</p>;
  }

  const width = 720;
  const height = 220;
  const paddingLeft = 32;
  const paddingBottom = 24;
  const paddingTop = 12;
  const plotWidth = width - paddingLeft - 8;
  const plotHeight = height - paddingBottom - paddingTop;

  const maxCount = Math.max(...series.map((s) => s.count), 1);
  const barSlot = plotWidth / series.length;
  const barWidth = Math.min(24, barSlot - 2);

  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((maxCount / gridSteps) * i));

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Signups over time">
        {gridValues.map((value) => {
          const y = paddingTop + plotHeight - (value / maxCount) * plotHeight;
          return (
            <g key={value}>
              <line x1={paddingLeft} x2={width} y1={y} y2={y} stroke={GRID_COLOR} strokeWidth={1} />
              <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fontSize={10} fill={MUTED_TEXT}>
                {value}
              </text>
            </g>
          );
        })}
        <line
          x1={paddingLeft}
          x2={paddingLeft}
          y1={paddingTop}
          y2={paddingTop + plotHeight}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />
        <line
          x1={paddingLeft}
          x2={width}
          y1={paddingTop + plotHeight}
          y2={paddingTop + plotHeight}
          stroke={AXIS_COLOR}
          strokeWidth={1}
        />

        {series.map((point, i) => {
          const barHeight = maxCount > 0 ? (point.count / maxCount) * plotHeight : 0;
          const x = paddingLeft + i * barSlot + (barSlot - barWidth) / 2;
          const y = paddingTop + plotHeight - barHeight;
          return (
            <rect
              key={point.date}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 1)}
              rx={4}
              fill={BAR_COLOR}
              opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}

        {series.map((point, i) => {
          if (series.length > 14 && i % Math.ceil(series.length / 14) !== 0) return null;
          const x = paddingLeft + i * barSlot + barSlot / 2;
          return (
            <text key={point.date} x={x} y={height - 6} textAnchor="middle" fontSize={9} fill={MUTED_TEXT}>
              {point.date.slice(5)}
            </text>
          );
        })}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-md bg-slate-900 text-white text-xs px-2 py-1 -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((paddingLeft + hoverIndex * barSlot + barSlot / 2) / width) * 100}%`,
            top: `${(paddingTop / height) * 100}%`,
          }}
        >
          {series[hoverIndex].date}: {series[hoverIndex].count}
        </div>
      )}
    </div>
  );
}
