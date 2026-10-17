"use client";

import { GAP_CHOICES, MARGIN_MAX_MM, maxSizePercent, SIZE_MIN_PERCENT, type SheetOptions } from "./sheetLayout";

/** Copies per card, gap between cards and page margin - shared by the shop dashboard and the customer page. */
export default function SheetOptionsControl({ value, onChange, paper }: { value: SheetOptions; onChange: (next: SheetOptions) => void; paper: { widthMm: number; heightMm: number } }) {
  // The size can never be more than the paper (minus the margin) has room for, so the number shown is always the real size.
  const maxPercent = maxSizePercent(paper, value.marginMm);
  const sizePercent = Math.min(value.sizePercent ?? 100, maxPercent);
  return (
    <div className="idcard-spacing">
      <label title="Space between cards">
        <span>Gap</span>
        <select value={value.gapMm ?? 6} onChange={(event) => onChange({ ...value, gapMm: Number(event.target.value) })}>
          {GAP_CHOICES.map((n) => (
            <option key={n} value={n}>
              {n} mm
            </option>
          ))}
        </select>
      </label>
      <label title="Space between the cards and the paper edge - type any value, or clear it for Auto">
        <span>Margin</span>
        <input
          type="number"
          min={0}
          max={MARGIN_MAX_MM}
          step={1}
          placeholder="Auto"
          value={value.marginMm ?? ""}
          onChange={(event) => onChange({ ...value, marginMm: event.target.value === "" ? null : Math.max(0, Math.min(MARGIN_MAX_MM, Number(event.target.value))) })}
        />
        <small>mm</small>
      </label>
      <label title="Card size as a percent of the real card (same shape). 100 = normal size">
        <span>Size</span>
        <input
          type="number"
          min={SIZE_MIN_PERCENT}
          max={maxPercent}
          step={5}
          value={sizePercent}
          onChange={(event) => onChange({ ...value, sizePercent: event.target.value === "" ? 100 : Math.max(SIZE_MIN_PERCENT, Math.min(maxPercent, Number(event.target.value))) })}
        />
        <small>% (max {maxPercent})</small>
        {sizePercent !== 100 ? (
          <button type="button" className="idcard-spacing-reset" onClick={() => onChange({ ...value, sizePercent: 100 })}>
            Reset
          </button>
        ) : null}
      </label>
    </div>
  );
}
