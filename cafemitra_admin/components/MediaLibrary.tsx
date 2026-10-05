"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, ImagePlus, Maximize2, Trash2, Upload, X } from "lucide-react";
import { deleteMediaItem, fetchMediaItems, uploadMediaItem, type MediaItem } from "@/lib/api";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Upload / browse / delete images stored on the external media API.
 * With `onSelect` it also works as a picker (used by the blog's featured image).
 */
export default function MediaLibrary({ onSelect }: { onSelect?: (item: MediaItem) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Keyboard: Esc closes the full preview, arrows move between images.
  useEffect(() => {
    if (previewIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewIndex(null);
      else if (e.key === "ArrowLeft") setPreviewIndex((i) => (i === null ? i : Math.max(0, i - 1)));
      else if (e.key === "ArrowRight") setPreviewIndex((i) => (i === null ? i : Math.min(items.length - 1, i + 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, items.length]);

  const load = useCallback(async (nextPage: number, replace: boolean) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchMediaItems(nextPage);
      setItems((current) => (replace ? res.items : [...current, ...res.items]));
      setPage(nextPage);
      setHasMore(res.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, true);
  }, [load]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const { item } = await uploadMediaItem(file);
        setItems((current) => [item, ...current]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: MediaItem) {
    if (item.id == null) return;
    if (!window.confirm("Delete this image permanently? Articles that use it will show a broken image.")) return;
    setDeletingId(item.id);
    setError("");
    try {
      await deleteMediaItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the image.");
    } finally {
      setDeletingId(null);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(""), 1500);
    } catch {
      setError("Could not copy - select the URL manually.");
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFiles} />
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload images"}
        </button>
        <span className="text-xs text-slate-500">JPG, PNG, WebP or GIF, up to 5 MB each.</span>
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {!loading && items.length === 0 && !error && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 py-12 text-sm text-slate-500">
          <ImagePlus size={28} className="text-slate-400" /> No images uploaded yet.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={`${item.id}-${item.url}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setPreviewIndex(index)}
              aria-label={`View full image ${item.name || ""}`}
              className="group relative block w-full cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.name || "Uploaded image"} loading="lazy" className="h-32 w-full bg-slate-100 object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 size={22} className="text-white" />
              </span>
            </button>
            <div className="space-y-2 p-2">
              <div className="truncate text-xs text-slate-600" title={item.name}>
                {item.name || "image"} {item.size ? <span className="text-slate-400">· {formatSize(item.size)}</span> : null}
              </div>
              <div className="flex items-center gap-1">
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex-1 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Use this
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => copyUrl(item.url)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                >
                  {copiedUrl === item.url ? <Check size={13} /> : <Copy size={13} />} {copiedUrl === item.url ? "Copied" : "Copy URL"}
                </button>
                <button
                  type="button"
                  disabled={item.id == null || deletingId === item.id}
                  onClick={() => handleDelete(item)}
                  title={item.id == null ? "This image has no id and can't be deleted from here" : "Delete"}
                  aria-label="Delete image"
                  className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewIndex !== null && items[previewIndex] && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewIndex(null)}
        >
          <div className="flex max-h-full w-full max-w-5xl flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 text-sm text-white">
              <div className="min-w-0 truncate">
                {items[previewIndex].name || "image"}
                {items[previewIndex].size ? <span className="text-white/60"> · {formatSize(items[previewIndex].size)}</span> : null}
                <span className="text-white/60"> · {previewIndex + 1} / {items.length}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(items[previewIndex].url)}
                  className="flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1.5 text-xs hover:bg-white/25"
                >
                  {copiedUrl === items[previewIndex].url ? <Check size={14} /> : <Copy size={14} />} {copiedUrl === items[previewIndex].url ? "Copied" : "Copy URL"}
                </button>
                <a
                  href={items[previewIndex].url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-md bg-white/15 px-2.5 py-1.5 text-xs hover:bg-white/25"
                >
                  <ExternalLink size={14} /> Open
                </a>
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(items[previewIndex]);
                      setPreviewIndex(null);
                    }}
                    className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium hover:bg-indigo-700"
                  >
                    Use this
                  </button>
                )}
                <button type="button" onClick={() => setPreviewIndex(null)} aria-label="Close preview" className="rounded-md bg-white/15 p-1.5 hover:bg-white/25">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="relative flex min-h-0 items-center justify-center">
              {previewIndex > 0 && (
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setPreviewIndex(previewIndex - 1)}
                  className="absolute left-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={items[previewIndex].url} alt={items[previewIndex].name || "Uploaded image"} className="max-h-[78vh] max-w-full rounded-md object-contain" />
              {previewIndex < items.length - 1 && (
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setPreviewIndex(previewIndex + 1)}
                  className="absolute right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && <div className="py-4 text-center text-sm text-slate-500">Loading...</div>}
      {hasMore && !loading && (
        <div className="py-4 text-center">
          <button
            type="button"
            onClick={() => load(page + 1, false)}
            className="rounded-md border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
