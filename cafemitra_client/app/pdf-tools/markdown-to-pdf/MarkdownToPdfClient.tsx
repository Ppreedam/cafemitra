"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Expand, Palette, ShieldCheck } from "lucide-react";
import Link from "next/link";

const starterMarkdown = `# Welcome to RepetiGo

**RepetiGo** is built for print shops, cyber cafes, and document service counters that want to finish customer work faster, cleaner, and with fewer repeated steps.

## Our Motive

Small businesses handle the same document tasks every day: printing, PDF editing, image cleanup, passport photos, form filling, agreements, and customer file workflows. RepetiGo brings these tools into one simple platform so shop owners can focus on service instead of manual repetition.

## Our Vision

We want to make India's local document infrastructure faster, safer, and more professional.

- Reduce repetitive counter work
- Help shops serve customers with confidence
- Keep PDF and image tools easy to access
- Support automation without making the workflow complicated
- Build practical software for real print shop problems

## What RepetiGo Helps With

| Area | Purpose |
| --- | --- |
| Print Automation | Manage uploads, queues, and shop workflows |
| PDF Tools | Merge, split, compress, convert, edit, and secure PDFs |
| Image Tools | Resize, crop, rotate, watermark, and prepare images |
| Customer Workflows | Make daily document tasks more organized |

> RepetiGo is not only a tool collection. It is a practical workflow layer for modern document service businesses.

## Welcome Message

Thank you for using RepetiGo. Our goal is simple: help every shop work smarter, save time, reduce errors, and offer better document services from one reliable place.`;

const defaultCss = `body {
  font-family: Inter, Arial, sans-serif;
  color: #25364d;
}

h1, h2, h3 {
  color: #2f4054;
}

h1 {
  border-bottom: 3px solid #e8ebef;
  padding-bottom: 22px;
}

pre {
  background: #2b2b2b;
  color: #f8f8f2;
  border-radius: 4px;
  padding: 20px 24px;
}`;

type Tab = "markdown" | "css";
type PdfColorFactory = (r: number, g: number, b: number) => ReturnType<typeof import("pdf-lib").rgb>;

export default function MarkdownToPdfClient() {
  const [activeTab, setActiveTab] = useState<Tab>("markdown");
  const [markdown, setMarkdown] = useState(starterMarkdown);
  const [customCss, setCustomCss] = useState(defaultCss);
  const [fullscreen, setFullscreen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  useEffect(() => {
    return () => {
      if (download?.url) URL.revokeObjectURL(download.url);
    };
  }, [download?.url]);

  async function generatePdf() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const blob = await markdownToPdfBlob(markdown);
      const url = URL.createObjectURL(blob);
      const name = `repetigo-markdown-${Date.now()}.pdf`;
      setDownload((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return { url, name };
      });
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      anchor.remove();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "PDF download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={fullscreen ? "mdpdf-tool mdpdf-fullscreen" : "mdpdf-tool"}>
      <div className="mdpdf-topline">
        <Link href="/pdf-tools"><ArrowLeft size={17} /> PDF Tools</Link>
        <span><ShieldCheck size={16} /> Private browser preview</span>
      </div>
      <header className="mdpdf-actionbar">
        <div className="mdpdf-tabs">
          <button className={activeTab === "markdown" ? "active" : ""} type="button" onClick={() => setActiveTab("markdown")}>Markdown</button>
          <button className={activeTab === "css" ? "active" : ""} type="button" onClick={() => setActiveTab("css")}><Palette size={18} /> Custom CSS</button>
          <button type="button" onClick={() => setFullscreen((value) => !value)}><Expand size={18} /> {fullscreen ? "Exit" : "Fullscreen"}</button>
        </div>
        <h1>HTML Preview</h1>
        <button type="button" onClick={generatePdf} disabled={busy}><Download size={18} /> {busy ? "Generating..." : "Generate PDF"}</button>
      </header>
      {error ? <p className="mdpdf-status mdpdf-status-error">{error}</p> : null}
      {download ? <a className="mdpdf-status mdpdf-download-again" href={download.url} download={download.name}>Download again</a> : null}
      <section className="mdpdf-workbench">
        <div className="mdpdf-editor-panel">
          {activeTab === "markdown" ? (
            <textarea aria-label="Markdown source" className="mdpdf-source" spellCheck={false} value={markdown} onChange={(event) => setMarkdown(event.target.value)} />
          ) : (
            <textarea aria-label="Custom CSS" className="mdpdf-source mdpdf-css-source" spellCheck={false} value={customCss} onChange={(event) => setCustomCss(event.target.value)} />
          )}
        </div>
        <div className="mdpdf-preview-panel">
          <article className="mdpdf-preview">
            <style>{customCss}</style>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </section>
    </div>
  );
}

