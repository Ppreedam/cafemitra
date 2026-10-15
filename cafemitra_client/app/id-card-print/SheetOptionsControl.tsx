"use client";

import { GAP_CHOICES, MARGIN_CHOICES, MAX_COPIES, type SheetOptions } from "./sheetLayout";

/** Copies per card, gap between cards and page margin - shared by the shop dashboard and the customer page. */
export default function SheetOptionsControl({ value, onChange }: { value: SheetOptions; onChange: (next: SheetOptions) => void }) {
  return (
    <div className="idcard-spacing">
      <label title="How many copies of every ID card to print">
        <span>Copies</span>
        <select value={value.copies ?? 1} onChange={(event) => onChange({ ...value, copies: Number(event.target.value) })}>
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
      <label title="Space between the cards and the paper edge">
        <span>Margin</span>
        <select value={value.marginMm ?? ""} onChange={(event) => onChange({ ...value, marginMm: event.target.value === "" ? null : Number(event.target.value) })}>
          <option value="">Auto</option>
          {MARGIN_CHOICES.map((n) => (
            <option key={n} value={n}>
              {n} mm
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
