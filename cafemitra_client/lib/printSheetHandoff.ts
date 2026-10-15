// Hands a just-generated passport photo off to the Photo Print Sheet Maker
// across a full page navigation. The photo is a base64 data URI (or
// occasionally a server file path) that can run past typical URL length
// limits, so it travels via sessionStorage instead of a query string.
const STORAGE_KEY = "cafemitra:pending-print-sheet-photo";

export type PendingPrintSheetPhoto = { url: string; name: string; rotateOnPrint?: boolean; count?: number };

// rotateOnPrint: the sheet turns this photo 90 degrees clockwise when it is
// printed/downloaded (family group photos are landscape, the tile is portrait);
// the queue preview keeps showing the photo as it is.
// count: how many copies the sheet starts with (a passport order's package, e.g. 4 or 6 pcs).
export function stashPhotoForPrintSheet(url: string, name: string, rotateOnPrint = false, count?: number): boolean {
  if (typeof window === "undefined" || !url) return false;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ url, name, rotateOnPrint, count }));
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
    return { url: parsed.url, name: typeof parsed.name === "string" ? parsed.name : "passport-photo.jpg", rotateOnPrint: parsed.rotateOnPrint === true, count: Number.isFinite(parsed.count) && parsed.count > 0 ? Math.floor(parsed.count) : undefined };
  } catch {
    return null;
  }
}

// Opposite direction: sends a queued print-sheet photo to the Photo Editor
// (background colour / name & DOB caption tools). Same sessionStorage trick.
const EDITOR_KEY = "cafemitra:pending-editor-photo";

export type EditorHandoffTool = "background" | "caption";
export type PendingEditorPhoto = { url: string; name: string; tool: EditorHandoffTool };

// sessionStorage holds only ~5 MB, and a big photo as a base64 data URI (a
// family group photo, say) overflows it. The pages hand over through a
// client-side navigation, so the same JS memory is still there - keep the
// photo in this module variable when storage refuses it.
let memoryEditorPhoto: PendingEditorPhoto | null = null;

export function stashPhotoForEditor(url: string, name: string, tool: EditorHandoffTool): boolean {
  if (typeof window === "undefined" || !url) return false;
  try {
    sessionStorage.setItem(EDITOR_KEY, JSON.stringify({ url, name, tool }));
    memoryEditorPhoto = null;
    return true;
  } catch {
    try {
      sessionStorage.removeItem(EDITOR_KEY);
    } catch {
      // Nothing stale to clear.
    }
    memoryEditorPhoto = { url, name, tool };
    return true;
  }
}

export function takePendingEditorPhoto(): PendingEditorPhoto | null {
  if (typeof window === "undefined") return null;
  if (memoryEditorPhoto) {
    const photo = memoryEditorPhoto;
    memoryEditorPhoto = null;
    return photo;
  }
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
