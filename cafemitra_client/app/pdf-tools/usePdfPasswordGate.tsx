"use client";

import { useRef, useState, type ReactNode } from "react";
import { Lock, X } from "lucide-react";

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

type PendingUnlock = { file: File; error: string; busy: boolean; resolve: (file: File | null) => void };

/// Every PDF tool eventually loads the uploaded bytes with pdfjs/pdf-lib,
/// which just throws a generic "could not be opened" error on an encrypted
/// PDF - the user has no way to actually get past that. This hook is the
/// fix: call `gateFiles(files)` at the very top of whatever function first
/// receives the uploaded FileList/File[] (drop handler, file input, "add
/// more" input - wherever they all funnel through), before those files are
/// used for anything else. It hands back the SAME files, except any
/// encrypted PDF is replaced with a real decrypted File (same name) once
/// the user enters the correct password in the popup - or dropped from the
/// returned array if they cancel. Non-PDF files and already-open PDFs pass
/// straight through untouched.
export function usePdfPasswordGate() {
  const [pending, setPending] = useState<PendingUnlock | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function gateFiles(files: FileList | File[]): Promise<File[]> {
    const list = Array.from(files);
    const result: File[] = [];
    for (const file of list) {
      if (!isPdfFile(file)) {
        result.push(file);
        continue;
      }
      let encrypted = false;
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const { isEncrypted } = await import("@pdfsmaller/pdf-decrypt");
        encrypted = (await isEncrypted(bytes)).encrypted;
      } catch {
        // Detection itself failed (corrupt file, etc.) - let it through so
        // the tool's own load surfaces its usual, clearer error message.
      }
      if (!encrypted) {
        result.push(file);
        continue;
      }
      const unlocked = await new Promise<File | null>((resolve) => setPending({ file, error: "", busy: false, resolve }));
      if (unlocked) result.push(unlocked);
    }
    return result;
  }

  async function submitPassword(password: string) {
    if (!pending || pending.busy) return;
    if (!password) {
      setPending((prev) => (prev ? { ...prev, error: "Enter the PDF's password." } : prev));
      return;
    }
    const { file, resolve } = pending;
    setPending((prev) => (prev ? { ...prev, busy: true, error: "" } : prev));
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
      const decrypted = await decryptPDF(bytes, password);
      setPending(null);
      resolve(new File([decrypted], file.name, { type: "application/pdf" }));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Incorrect password. Please try again.";
      setPending((prev) => (prev ? { ...prev, busy: false, error: message } : prev));
    }
  }

  function cancel() {
    pending?.resolve(null);
    setPending(null);
  }

  const modal: ReactNode = pending ? (
    <div
      className="pdf-password-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Enter password for ${pending.file.name}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancel();
      }}
    >
      <section className="pdf-password-modal">
        <header>
          <div>
            <span className="pdf-password-icon"><Lock size={18} /></span>
            <div>
              <strong>Password required</strong>
              <span>{pending.file.name}</span>
            </div>
          </div>
          <button type="button" onClick={cancel} aria-label="Cancel">
            <X size={18} />
          </button>
        </header>
        <form
          className="pdf-password-body"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPassword(passwordRef.current?.value || "");
          }}
        >
          <p>This PDF is password-protected. Enter the password to unlock it and continue.</p>
          <input ref={passwordRef} type="password" autoFocus placeholder="PDF password" disabled={pending.busy} />
          {pending.error ? <span className="pdf-password-error">{pending.error}</span> : null}
          <div className="pdf-password-actions">
            <button type="button" className="pdf-password-cancel" onClick={cancel} disabled={pending.busy}>
              Cancel
            </button>
            <button type="submit" className="pdf-password-submit" disabled={pending.busy}>
              {pending.busy ? "Unlocking…" : "Unlock"}
            </button>
          </div>
        </form>
      </section>
    </div>
  ) : null;

  return { gateFiles, modal };
}
