"use client";

import { useEffect, useState } from "react";
import { htmlToPdfBytes, sendPdfToAgent, type AgentPdfSource } from "@/lib/agent-print";
import { fetchAgentPrintProfiles, type PrintProfile } from "@/lib/printpilot-agent";

/** Dropdown value for "use the browser's own print dialog" (no agent). */
export const BROWSER_PRINT = "__browser__";

const storageKey = (toolKey: string) => `cafemitra_print_profile_${toolKey}`;

function readStored(toolKey: string) {
  try {
    return window.localStorage.getItem(storageKey(toolKey)) ?? "";
  } catch {
    return "";
  }
}

function writeStored(toolKey: string, value: string) {
  try {
    window.localStorage.setItem(storageKey(toolKey), value);
  } catch {
    // Remembering the choice is a convenience only.
  }
}

type PrintOptions = {
  fileName: string;
  copies?: number;
  /** The old browser print (new tab / print dialog) - used only when the
   *  owner picks "Browser print" or the agent is not running. */
  fallback?: () => void;
};

export type AgentPrint = ReturnType<typeof useAgentPrint>;

export type PrintOutcome = { via: "agent" | "browser"; ok: boolean; message: string };

/**
 * Print-profile choice + "send to the PrintPilot agent" for a tool's Print
 * button. The chosen profile is remembered per tool.
 */
export function useAgentPrint(toolKey: string) {
  const [profiles, setProfiles] = useState<PrintProfile[]>([]);
  const [agentReady, setAgentReady] = useState<boolean | null>(null);
  const [profile, setProfileState] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAgentPrintProfiles()
      .then((result) => {
        if (cancelled) return;
        const list = result.profiles ?? [];
        setProfiles(list);
        setAgentReady(true);
        const stored = readStored(toolKey);
        const names = list.map((item) => item.name);
        setProfileState(stored === BROWSER_PRINT || names.includes(stored) ? stored : names[0] ?? BROWSER_PRINT);
      })
      .catch(() => {
        if (cancelled) return;
        setAgentReady(false);
        setProfileState(BROWSER_PRINT);
      });
    return () => {
      cancelled = true;
    };
  }, [toolKey]);

  function setProfile(value: string) {
    setProfileState(value);
    setMessage("");
    setError("");
    writeStored(toolKey, value);
  }

  /** Resolves to what happened, for callers that show their own status. */
  async function run(getPdf: () => Promise<AgentPdfSource>, options: PrintOptions): Promise<PrintOutcome> {
    setMessage("");
    setError("");
    if (!profile || profile === BROWSER_PRINT || !agentReady) {
      if (options.fallback) {
        options.fallback();
        return { via: "browser", ok: true, message: "" };
      }
      const text = agentReady ? "Select a print profile." : "PrintPilot Agent is not running. Start it on this PC and try again.";
      setError(text);
      return { via: "agent", ok: false, message: text };
    }

    setBusy(true);
    setMessage("Sending to printer...");
    try {
      const result = await sendPdfToAgent(await getPdf(), { profile, fileName: options.fileName, copies: options.copies });
      const text = result.message || `Sent to printer (${profile}).`;
      setMessage(text);
      return { via: "agent", ok: true, message: text };
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not print via PrintPilot Agent.";
      setMessage("");
      setError(text);
      return { via: "agent", ok: false, message: text };
    } finally {
      setBusy(false);
    }
  }

  return {
    profiles,
    agentReady,
    profile,
    setProfile,
    busy,
    message,
    error,
    /** Prints a PDF (bytes, buffer or Blob) through the agent. */
    printPdf: (getPdf: () => Promise<AgentPdfSource>, options: PrintOptions) => run(getPdf, options),
    /** Prints a tool's print-ready HTML document through the agent. */
    printHtml: (getHtml: () => string | Promise<string>, options: PrintOptions) => run(async () => htmlToPdfBytes(await getHtml()), options),
  };
}

/** "Print profile" dropdown + status line, placed just before a Print button. */
export function PrintProfileSelect({ print, className = "", noProfileLabel }: { print: AgentPrint; className?: string; noProfileLabel?: string }) {
  return (
    <div className={`print-profile-select ${className}`.trim()}>
      <label>
        <span>Print Profile</span>
        <select value={print.profile} onChange={(event) => print.setProfile(event.target.value)} disabled={print.busy || print.agentReady === null}>
          {print.agentReady === null ? <option value="">Checking PrintPilot Agent...</option> : null}
          {print.profiles.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
              {item.missing ? " (printer not found)" : ""}
            </option>
          ))}
          <option value={BROWSER_PRINT}>{noProfileLabel ?? (print.agentReady === false ? "Agent not running - browser print" : "Browser print (no agent)")}</option>
        </select>
      </label>
      {print.agentReady && !print.profiles.length ? <small>No print profiles yet - create one in PrintPilot Setup (Step 3).</small> : null}
      {print.message ? <small className="print-profile-ok">{print.message}</small> : null}
      {print.error ? <small className="print-profile-error">{print.error}</small> : null}
    </div>
  );
}
