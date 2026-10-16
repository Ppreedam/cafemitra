"use client";

import { GAP_CHOICES, MARGIN_MAX_MM, MAX_COPIES, maxSizePercent, SIZE_MIN_PERCENT, type SheetOptions } from "./sheetLayout";

/** Copies per card, gap between cards and page margin - shared by the shop dashboard and the customer page. */
export default function SheetOptionsControl({
  value,
  onChange,
  paper,
  allCopies,
  onAllCopies,
}: {
  value: SheetOptions;
  onChange: (next: SheetOptions) => void;
  paper: { widthMm: number; heightMm: number };
  /** Copies of every ID card when they are all the same (null = they differ); onAllCopies sets all of them. Each card also has its own. */
  allCopies: number | null;
  onAllCopies: (copies: number) => void;
}) {
  // The size can never be more than the paper (minus the margin) has room for, so the number shown is always the real size.
  const maxPercent = maxSizePercent(paper, value.marginMm);
  const sizePercent = Math.min(value.sizePercent ?? 100, maxPercent);
  return (
    <div className="idcard-spacing">
      <label title="Copies of every ID card - or set each card's own copies on the card">
        <span>Copies (all)</span>
        <select value={allCopies ?? ""} onChange={(event) => event.target.value && onAllCopies(Number(event.target.value))}>
          {allCopies === null ? (
            <option value="" disabled>
              Mixed
            </option>
          ) : null}
          {Array.from({ length: MAX_COPIES }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
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