function markdownToHtml(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let listOpen = false;
  let tableBuffer: string[] = [];
  let codeOpen = false;
  let codeLanguage = "";
  let codeLines: string[] = [];

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  function flushTable() {
    if (!tableBuffer.length) return;
    if (tableBuffer.length < 2) {
      tableBuffer.forEach((line) => html.push(`<p>${inline(line)}</p>`));
      tableBuffer = [];
      return;
    }
    const rows = tableBuffer.map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean));
    html.push("<table><thead><tr>");
    rows[0].forEach((cell) => html.push(`<th>${inline(cell)}</th>`));
    html.push("</tr></thead><tbody>");
    rows.slice(2).forEach((row) => {
      html.push("<tr>");
      row.forEach((cell) => html.push(`<td>${inline(cell)}</td>`));
      html.push("</tr>");
    });
    html.push("</tbody></table>");
    tableBuffer = [];
  }

  lines.forEach((rawLine) => {
    const trimmed = rawLine.trim();
    if (codeOpen) {
      if (trimmed.startsWith("```")) {
        html.push(`<pre><code class="language-${escapeAttr(codeLanguage)}">${highlightCode(codeLines.join("\n"), codeLanguage)}</code></pre>`);
        codeOpen = false;
        codeLanguage = "";
        codeLines = [];
      } else {
        codeLines.push(rawLine);
      }
      return;
    }
    if (trimmed.startsWith("```")) {
      flushTable();
      closeList();
      codeOpen = true;
      codeLanguage = trimmed.slice(3).trim();
      return;
    }
    if (trimmed.includes("|") && /^\|?.+\|.+\|?$/.test(trimmed)) {
      closeList();
      tableBuffer.push(trimmed);
      return;
    }
    flushTable();
    if (!trimmed) {
      closeList();
      return;
    }
    if (/^---+$|^\*\*\*+$/.test(trimmed)) {
      closeList();
      html.push("<hr />");
      return;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (image) {
      closeList();
      html.push(`<figure><img src="${escapeAttrUrl(image[2])}" alt="${escapeAttrText(image[1] || "Markdown image")}" loading="lazy" /><figcaption>${inline(image[1] || "Image")}</figcaption></figure>`);
      return;
    }
    if (trimmed.startsWith(">")) {
      closeList();
      html.push(`<blockquote>${inline(trimmed.replace(/^>\s?/, ""))}</blockquote>`);
      return;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeList();
      html.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
      return;
    }
    const listItem = /^[-*+]\s+(.+)$/.exec(trimmed);
    if (listItem) {
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${inline(listItem[1])}</li>`);
      return;
    }
    closeList();
    html.push(`<p>${inline(trimmed)}</p>`);
  });

  if (codeOpen) html.push(`<pre><code class="language-${escapeAttr(codeLanguage)}">${highlightCode(codeLines.join("\n"), codeLanguage)}</code></pre>`);
  flushTable();
  closeList();
  return html.join("\n");
}

async function markdownToPdfBlob(source: string) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 52;
  const maxWidth = pageSize[0] - margin * 2;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;
  const colors = {
    navy: rgb(0.03, 0.09, 0.28),
    text: rgb(0.08, 0.16, 0.3),
    muted: rgb(0.36, 0.43, 0.56),
    blue: rgb(0.15, 0.39, 0.92),
    line: rgb(0.84, 0.88, 0.94),
    soft: rgb(0.94, 0.97, 1),
    codeBg: rgb(0.12, 0.14, 0.18),
  };
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let codeOpen = false;
  let codeLanguage = "";
  let codeLines: string[] = [];
  let tableRows: string[][] = [];

  function ensure(space: number) {
    if (y - space >= margin) return;
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  }

  function drawWrapped(text: string, options: { x?: number; size: number; font?: typeof regular; color?: ReturnType<typeof rgb>; width?: number; leading?: number }) {
    const font = options.font || regular;
    const x = options.x || margin;
    const width = options.width || maxWidth;
    const leading = options.leading || options.size * 1.55;
    wrapPdfText(text, width, font, options.size).forEach((line) => {
      ensure(leading);
      page.drawText(safePdfText(line), { x, y, size: options.size, font, color: options.color || colors.text });
      y -= leading;
    });
  }

  function drawCodeLine(line: string, language: string, x: number, baseline: number) {
    let cursor = x;
    tokenizeCodeForPdf(line, language, rgb).forEach((token) => {
      const text = safePdfText(token.text);
      if (!text) return;
      page.drawText(text, { x: cursor, y: baseline, size: 9, font: mono, color: token.color });
      cursor += mono.widthOfTextAtSize(text, 9);
    });
  }

  function flushCode() {
    if (!codeLines.length) return;
    const wrapped = codeLines.flatMap((line) => wrapCodeLine(line || " ", 82));
    ensure(wrapped.length * 13 + 22);
    page.drawRectangle({ x: margin, y: y - wrapped.length * 13 - 12, width: maxWidth, height: wrapped.length * 13 + 22, color: colors.codeBg });
    y -= 20;
    wrapped.forEach((line) => {
      drawCodeLine(line, codeLanguage, margin + 12, y);
      y -= 13;
    });
    y -= 12;
    codeLines = [];
    codeLanguage = "";
  }

  function flushTable() {
    if (!tableRows.length) return;
    if (tableRows.length < 2) {
      tableRows.forEach((row) => drawWrapped(row.join(" | "), { size: 10 }));
      tableRows = [];
      return;
    }
    const rows = tableRows.filter((_, index) => index !== 1);
    const colCount = Math.max(...rows.map((row) => row.length));
    const colWidth = maxWidth / Math.max(1, colCount);
    rows.forEach((row, rowIndex) => {
      ensure(32);
      const height = 28;
      page.drawRectangle({ x: margin, y: y - height + 8, width: maxWidth, height, color: rowIndex === 0 ? colors.soft : rgb(1, 1, 1), borderColor: colors.line, borderWidth: 1 });
      row.slice(0, colCount).forEach((cell, index) => {
        const font = rowIndex === 0 ? bold : regular;
        page.drawText(truncatePdfText(cell, colWidth, font, 8.5), { x: margin + index * colWidth + 8, y: y - 10, size: 8.5, font, color: colors.text });
      });
      y -= height;
    });
    y -= 12;
    tableRows = [];
  }

  async function drawImage(alt: string, url: string) {
    const cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl) && !/^data:image\//i.test(cleanUrl)) {
      drawWrapped(`${alt || "Image"}: ${cleanUrl}`, { size: 10, color: colors.muted });
      return;
    }
    try {
      const response = await fetch(cleanUrl);
      if (!response.ok) throw new Error("Image could not be loaded.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") || "";
      const image = contentType.includes("png") || cleanUrl.toLowerCase().includes(".png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const scale = Math.min(maxWidth / image.width, 260 / image.height, 1);
      const width = image.width * scale;
      const height = image.height * scale;
      ensure(height + 36);
      page.drawImage(image, { x: margin + (maxWidth - width) / 2, y: y - height, width, height });
      y -= height + 13;
      if (alt.trim()) drawWrapped(alt, { size: 8.5, color: colors.muted, leading: 12 });
      y -= 8;
    } catch {
      drawWrapped(`${alt || "Image"}: ${cleanUrl}`, { size: 10, color: colors.muted });
    }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (codeOpen) {
      if (trimmed.startsWith("```")) {
        codeOpen = false;
        flushCode();
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }
    if (trimmed.startsWith("```")) {
      flushTable();
      codeOpen = true;
      codeLanguage = trimmed.slice(3).trim();
      continue;
    }
    if (trimmed.includes("|") && /^\|?.+\|.+\|?$/.test(trimmed)) {
      tableRows.push(trimmed.split("|").map((cell) => cell.trim()).filter(Boolean));
      continue;
    }
    flushTable();
    if (!trimmed) {
      y -= 8;
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (image) {
      await drawImage(stripInline(image[1]), image[2]);
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const size = level === 1 ? 26 : level === 2 ? 16 : 13;
      y -= level === 1 ? 6 : 12;
      drawWrapped(stripInline(heading[2]), { size, font: bold, color: level === 1 ? colors.navy : colors.text, leading: size * 1.3 });
      if (level === 1) {
        ensure(12);
        page.drawLine({ start: { x: margin, y: y + 2 }, end: { x: pageSize[0] - margin, y: y + 2 }, thickness: 2, color: colors.line });
      }
      y -= level === 1 ? 18 : 8;
      continue;
    }
    const listItem = /^[-*+]\s+(.+)$/.exec(trimmed);
    if (listItem) {
      ensure(18);
      page.drawText("-", { x: margin + 14, y, size: 10, font: bold, color: colors.blue });
      drawWrapped(stripInline(listItem[1]), { x: margin + 32, size: 10.5, width: maxWidth - 32, leading: 16 });
      continue;
    }
    if (trimmed.startsWith(">")) {
      ensure(40);
      page.drawRectangle({ x: margin, y: y - 28, width: 4, height: 28, color: colors.blue });
      drawWrapped(stripInline(trimmed.replace(/^>\s?/, "")), { x: margin + 14, size: 10, width: maxWidth - 14, color: colors.muted });
      y -= 8;
      continue;
    }
    drawWrapped(stripInline(trimmed), { size: 10.5, leading: 17 });
  }

  flushCode();
  flushTable();
  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });
}

