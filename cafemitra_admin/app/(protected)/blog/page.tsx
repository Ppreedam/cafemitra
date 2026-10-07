"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Eye, ExternalLink, Monitor, Pencil, Save, Settings, Smartphone, Trash2 } from "lucide-react";
import { marked } from "marked";
import type { Editor } from "@tiptap/react";
import PostSidebar from "@/components/blog-editor/PostSidebar";
import RichTextEditor, { countWords } from "@/components/blog-editor/RichTextEditor";
import ScoreBadges from "@/components/blog-editor/ScoreBadges";
import TagsInput from "@/components/blog-editor/TagsInput";
import { computeScores } from "@/components/blog-editor/scoring";
import {
  createBlogArticle,
  deleteBlogArticle,
  fetchBlogArticlesAdmin,
  updateBlogArticle,
  type AdminBlogArticle,
  type AdminBlogArticleInput,
  type AdminBlogRevision,
  type BlogStatus,
} from "@/lib/api";

// Public website the articles are published on (used for "View" links).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://repetigo.com";

const emptyForm: AdminBlogArticleInput = {
  title: "",
  slug: "",
  category: "Guide",
  excerpt: "",
  content: "",
  coverImage: "",
  coverImageAlt: "",
  lazyLoadImages: false,
  requireImageAlt: true,
  autoCaptionImages: false,
  template: "default",
  metaTitle: "",
  metaDescription: "",
  tags: [],
  focusKeywords: [],
  authorName: "RepetiGo Team",
  status: "draft",
  publishAt: null,
};

type FormTab = "content" | "seo" | "tags";
type EditorMode = "visual" | "markdown" | "preview";

