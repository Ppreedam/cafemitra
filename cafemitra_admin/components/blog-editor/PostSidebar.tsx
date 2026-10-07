"use client";

import React, { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { Check, ExternalLink, History, ImagePlus, Images, RefreshCw, Trash2, Upload, X } from "lucide-react";
import MediaLibrary from "../MediaLibrary";
import {
  fetchBlogRevisions,
  uploadBlogImage,
  type AdminBlogArticle,
  type AdminBlogArticleInput,
  type AdminBlogRevision,
} from "@/lib/api";

const inputCls = "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";
const NEW_CATEGORY = "__new__";
const DEFAULT_CATEGORIES = ["Guide", "News", "Tutorial", "Update"];
const MIN_COVER_WIDTH = 1200;
const MIN_COVER_HEIGHT = 675;

type Props = {
  form: AdminBlogArticleInput;
  set: <K extends keyof AdminBlogArticleInput>(key: K, value: AdminBlogArticleInput[K]) => void;
  article: AdminBlogArticle | null; // the saved article being edited (null for a new one)
  categories: string[]; // categories already used by other articles
  wordCount: number;
  readMinutes: number;
  siteUrl: string;
  editor: Editor | null; // the visual editor, when it is mounted
  keepModifiedDate: boolean;
  onKeepModifiedDate: (value: boolean) => void;
  onRestoreRevision: (revision: AdminBlogRevision) => void;
  onTrash: () => void;
  onRestoreFromTrash: () => void;
  onDeleteForever: () => void;
};

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${name}${n === 1 ? "" : "s"} ago`;
    }
  }
  return "just now";
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-700">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-slate-900" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-medium text-slate-800">{label}</span>
      <span className="min-w-0 text-right text-indigo-600">{children}</span>
    </div>
  );
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image."));
    };
    img.src = url;
  });
}

function FeaturedImage({ form, set }: Pick<Props, "form" | "set">) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const dims = await readImageSize(file);
      if (dims.width < MIN_COVER_WIDTH || dims.height < MIN_COVER_HEIGHT) {
        throw new Error(`Featured image should be at least ${MIN_COVER_WIDTH}x${MIN_COVER_HEIGHT} pixels (this one is ${dims.width}x${dims.height}).`);
      }
      const { url } = await uploadBlogImage(file);
      set("coverImage", url);
      setSize(dims);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-medium text-slate-800">Featured Image</div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />

      {form.coverImage ? (
        <div className="group relative mb-2 overflow-hidden rounded-md border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={form.coverImage}
            alt={form.coverImageAlt || "Featured"}
            className="h-44 w-full object-cover"
            onLoad={(e) => setSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => {
                set("coverImage", "");
                set("coverImageAlt", "");
                setSize(null);
              }}
              className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white"
            >
              <Trash2 size={14} /> Remove
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <RefreshCw size={14} /> Replace
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex h-44 flex-col items-center justify-center gap-2 rounded-md bg-slate-100 text-sm text-slate-500">
          <ImagePlus size={30} className="text-slate-400" />
          No featured image selected
        </div>
      )}

      {size && form.coverImage && (
        <div className="mb-2 text-xs text-slate-500">
          Current size: {size.width}x{size.height}px
          {(size.width < MIN_COVER_WIDTH || size.height < MIN_COVER_HEIGHT) && <span className="text-amber-600"> - smaller than recommended</span>}
        </div>
      )}
      {!form.coverImage && (
        <div className="mb-2 text-xs text-slate-500">
          The featured image should have a size of at least {MIN_COVER_WIDTH} by {MIN_COVER_HEIGHT} pixels. JPG, PNG, WebP or GIF, up to 5 MB.
        </div>
      )}
      {error && <div className="mb-2 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">{error}</div>}

      {!form.coverImage && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          <Upload size={16} /> {uploading ? "Uploading..." : "Set Featured Image"}
        </button>
      )}
      {uploading && form.coverImage && <div className="text-xs text-slate-500">Uploading...</div>}
      <button
        type="button"
        onClick={() => setShowLibrary(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        <Images size={16} /> Choose from media library
      </button>
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">Media library</div>
              <button type="button" onClick={() => setShowLibrary(false)} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <MediaLibrary
              onSelect={(item) => {
                set("coverImage", item.url);
                setSize(null);
                setShowLibrary(false);
              }}
            />
          </div>
        </div>
      )}

      <input
        className={`${inputCls} mt-2`}
        value={form.coverImage}
        onChange={(e) => set("coverImage", e.target.value)}
        placeholder="...or paste an image URL (https://...)"
      />
      {form.coverImage && (
        <input
          className={`${inputCls} mt-2`}
          value={form.coverImageAlt}
          maxLength={200}
          onChange={(e) => set("coverImageAlt", e.target.value)}
          placeholder="Alt text (describe the image)"
        />
      )}
    </div>
  );
}

function CategoryPicker({ form, set, categories }: Pick<Props, "form" | "set" | "categories">) {
  const options = Array.from(new Set([...DEFAULT_CATEGORIES, ...categories, form.category].filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const name = draft.trim();
    if (name) set("category", name.slice(0, 60));
    setAdding(false);
    setDraft("");
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 text-sm font-medium text-slate-800">Category</div>
      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            className={inputCls}
            value={draft}
            maxLength={60}
            placeholder="New category name"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setAdding(false);
            }}
          />
          <button type="button" onClick={commit} className="rounded-md bg-indigo-600 px-3 text-sm text-white">
            Add
          </button>
        </div>
      ) : (
        <select
          className={inputCls}
          value={form.category}
          onChange={(e) => (e.target.value === NEW_CATEGORY ? setAdding(true) : set("category", e.target.value))}
        >
          {options.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ New category...</option>
        </select>
      )}
    </div>
  );
}

function RevisionsPanel({ articleId, onRestore }: { articleId: number; onRestore: (revision: AdminBlogRevision) => void }) {
  const [revisions, setRevisions] = useState<AdminBlogRevision[] | null>(null);
  const [error, setError] = useState("");

  React.useEffect(() => {
    let cancelled = false;
    fetchBlogRevisions(articleId)
      .then((res) => !cancelled && setRevisions(res.revisions))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load revisions."));
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  if (error) return <div className="text-xs text-red-600">{error}</div>;
  if (!revisions) return <div className="text-xs text-slate-500">Loading...</div>;
  if (!revisions.length) return <div className="text-xs text-slate-500">No revisions yet.</div>;
  return (
    <ul className="max-h-56 space-y-1.5 overflow-y-auto">
      {revisions.map((revision, index) => (
        <li key={revision.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5 text-xs">
          <span className="min-w-0">
            <span className="block truncate font-medium text-slate-700">
              {index === 0 ? "Latest save" : new Date(revision.createdAt).toLocaleString("en-IN")}
            </span>
            <span className="block truncate text-slate-500">{revision.createdBy || "unknown"} · {timeAgo(revision.createdAt)}</span>
          </span>
          {index > 0 && (
            <button type="button" onClick={() => onRestore(revision)} className="shrink-0 text-indigo-600 hover:underline">
              Restore
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function BlockPanel({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      image: e.isActive("image") ? (e.getAttributes("image") as { src?: string; alt?: string; title?: string }) : null,
      headingLevel: e.isActive("heading") ? (e.getAttributes("heading").level as number) : 0,
      linkHref: e.isActive("link") ? ((e.getAttributes("link").href as string) ?? "") : null,
      list: e.isActive("bulletList") ? "Bullet list" : e.isActive("orderedList") ? "Numbered list" : "",
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
    }),
  });

  const type = state.image
    ? "Image"
    : state.headingLevel
      ? `Heading ${state.headingLevel}`
      : state.codeBlock
        ? "Code block"
        : state.quote
          ? "Quote"
          : state.list || "Paragraph";

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="text-xs uppercase tracking-wide text-slate-500">Selected block</div>
        <div className="text-sm font-medium text-slate-800">{type}</div>
      </div>

      {state.image && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {state.image.src && <img src={state.image.src} alt={state.image.alt ?? ""} className="h-28 w-full rounded-md border border-slate-200 object-cover" />}
          <label className="block text-sm text-slate-700">
            <div className="mb-1 font-medium">Alt text</div>
            <input
              className={inputCls}
              value={state.image.alt ?? ""}
              placeholder="Describe the image"
              onChange={(e) => editor.chain().updateAttributes("image", { alt: e.target.value }).run()}
            />
            {!(state.image.alt ?? "").trim() && <div className="mt-1 text-xs text-amber-600">Add alt text - it is needed for SEO and accessibility.</div>}
          </label>
          <label className="block text-sm text-slate-700">
            <div className="mb-1 font-medium">Image URL</div>
            <input className={inputCls} value={state.image.src ?? ""} onChange={(e) => editor.chain().updateAttributes("image", { src: e.target.value }).run()} />
          </label>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteSelection().run()}
            className="flex items-center gap-1 text-sm text-red-600 hover:underline"
          >
            <Trash2 size={14} /> Remove image
          </button>
        </div>
      )}

      {state.headingLevel > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-1 text-sm font-medium text-slate-800">Heading level</div>
          <div className="flex flex-wrap gap-1">
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => editor.chain().focus().setHeading({ level }).run()}
                className={`h-8 w-10 rounded-md border text-sm ${state.headingLevel === level ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600"}`}
              >
                H{level}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.linkHref !== null && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
          <label className="block text-sm text-slate-700">
            <div className="mb-1 font-medium">Link URL</div>
            <input
              className={inputCls}
              value={state.linkHref}
              onChange={(e) => editor.chain().extendMarkRange("link").setLink({ href: e.target.value }).run()}
            />
          </label>
          <button
            type="button"
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
            className="text-sm text-red-600 hover:underline"
          >
            Remove link
          </button>
        </div>
      )}

      {!state.image && !state.headingLevel && state.linkHref === null && (
        <div className="text-xs text-slate-500">Click an image, heading or link in the editor to change its settings here.</div>
      )}
    </div>
  );
}

