// Hands a just-generated passport photo off to the Photo Print Sheet Maker
// across a full page navigation. The photo is a base64 data URI (or
// occasionally a server file path) that can run past typical URL length
// limits, so it travels via sessionStorage instead of a query string.
const STORAGE_KEY = "cafemitra:pending-print-sheet-photo";

export type PendingPrintSheetPhoto = { url: string; name: string };

export function stashPhotoForPrintSheet(url: string, name: string) {
  if (typeof window === "undefined" || !url) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ url, name }));
  } catch {
    // Storage can be unavailable (private browsing, quota) - the print
    // sheet page just opens empty instead of pre-loaded, which is fine.
  }
}

export function takePendingPrintSheetPhoto(): PendingPrintSheetPhoto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.url !== "string") return null;
    return { url: parsed.url, name: typeof parsed.name === "string" ? parsed.name : "passport-photo.jpg" };
  } catch {
    return null;
  }
}