// A textarea that wraps long text onto new lines and grows to fit it (used for
// the title, where a single-line <input> would scroll sideways instead).
function AutoGrowTextarea({ value, className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return <textarea ref={ref} rows={1} value={value} className={`resize-none overflow-hidden whitespace-pre-wrap break-words ${className ?? ""}`} {...rest} />;
}

function statusLabel(article: AdminBlogArticle) {
  if (article.isTrashed) return { text: "Trash", cls: "bg-red-50 text-red-700" };
  if (article.isLive) return { text: "Live", cls: "bg-emerald-50 text-emerald-700" };
  if (article.isScheduled) return { text: "Scheduled", cls: "bg-amber-50 text-amber-700" };
  return { text: "Draft", cls: "bg-slate-100 text-slate-600" };
}

export default function BlogAdminPage() {
  const [articles, setArticles] = useState<AdminBlogArticle[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<AdminBlogArticleInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<FormTab>("content");
  const [mode, setMode] = useState<EditorMode>("visual");
  const [editorKey, setEditorKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [showSidebar, setShowSidebar] = useState(true);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [keepModifiedDate, setKeepModifiedDate] = useState(false);
  const [showTrash, setShowTrash] = useState(false);

  const currentArticle = useMemo(() => articles.find((a) => a.id === editingId) ?? null, [articles, editingId]);
  const categories = useMemo(() => Array.from(new Set(articles.map((a) => a.category).filter(Boolean))), [articles]);
  const trashedCount = articles.filter((a) => a.isTrashed).length;
  const visibleArticles = articles.filter((a) => a.isTrashed === showTrash);

  const scores = useMemo(() => computeScores(form), [form]);
  const wordCount = useMemo(() => countWords(form.content), [form.content]);
  const readMinutes = Math.max(1, Math.round(wordCount / 200));
  const previewHtml = useMemo(() => (mode === "preview" ? (marked.parse(form.content, { async: false }) as string) : ""), [mode, form.content]);

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function load() {
    fetchBlogArticlesAdmin()
      .then((res) => setArticles(res.articles))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load articles."));
  }

  useEffect(load, []);

  function set<K extends keyof AdminBlogArticleInput>(key: K, value: AdminBlogArticleInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  function resetEditorView() {
    setTab("content");
    setMode("visual");
    setDevice("desktop");
    setEditorKey((k) => k + 1);
    setKeepModifiedDate(false);
    setDirty(false);
  }

  function confirmDiscard() {
    return !dirty || window.confirm("You have unsaved changes. Discard them?");
  }

  function startNew() {
    if (!confirmDiscard()) return;
    setForm(emptyForm);
    resetEditorView();
    setEditingId(null);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  function startEdit(article: AdminBlogArticle) {
    if (!confirmDiscard()) return;
    resetEditorView();
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      coverImageAlt: article.coverImageAlt ?? "",
      lazyLoadImages: article.lazyLoadImages ?? false,
      requireImageAlt: article.requireImageAlt ?? true,
      autoCaptionImages: article.autoCaptionImages ?? false,
      template: article.template ?? "default",
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      tags: article.tags ?? [],
      focusKeywords: article.focusKeywords ?? [],
      authorName: article.authorName,
      status: article.status,
      publishAt: article.publishAt,
    });
    setEditingId(article.id);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setError("");
    setNotice("");
    const payload = {
      ...form,
      status,
      publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : null,
      keepModifiedDate: !!editingId && keepModifiedDate,
    };
    try {
      const res = editingId ? await updateBlogArticle(editingId, payload) : await createBlogArticle(payload);
      const saved = res.article;
      setNotice(
        status === "draft"
          ? "Saved as draft."
          : saved.isScheduled
            ? `Scheduled - it goes live on ${new Date(saved.publishAt as string).toLocaleString("en-IN")}.`
            : "Published - it is live on the website."
      );
      setEditingId(saved.id);
      setForm((current) => ({ ...current, slug: saved.slug, status: saved.status, publishAt: saved.publishAt }));
      setDirty(false);
      setKeepModifiedDate(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the article.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: AdminBlogArticle) {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteBlogArticle(article.id);
      if (editingId === article.id) {
        setShowForm(false);
        setEditingId(null);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the article.");
    }
  }

  async function changeStatus(article: AdminBlogArticle, status: BlogStatus, doneMessage: string) {
    setError("");
    setNotice("");
    try {
      await updateBlogArticle(article.id, { status, keepModifiedDate: true });
      setNotice(doneMessage);
      if (editingId === article.id) {
        setShowForm(false);
        setEditingId(null);
        setDirty(false);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the article.");
    }
  }

  function moveToTrash(article: AdminBlogArticle) {
    if (!window.confirm(`Move "${article.title}" to trash? It will be taken off the website.`)) return;
    void changeStatus(article, "trash", "Moved to trash.");
  }

  function restoreFromTrash(article: AdminBlogArticle) {
    void changeStatus(article, "draft", "Restored as a draft.");
  }

  function restoreRevision(revision: AdminBlogRevision) {
    if (!window.confirm("Replace the current title, summary and content with this revision? (Save to keep it.)")) return;
    setForm((current) => ({ ...current, title: revision.title, excerpt: revision.excerpt, content: revision.content }));
    setEditorKey((k) => k + 1);
    setDirty(true);
  }

  const inputCls = "w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Blog</h1>
        <button onClick={startNew} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          New article
        </button>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Write articles here and publish without a deploy. Set a future date to schedule one. The page is rendered on the server, so search
        engines read the full text.
      </p>

      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {notice && <div className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</div>}

      {showForm && (
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Top bar: title + actions */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setTab("content");
                setMode("preview");
              }}
              className="flex h-9 items-center gap-2 rounded-md bg-blue-500 px-3 text-sm font-medium text-white hover:bg-blue-600"
            >
              <Eye size={16} /> Preview
            </button>

            <div className="min-w-0 flex-1 text-center">
              <div className="truncate text-lg font-medium text-slate-900">{form.title || "Create title here"}</div>
              <div className="text-xs text-slate-500">
                {wordCount} words · {readMinutes} min read
                {dirty && <span className="ml-2 text-amber-600">Unsaved changes</span>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                title="Desktop preview"
                aria-label="Desktop preview"
                aria-pressed={device === "desktop" && mode === "preview"}
                onClick={() => {
                  setDevice("desktop");
                  setTab("content");
                  setMode("preview");
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 ${device === "desktop" && mode === "preview" ? "bg-slate-100 text-indigo-700" : "text-slate-600"}`}
              >
                <Monitor size={18} />
              </button>
              <button
                type="button"
                title="Mobile preview"
                aria-label="Mobile preview"
                aria-pressed={device === "mobile" && mode === "preview"}
                onClick={() => {
                  setDevice("mobile");
                  setTab("content");
                  setMode("preview");
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 ${device === "mobile" && mode === "preview" ? "bg-slate-100 text-indigo-700" : "text-slate-600"}`}
              >
                <Smartphone size={18} />
              </button>
              <ScoreBadges scores={scores} />
              <button
                disabled={saving}
                onClick={() => save("draft")}
                className="flex h-9 items-center gap-1.5 rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={16} /> {saving ? "Saving..." : "Save"}
              </button>
              <button
                disabled={saving}
                onClick={() => save("published")}
                className="h-9 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {form.publishAt && new Date(form.publishAt) > new Date() ? "Schedule" : "Publish"}
              </button>
              <button
                type="button"
                title={showSidebar ? "Hide settings panel" : "Show settings panel"}
                aria-label="Toggle settings panel"
                aria-pressed={showSidebar}
                onClick={() => setShowSidebar((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 ${showSidebar ? "text-indigo-700" : "text-slate-600"}`}
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => {
                  if (confirmDiscard()) {
                    setShowForm(false);
                    setDirty(false);
                  }
                }}
                className="px-2 py-1.5 text-sm text-slate-500 hover:underline"
              >
                Close
              </button>
            </div>
          </div>

          <div className={`grid ${showSidebar ? "lg:grid-cols-[1fr_320px]" : ""}`}>
            {/* Main column */}
            <div className="min-w-0 space-y-4 p-4">
              <AutoGrowTextarea
                className="block w-full border-0 border-b border-slate-200 px-0 py-2 text-2xl font-bold leading-snug text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none"
                placeholder="Article title"
                value={form.title}
                onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
              />

              <label className="block text-sm text-slate-700">
                <div className="mb-1 font-medium">Short summary</div>
                <AutoGrowTextarea
                  className={inputCls}
                  maxLength={320}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="1-2 lines shown under the title on the blog list and used as the SEO description if none is set."
                />
                <div className="mt-1 text-xs text-slate-500">{form.excerpt.length}/320 - leave empty to use the start of the article.</div>
              </label>

              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
                {(
                  [
                    ["content", "Content"],
                    ["seo", "Meta & SEO"],
                    ["tags", "Tags & Keywords"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-md px-3 py-1.5 font-medium ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "content" && (
                <div className="space-y-2">
                  <div className="flex gap-3 text-xs">
                    {(
                      [
                        ["visual", "Visual"],
                        ["markdown", "Markdown"],
                        ["preview", "Preview"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        className={`border-b-2 pb-1 font-medium ${mode === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {mode === "visual" && (
                    <RichTextEditor key={editorKey} value={form.content} onChange={(markdown) => set("content", markdown)} onEditor={setEditor} />
                  )}
                  {mode === "markdown" && (
                    <textarea
                      className={`${inputCls} font-mono`}
                      rows={22}
                      value={form.content}
                      onChange={(e) => set("content", e.target.value)}
                      placeholder={"## Heading\n\nParagraph text with **bold** and [a link](https://repetigo.com).\n\n- bullet\n- bullet\n\n![image alt](https://image-url)"}
                    />
                  )}
                  {mode === "preview" && (
                    <div className="rounded-md border border-slate-300 bg-slate-100 p-3">
                      <div
                        className={`blog-preview mx-auto min-h-[420px] rounded-md border border-slate-200 bg-white px-4 py-3 transition-all ${device === "mobile" ? "max-w-[390px]" : "max-w-full"}`}
                      >
                        <h1 className="!mt-0">{form.title || "Article title"}</h1>
                        {form.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={form.coverImage} alt={form.title} />
                        )}
                        {form.content.trim() ? <div dangerouslySetInnerHTML={{ __html: previewHtml }} /> : <p className="text-slate-400">Nothing to preview yet.</p>}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-slate-500">The article is saved as Markdown - the Visual and Markdown views edit the same text.</div>
                </div>
              )}

              {tab === "seo" && (
                <div className="space-y-4">
                  <label className="block text-sm text-slate-700">
                    <div className="mb-1 font-medium">URL slug</div>
                    <input
                      className={`${inputCls} font-mono`}
                      value={form.slug}
                      placeholder="auto-generated from the title"
                      onChange={(e) => set("slug", e.target.value)}
                    />
                    <div className="mt-1 break-all text-xs text-slate-500">
                      {SITE_URL}/blog/{form.slug || "..."} - don&apos;t change it after publishing.
                    </div>
                  </label>
                  <label className="block text-sm text-slate-700">
                    <div className="mb-1 font-medium">SEO title (optional)</div>
                    <input className={inputCls} value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
                    <div className={`mt-1 text-xs ${form.metaTitle.length > 60 ? "text-amber-600" : "text-slate-500"}`}>
                      {form.metaTitle.length}/60 characters recommended
                    </div>
                  </label>
                  <label className="block text-sm text-slate-700">
                    <div className="mb-1 font-medium">SEO description (optional - defaults to the summary)</div>
                    <textarea
                      className={inputCls}
                      rows={3}
                      maxLength={320}
                      value={form.metaDescription}
                      onChange={(e) => set("metaDescription", e.target.value)}
                    />
                    <div className={`mt-1 text-xs ${form.metaDescription.length > 160 ? "text-amber-600" : "text-slate-500"}`}>
                      {form.metaDescription.length}/160 characters recommended
                    </div>
                  </label>
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Search result preview</div>
                    <div className="truncate text-base text-indigo-700">{form.metaTitle || `${form.title || "Article title"} | RepetiGo`}</div>
                    <div className="truncate font-mono text-xs text-emerald-700">
                      {SITE_URL}/blog/{form.slug || "..."}
                    </div>
                    <div className="line-clamp-2 text-sm text-slate-600">{form.metaDescription || form.excerpt || "No description yet."}</div>
                  </div>
                </div>
              )}

              {tab === "tags" && (
                <div className="grid gap-5 md:grid-cols-2">
                  <TagsInput label="Article tags" values={form.tags} onChange={(v) => set("tags", v)} placeholder="e.g. passport photo, aadhaar" />
                  <TagsInput
                    label="Focus keywords"
                    values={form.focusKeywords}
                    onChange={(v) => set("focusKeywords", v)}
                    placeholder="Main keywords this article should rank for"
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={`${showSidebar ? "" : "hidden"} border-t border-slate-200 bg-slate-50/60 p-4 lg:border-l lg:border-t-0`}>
              <PostSidebar
                form={form}
                set={set}
                article={currentArticle}
                categories={categories}
                wordCount={wordCount}
                readMinutes={readMinutes}
                siteUrl={SITE_URL}
                editor={mode === "visual" && tab === "content" ? editor : null}
                keepModifiedDate={keepModifiedDate}
                onKeepModifiedDate={setKeepModifiedDate}
                onRestoreRevision={restoreRevision}
                onTrash={() => currentArticle && moveToTrash(currentArticle)}
                onRestoreFromTrash={() => currentArticle && restoreFromTrash(currentArticle)}
                onDeleteForever={() => currentArticle && handleDelete(currentArticle)}
              />
            </aside>
          </div>
        </div>
      )}

      <div className="mb-2 flex gap-3 text-sm">
        <button onClick={() => setShowTrash(false)} className={`border-b-2 pb-1 font-medium ${!showTrash ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500"}`}>
          Articles ({articles.length - trashedCount})
        </button>
        <button onClick={() => setShowTrash(true)} className={`border-b-2 pb-1 font-medium ${showTrash ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500"}`}>
          Trash ({trashedCount})
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Article</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Publish date</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visibleArticles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  {showTrash ? "Trash is empty." : "No articles yet."}
                </td>
              </tr>
            )}
            {visibleArticles.map((article) => {
              const label = statusLabel(article);
              return (
                <tr key={article.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">{article.title}</div>
                    <div className="font-mono text-xs text-slate-500">/blog/{article.slug}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${label.cls}`}>{label.text}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{article.publishAt ? new Date(article.publishAt).toLocaleString("en-IN") : "-"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-3">
                      {article.isLive && (
                        <a href={`${SITE_URL}/blog/${article.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600" aria-label="View on site">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      {article.isTrashed ? (
                        <>
                          <button onClick={() => restoreFromTrash(article)} className="text-xs font-medium text-emerald-700 hover:underline">
                            Restore
                          </button>
                          <button onClick={() => handleDelete(article)} className="text-red-600 hover:text-red-700" aria-label="Delete permanently">
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(article)} className="text-slate-600 hover:text-slate-900" aria-label="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => moveToTrash(article)} className="text-red-600 hover:text-red-700" aria-label="Move to trash">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
