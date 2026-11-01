"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { apiFetch, apiUrl, hasStoredSession } from "@/lib/api";
import { stashPhotoForPrintSheet } from "@/lib/printSheetHandoff";
import {
  PHOTO_READY_EVENT,
  PHOTO_WATCH_EVENT,
  PHOTO_WATCH_INTERVAL_MS,
  clearPhotoWatch,
  readPhotoWatch,
  type PendingPhotoWatch,
} from "@/lib/pendingPhotoWatch";

type ReadyPhoto = { url: string; name: string; count: number; rotateOnPrint: boolean };

// Lives in DashboardShell, so it runs on every dashboard page. While a passport photo that was still generating
// is being watched (see lib/pendingPhotoWatch.ts) it re-checks it every few seconds, for a few minutes at most,
// and shows a "Finish your order" popup the moment the photo is ready - wherever the shop owner is.
export function ReadyPhotoWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [watch, setWatch] = useState<PendingPhotoWatch | null>(null);
  const [ready, setReady] = useState<ReadyPhoto | null>(null);
  // Read inside the polling loop without restarting it on every navigation.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const sync = () => setWatch(readPhotoWatch());
    sync();
    window.addEventListener(PHOTO_WATCH_EVENT, sync);
    return () => window.removeEventListener(PHOTO_WATCH_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!watch || !hasStoredSession()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // One request at a time (the check endpoint can hold the request open while it retries), then wait.
    async function tick() {
      if (cancelled) return;
      if (!readPhotoWatch()) {
        setWatch(null);
        return;
      }
      try {
        const response = await apiFetch(watch!.kind === "family" ? "/api/api-family-photo-check/" : "/api/api-passport-photo-check/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: watch!.id }),
        });
        const result = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && result.found && result.imageUrl) {
          clearPhotoWatch();
          if (pathnameRef.current.startsWith("/orders")) {
            // The Orders page shows this order's own countdown and opens it directly - no popup on top of that.
            window.dispatchEvent(new CustomEvent(PHOTO_READY_EVENT, { detail: { id: watch!.id } }));
            return;
          }
          setReady({ url: result.imageUrl as string, name: watch!.name, count: watch!.count, rotateOnPrint: watch!.kind === "family" });
          return;
        }
      } catch {
        // Network blip - try again on the next tick until the watch window runs out.
      }
      if (!cancelled) timer = setTimeout(tick, PHOTO_WATCH_INTERVAL_MS);
    }

    timer = setTimeout(tick, PHOTO_WATCH_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [watch]);

  if (!ready) return null;

  function finishOrder() {
    if (!ready) return;
    stashPhotoForPrintSheet(ready.url, ready.name, ready.rotateOnPrint, ready.count);
    setReady(null);
    // The print sheet reads the handed-off photo when it mounts, so if it is already open a client-side push would not reload it.
    if (pathname === "/photo-print-sheet") window.location.assign("/photo-print-sheet");
    else router.push("/photo-print-sheet");
  }

  return (
    <div className="ready-photo-popup" role="dialog" aria-label="Your photo is ready">
      <button className="ready-photo-close" type="button" onClick={() => setReady(null)} aria-label="Close">
        <X size={18} />
      </button>
      <div className="ready-photo-frame">
        <img src={apiUrl(ready.url)} alt="Your photo" />
      </div>
      <strong className="ready-photo-title">Your photo is ready!</strong>
      <button className="ready-photo-cta" type="button" onClick={finishOrder}>
        Finish your order
      </button>
    </div>
  );
}
