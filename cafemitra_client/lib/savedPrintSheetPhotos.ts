// Photos the user chose to "Save" in the Photo Print Sheet Maker. They live in
// this browser's IndexedDB (not on a server), so they survive a refresh and
// come back in the queue next to any new photos that arrive later.
const DB_NAME = "cafemitra-print-sheet";
const STORE = "saved-photos";

export type SavedPrintSheetPhoto = {
  id: string;
  file: Blob;
  name: string;
  type: string;
  widthCm: number;
  heightCm: number;
  count: number;
  sizeKey: string;
  /** Older saves only have this flag (= one turn). */
  rotateOnPrint?: boolean;
  sheetTurns?: number;
  savedAt: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

// Every call is best-effort: private mode / blocked storage just means
// nothing is remembered, never an error for the user.
export async function loadSavedPhotos(): Promise<SavedPrintSheetPhoto[]> {
  try {
    const all = await run<SavedPrintSheetPhoto[]>("readonly", (store) => store.getAll());
    return all.sort((a, b) => a.savedAt - b.savedAt);
  } catch {
    return [];
  }
}

export async function putSavedPhoto(photo: SavedPrintSheetPhoto): Promise<boolean> {
  try {
    await run("readwrite", (store) => store.put(photo));
    return true;
  } catch {
    return false;
  }
}

export async function deleteSavedPhoto(id: string): Promise<void> {
  try {
    await run("readwrite", (store) => store.delete(id));
  } catch {
    // Nothing to clean up.
  }
}

export async function clearSavedPhotos(): Promise<void> {
  try {
    await run("readwrite", (store) => store.clear());
  } catch {
    // Nothing to clean up.
  }
}
