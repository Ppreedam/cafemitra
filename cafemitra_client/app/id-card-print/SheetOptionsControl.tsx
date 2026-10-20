"use client";

import { GAP_CHOICES, MARGIN_MAX_MM, maxSizePercent, SIZE_MIN_PERCENT, type SheetOptions } from "./sheetLayout";

const GAP_MIN = GAP_CHOICES[0];
const GAP_MAX = GAP_CHOICES[GAP_CHOICES.length - 1];
const GAP_STEP = 2;

/** Copies per card, gap between cards and page margin - shared by the shop dashboard and the customer page. */
export default function SheetOptionsControl({ value, onChange, paper }: { value: SheetOptions; onChange: (next: SheetOptions) => void; paper: { widthMm: number; heightMm: number } }) {
  // The size can never be more than the paper (minus the margin) has room for, so the number shown is always the real size.
  const maxPercent = maxSizePercent(paper, value.marginMm);
  const sizePercent = Math.min(value.sizePercent ?? 100, maxPercent);
  const gapMm = value.gapMm ?? 6;
  return (
    <div className="idcard-spacing">
      <label title="Space between cards">
        <span>Gap</span>
        <span className="idcard-stepper">
          <button type="button" aria-label="Decrease gap" disabled={gapMm <= GAP_MIN} onClick={() => onChange({ ...value, gapMm: Math.max(GAP_MIN, gapMm - GAP_STEP) })}>
            −
          </button>
          <input
            type="number"
            min={GAP_MIN}
            max={GAP_MAX}
            step={GAP_STEP}
            value={gapMm}
            onChange={(event) => onChange({ ...value, gapMm: event.target.value === "" ? 6 : Math.max(GAP_MIN, Math.min(GAP_MAX, Number(event.target.value))) })}
          />
          <button type="button" aria-label="Increase gap" disabled={gapMm >= GAP_MAX} onClick={() => onChange({ ...value, gapMm: Math.min(GAP_MAX, gapMm + GAP_STEP) })}>
            +
          </button>
        </span>
        <small>mm</small>
      </label>
      <label title="Space between the cards and the paper edge - type any value, or clear it for Auto">
        <span>Margin</span>
        <span className="idcard-stepper">
          <button type="button" aria-label="Decrease margin" disabled={value.marginMm == null} onClick={() => onChange({ ...value, marginMm: (value.marginMm ?? 0) <= 0 ? null : (value.marginMm ?? 0) - 1 })}>
            −
          </button>
          <input
            type="number"
            min={0}
            max={MARGIN_MAX_MM}
            step={1}
            placeholder="Auto"
            value={value.marginMm ?? ""}
            onChange={(event) => onChange({ ...value, marginMm: event.target.value === "" ? null : Math.max(0, Math.min(MARGIN_MAX_MM, Number(event.target.value))) })}
          />
          <button type="button" aria-label="Increase margin" disabled={(value.marginMm ?? 0) >= MARGIN_MAX_MM} onClick={() => onChange({ ...value, marginMm: Math.min(MARGIN_MAX_MM, (value.marginMm ?? 0) + 1) })}>
            +
          </button>
        </span>
        <small>mm</small>
      </label>
      <label title="Card size as a percent of the real card (same shape). 100 = normal size">
        <span>Size</span>
        <span className="idcard-stepper">
          <button type="button" aria-label="Decrease size" disabled={sizePercent <= SIZE_MIN_PERCENT} onClick={() => onChange({ ...value, sizePercent: Math.max(SIZE_MIN_PERCENT, sizePercent - 5) })}>
            −
          </button>
          <input
            type="number"
            min={SIZE_MIN_PERCENT}
            max={maxPercent}
            step={5}
            value={sizePercent}
            onChange={(event) => onChange({ ...value, sizePercent: event.target.value === "" ? 100 : Math.max(SIZE_MIN_PERCENT, Math.min(maxPercent, Number(event.target.value))) })}
          />
          <button type="button" aria-label="Increase size" disabled={sizePercent >= maxPercent} onClick={() => onChange({ ...value, sizePercent: Math.min(maxPercent, sizePercent + 5) })}>
            +
          </button>
        </span>
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
