// Hands a just-generated passport photo off to the Photo Print Sheet Maker
// across a full page navigation. The photo is a base64 data URI (or
// occasionally a server file path) that can run past typical URL length
// limits, so it travels via sessionStorage instead of a query string.
const STORAGE_KEY = "cafemitra:pending-print-sheet-photo";

export type PendingPrintSheetPhoto = { url: string; name: string };

export function stashPhotoForPrintSheet(url: string, name: string): boolean {
  if (typeof window === "undefined" || !url) return false;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ url, name }));
    return true;
  } catch {
    // Storage can be unavailable (private browsing, quota) - the print
    // sheet page just opens empty instead of pre-loaded, which is fine.
    return false;
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

// Opposite direction: sends a queued print-sheet photo to the Photo Editor
// (background colour / name & DOB caption tools). Same sessionStorage trick.
const EDITOR_KEY = "cafemitra:pending-editor-photo";

export type EditorHandoffTool = "background" | "caption";
export type PendingEditorPhoto = { url: string; name: string; tool: EditorHandoffTool };

export function stashPhotoForEditor(url: string, name: string, tool: EditorHandoffTool): boolean {
  if (typeof window === "undefined" || !url) return false;
  try {
    sessionStorage.setItem(EDITOR_KEY, JSON.stringify({ url, name, tool }));
    return true;
  } catch {
    return false;
  }
}

export function takePendingEditorPhoto(): PendingEditorPhoto | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(EDITOR_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(EDITOR_KEY);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.url !== "string") return null;
    return { url: parsed.url, name: typeof parsed.name === "string" ? parsed.name : "photo.jpg", tool: parsed.tool === "caption" ? "caption" : "background" };
  } catch {
    return null;
  }
}