function inline(value: string) {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+|data:image\/[^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

function highlightCode(source: string, language: string) {
  const escaped = escapeHtml(source);
  const lang = language.toLowerCase();
  const withStrings = escaped.replace(/(&quot;.*?&quot;|'.*?'|`.*?`)/g, '<span class="mdpdf-token-string">$1</span>');
  const withComments = withStrings.replace(/(^|\s)(\/\/.*|#.*)$/gm, '$1<span class="mdpdf-token-comment">$2</span>');
  const withNumbers = withComments.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="mdpdf-token-number">$1</span>');
  const keywordPattern = lang.includes("python") ? /\b(def|return|if|else|elif|for|while|in|range|import|from|class|try|except|with|as|True|False|None)\b/g : /\b(function|return|const|let|var|if|else|for|while|class|new|async|await|import|from|export|true|false|null)\b/g;
  return withNumbers.replace(keywordPattern, '<span class="mdpdf-token-keyword">$1</span>').replace(/\b([a-zA-Z_$][\w$]*)(?=\()/g, '<span class="mdpdf-token-function">$1</span>');
}

function tokenizeCodeForPdf(source: string, language: string, rgb: PdfColorFactory) {
  const safe = safePdfText(source);
  const lang = language.toLowerCase();
  const keywords = lang.includes("python") ? new Set(["def", "return", "if", "else", "elif", "for", "while", "in", "range", "import", "from", "class", "try", "except", "with", "as", "True", "False", "None"]) : new Set(["function", "return", "const", "let", "var", "if", "else", "for", "while", "class", "new", "async", "await", "import", "from", "export", "true", "false", "null"]);
  const colors = { plain: rgb(0.9, 0.93, 0.98), keyword: rgb(0.78, 0.57, 0.92), string: rgb(0.62, 0.87, 0.7), number: rgb(0.97, 0.55, 0.42), comment: rgb(0.55, 0.58, 0.64), fn: rgb(1, 0.8, 0.42) };
  const tokens: Array<{ text: string; color: ReturnType<PdfColorFactory> }> = [];
  const parts = safe.match(/("[^"]*"|'[^']*'|`[^`]*`|\/\/.*|#.*|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_$][\w$]*\b|\s+|.)/g) || [safe];
  parts.forEach((part, index) => {
    let color = colors.plain;
    if (/^(\/\/|#)/.test(part)) color = colors.comment;
    else if (/^("|'|`)/.test(part)) color = colors.string;
    else if (/^\d/.test(part)) color = colors.number;
    else if (keywords.has(part)) color = colors.keyword;
    else if (/^[a-zA-Z_$]/.test(part) && parts[index + 1]?.startsWith("(")) color = colors.fn;
    tokens.push({ text: part, color });
  });
  return tokens;
}

function stripInline(value: string) { return value.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*_~]/g, ""); }
function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function escapeAttr(value: string) { return value.replace(/[^a-zA-Z0-9_-]/g, ""); }
function escapeAttrText(value: string) { return escapeHtml(value).replace(/"/g, "&quot;"); }
function escapeAttrUrl(value: string) { const url = value.trim(); return /^https?:\/\//i.test(url) || /^data:image\//i.test(url) ? escapeAttrText(url) : ""; }
function safePdfText(value: string) { return value.replace(/\u2260/g, "!=").replace(/\u2264/g, "<=").replace(/\u2265/g, ">=").replace(/\u2192/g, "->").replace(/\u2190/g, "<-").replace(/\u2013|\u2014/g, "-").replace(/\u201c|\u201d/g, '"').replace(/\u2018|\u2019/g, "'").replace(/\u2022/g, "-").replace(/[^\x20-\x7E]/g, "?"); }
function wrapCodeLine(line: string, maxChars: number) { if (line.length <= maxChars) return [line]; const chunks: string[] = []; for (let index = 0; index < line.length; index += maxChars) chunks.push(line.slice(index, index + maxChars)); return chunks; }
function wrapPdfText(text: string, maxWidth: number, font: { widthOfTextAtSize(value: string, size: number): number }, size: number) { const words = safePdfText(text).replace(/\s+/g, " ").trim().split(" "); const lines: string[] = []; let line = ""; words.forEach((word) => { const next = line ? `${line} ${word}` : word; if (font.widthOfTextAtSize(next, size) > maxWidth && line) { lines.push(line); line = word; } else line = next; }); if (line || !lines.length) lines.push(line); return lines; }
function truncatePdfText(text: string, maxWidth: number, font: { widthOfTextAtSize(value: string, size: number): number }, size: number) { const original = safePdfText(stripInline(text)); let value = original; while (value.length > 3 && font.widthOfTextAtSize(value, size) > maxWidth - 16) value = value.slice(0, -1); return value === original ? value : `${value.slice(0, -3)}...`; }
