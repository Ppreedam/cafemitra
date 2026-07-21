"use client";

import { useState } from "react";
import { Download, Globe2, Image as ImageIcon, LoaderCircle, Monitor, ShieldCheck } from "lucide-react";
import { apiUrl } from "../../../lib/api";
import "../image-preview-fixes.css";

export default function WebsiteToImageClient() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");
  const [fullPage, setFullPage] = useState(true);
  const [width, setWidth] = useState(1440);
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; blob: Blob; name: string } | null>(null);

  async function capture() {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError("");
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);

    try {
      const response = await fetch(apiUrl("/api/tools/website-to-image/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), format, width, fullPage, quality }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Website screenshot could not be created.");
      }
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Screenshot service returned an invalid file.");
      const finalUrl = URL.createObjectURL(blob);
      const host = new URL(normalizeUrl(url)).hostname.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "-");
      setResult({ url: finalUrl, blob, name: `${host}-${fullPage ? "full-page" : "viewport"}.${blob.type.includes("jpeg") ? "jpg" : "png"}` });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Website screenshot could not be created.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="website-image-layout">
      <main>
        <div className="website-url-card">
          <span>
            <Globe2 size={22} />
          </span>
          <label>
            <small>Website URL</small>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void capture();
              }}
              placeholder="https://example.com"
            />
          </label>
          <button type="button" disabled={!url.trim() || busy} onClick={capture}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <ImageIcon size={18} />}
            {busy ? "Capturing..." : "Capture full page"}
          </button>
        </div>
        <section className={`website-capture-preview ${result ? "ready" : ""}`}>
          {busy ? (
            <div>
              <LoaderCircle className="spin" size={34} />
              <strong>Loading and capturing the complete webpage...</strong>
              <small>Long pages can take a little longer.</small>
            </div>
          ) : result ? (
            <img src={result.url} alt="Full webpage screenshot" />
          ) : (
            <div>
              <Monitor size={44} />
              <strong>Your full-page screenshot will appear here</strong>
              <small>Enter a public website URL and start capture.</small>
            </div>
          )}
        </section>
        {result ? (
          <footer>
            <span>{formatBytes(result.blob.size)} - {fullPage ? "Full-page capture" : "Viewport capture"}</span>
            <a href={result.url} download={result.name}>
              <Download size={18} /> Download image
            </a>
          </footer>
        ) : null}
      </main>
      <aside>
        <div className="image-transform-side-title">
          <span>
            <Globe2 size={20} />
          </span>
          <div>
            <small>RepetiGo Image Tools</small>
            <h2>Capture settings</h2>
          </div>
        </div>
        <div className="image-transform-controls">
          <label>
            <span>Capture mode</span>
            <select value={fullPage ? "full" : "viewport"} onChange={(event) => setFullPage(event.target.value === "full")}>
              <option value="full">Full page</option>
              <option value="viewport">Viewport only</option>
            </select>
          </label>
          <label>
            <span>Browser width</span>
            <select value={width} onChange={(event) => setWidth(Number(event.target.value))}>
              <option value="1280">Desktop - 1280px</option>
              <option value="1440">Wide desktop - 1440px</option>
              <option value="1920">Full HD - 1920px</option>
              <option value="768">Tablet - 768px</option>
              <option value="390">Mobile - 390px</option>
              <option value="375">Mobile - 375px</option>
            </select>
          </label>
          <label>
            <span>Output format</span>
            <select value={format} onChange={(event) => setFormat(event.target.value as "png" | "jpeg")}>
              <option value="jpeg">JPG - smaller file</option>
              <option value="png">PNG - best quality</option>
            </select>
          </label>
          {format === "jpeg" ? (
            <label>
              <span>JPG quality</span>
              <select value={quality} onChange={(event) => setQuality(Number(event.target.value))}>
                <option value="70">Compressed - 70%</option>
                <option value="90">High - 90%</option>
                <option value="100">Maximum - 100%</option>
              </select>
            </label>
          ) : null}
          <div className="website-capture-note">
            <ShieldCheck size={18} />
            <p>Only public HTTP/HTTPS pages are allowed. Login, paywall, private network, and local URLs cannot be captured.</p>
          </div>
          <button className="image-transform-run" type="button" disabled={!url.trim() || busy} onClick={capture}>
            {busy ? <LoaderCircle className="spin" size={18} /> : <Globe2 size={18} />}
            Capture Website
          </button>
        </div>
      </aside>
      {error ? (
        <p className="image-transform-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function formatBytes(bytes: number) {
  return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(2)} MB`;
}
