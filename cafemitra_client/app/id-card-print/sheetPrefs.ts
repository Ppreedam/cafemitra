import type { SheetLayout, SheetOptions } from "./sheetLayout";

// The margin and card size a shop / customer printed with, remembered on this device for each layout
// (Left / Right and Top / Bottom) and applied again the next time that layout is used.
const KEY = "cafemitra:idcard-sheet-prefs";

type Saved = Partial<Record<SheetLayout, { marginMm: number | null; sizePercent: number; landscape?: boolean }>>;

function readAll(): Saved {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadSheetPrefs(layout: SheetLayout): { marginMm: number | null; sizePercent: number; landscape: boolean } | null {
  const saved = readAll()[layout];
  if (!saved) return null;
  const marginMm = typeof saved.marginMm === "number" && saved.marginMm >= 0 ? saved.marginMm : null;
  const sizePercent = typeof saved.sizePercent === "number" && saved.sizePercent > 0 ? saved.sizePercent : 100;
  return { marginMm, sizePercent, landscape: saved.landscape === true };
}

export function saveSheetPrefs(layout: SheetLayout, options: SheetOptions) {
  try {
    const all = readAll();
    all[layout] = { marginMm: options.marginMm ?? null, sizePercent: options.sizePercent ?? 100, landscape: options.landscape === true };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable - the settings just are not remembered.
  }
}