export default function PostSidebar(props: Props) {
  const { form, set, article, categories, wordCount, readMinutes, siteUrl, editor, keepModifiedDate, onKeepModifiedDate } = props;
  const [panel, setPanel] = useState<"post" | "block">("post");
  const [editingExcerpt, setEditingExcerpt] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [copied, setCopied] = useState(false);

  const isFuture = !!form.publishAt && new Date(form.publishAt) > new Date();
  const statusInfo = article?.isTrashed
    ? { text: "In trash", dot: "bg-red-500" }
    : article?.isLive
      ? { text: "Published", dot: "bg-emerald-500" }
      : article?.isScheduled
        ? { text: "Scheduled", dot: "bg-amber-500" }
        : { text: "Draft", dot: "bg-slate-400" };
  const link = `${siteUrl}/blog/${form.slug || ""}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
        {(
          [
            ["post", "Post"],
            ["block", "Block"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={`flex-1 rounded-md py-1.5 font-medium ${panel === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "block" ? (
        editor ? (
          <BlockPanel editor={editor} />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Switch to the <strong>Visual</strong> view in the Content tab to edit blocks.
          </div>
        )
      ) : (
        <>
          <FeaturedImage form={form} set={set} />
          <CategoryPicker form={form} set={set} categories={categories} />

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <label className="block text-sm text-slate-700">
              <div className="mb-2 font-medium text-slate-800">Publication Time</div>
              <input
                type="datetime-local"
                className={inputCls}
                value={toDatetimeLocal(form.publishAt)}
                onChange={(e) => set("publishAt", e.target.value ? e.target.value : null)}
              />
              <div className="mt-1 text-xs text-slate-500">Leave blank to publish immediately. A future time schedules it.</div>
            </label>
          </div>

          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-sm font-medium text-slate-800">Image Settings</div>
            <Switch label="Lazy Loading" checked={form.lazyLoadImages} onChange={(v) => set("lazyLoadImages", v)} />
            <Switch label="Alt Text Required" checked={form.requireImageAlt} onChange={(v) => set("requireImageAlt", v)} />
            <Switch label="Auto Caption" checked={form.autoCaptionImages} onChange={(v) => set("autoCaptionImages", v)} />
            <div className="text-xs text-slate-500">
              Lazy loading defers off-screen images. Auto caption shows each image&apos;s alt text under it. When alt text is required, publishing is blocked
              while an image has none.
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm font-medium text-slate-600">Excerpt</div>
            {editingExcerpt ? (
              <>
                <textarea
                  autoFocus
                  className={inputCls}
                  rows={4}
                  maxLength={320}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                />
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{form.excerpt.length}/320 - shown on the blog list</span>
                  <button type="button" onClick={() => setEditingExcerpt(false)} className="text-indigo-600 hover:underline">
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="line-clamp-3">{form.excerpt || <span className="text-slate-400">No excerpt yet.</span>}</p>
                </div>
                <button type="button" onClick={() => setEditingExcerpt(true)} className="mt-1 text-sm text-indigo-600 hover:underline">
                  Edit excerpt
                </button>
              </>
            )}
          </div>

          <div className="text-sm text-slate-500">
            <p>
              {wordCount} words, {readMinutes} minute{readMinutes === 1 ? "" : "s"} read time.
            </p>
            <p>{article ? `Last edited ${timeAgo(article.updatedAt)}.` : "Not saved yet."}</p>
          </div>

          <div className="space-y-2.5">
            <Row label="Status">
              <span className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                {statusInfo.text}
              </span>
            </Row>
            <Row label="Publish">
              {form.publishAt ? new Date(form.publishAt).toLocaleString("en-IN") : "Not scheduled"}
              {isFuture && <span className="ml-1 text-amber-600">(scheduled)</span>}
            </Row>
            <Row label="Link">
              <span className="inline-flex max-w-[170px] items-center gap-1.5">
                <button type="button" onClick={copyLink} title="Copy link" className="truncate hover:underline">
                  {copied ? "Copied!" : `/blog/${form.slug || "..."}`}
                </button>
                {article?.isLive && form.slug && (
                  <a href={link} target="_blank" rel="noreferrer" aria-label="View on site">
                    <ExternalLink size={13} />
                  </a>
                )}
              </span>
            </Row>
            <Row label="Author">
              {editingAuthor ? (
                <input
                  autoFocus
                  className="w-40 rounded border border-slate-300 px-1.5 py-0.5 text-right text-sm text-slate-800"
                  value={form.authorName}
                  maxLength={80}
                  onChange={(e) => set("authorName", e.target.value)}
                  onBlur={() => setEditingAuthor(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingAuthor(false)}
                />
              ) : (
                <button type="button" onClick={() => setEditingAuthor(true)} className="max-w-[170px] truncate hover:underline" title="Click to edit">
                  {form.authorName || "RepetiGo Team"}
                </button>
              )}
            </Row>
            <Row label="Template">
              <select
                className="rounded border border-slate-200 bg-white px-1 py-0.5 text-sm text-indigo-600"
                value={form.template}
                onChange={(e) => set("template", e.target.value as AdminBlogArticleInput["template"])}
              >
                <option value="default">Default template</option>
                <option value="wide">Wide template</option>
              </select>
            </Row>
            <Row label="Revisions">
              {article ? (
                <button type="button" onClick={() => setShowRevisions((v) => !v)} className="inline-flex items-center gap-1 hover:underline">
                  <History size={13} /> {article.revisionCount}
                </button>
              ) : (
                "-"
              )}
            </Row>
            {showRevisions && article && <RevisionsPanel articleId={article.id} onRestore={props.onRestoreRevision} />}
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5" checked={keepModifiedDate} onChange={(e) => onKeepModifiedDate(e.target.checked)} disabled={!article} />
            <span>
              Don&apos;t update the modified date
              <span className="block text-xs text-slate-500">The next save keeps the current &quot;last edited&quot; time.</span>
            </span>
          </label>

          {article &&
            (article.isTrashed ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={props.onRestoreFromTrash}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-emerald-300 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  <Check size={15} /> Restore as draft
                </button>
                <button
                  type="button"
                  onClick={props.onDeleteForever}
                  className="w-full rounded-md border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete permanently
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={props.onTrash}
                className="w-full rounded-md border border-red-300 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                Move to trash
              </button>
            ))}
        </>
      )}
    </div>
  );
}
