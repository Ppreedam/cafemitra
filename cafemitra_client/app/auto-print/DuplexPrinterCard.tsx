"use client";

import { useEffect, useState } from "react";
import { fetchAgentDuplexSettings, saveAgentDuplexSettings, type DuplexSettings } from "@/lib/printpilot-agent";

type Mode = "auto" | "manual";

export default function DuplexPrinterCard({ agentConnected }: { agentConnected: boolean }) {
  const [settings, setSettings] = useState<DuplexSettings | null>(null);
  const [printer, setPrinter] = useState("");
  const [mode, setMode] = useState<Mode>("auto");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [unsupported, setUnsupported] = useState(false);

  function apply(result: DuplexSettings) {
    setSettings(result);
    setPrinter(result.printer ?? "");
    setMode(result.mode === "manual" ? "manual" : "auto");
  }

  useEffect(() => {
    if (!agentConnected) return;
    let cancelled = false;
    fetchAgentDuplexSettings()
      .then((result) => {
        if (!cancelled) apply(result);
      })
      .catch(() => {
        // An agent build from before duplex support has no /duplex-settings route.
        if (!cancelled) setUnsupported(true);
      });
    return () => {
      cancelled = true;
    };
  }, [agentConnected]);

  async function save() {
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      apply(await saveAgentDuplexSettings({ printer, mode }));
      setMessage(printer ? "Duplex printer saved." : "Duplex printer cleared. Double-side orders will be held until one is set.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save duplex printer.");
    } finally {
      setIsSaving(false);
    }
  }

  const printers = settings?.printers ?? [];
  const saved = settings?.printer ?? "";
  const dirty = printer !== saved || mode !== (settings?.mode ?? "auto");
  const missing = Boolean(printer) && printer === saved && settings?.missing;
  const needsManual = Boolean(printer) && printer === saved && !settings?.missing && settings?.capable === false && mode === "auto";

  return (
    <>
      <div className="panel-title-row compact printer-preset-title">
        <div>
          <h2>Duplex Printer</h2>
          <p>For double-side prints. Orders asking for both sides go only to this printer; they are held, never sent to another one, until it is ready.</p>
        </div>
      </div>

      {unsupported ? (
        <div className="profile-alert error">Update the PrintPilot Agent to the latest version to use duplex printing.</div>
      ) : (
        <>
          <div className="printer-preset-form">
            <label className="auto-field">
              <span>Printer</span>
              <select value={printer} onChange={(event) => setPrinter(event.target.value)} disabled={!agentConnected}>
                <option value="">Select a printer</option>
                {saved && !printers.includes(saved) ? <option value={saved}>{saved} (not found)</option> : null}
                {printers.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="auto-field">
              <span>Print Mode</span>
              <select value={mode} onChange={(event) => setMode(event.target.value === "manual" ? "manual" : "auto")} disabled={!agentConnected}>
                <option value="auto">Duplex (Auto)</option>
                <option value="manual">Manual (Flip Pages)</option>
              </select>
            </label>
            <button className="btn btn-primary" type="button" onClick={save} disabled={!agentConnected || isSaving || !dirty}>
              {isSaving ? "Saving..." : "Save Duplex Printer"}
            </button>
          </div>

          {missing ? <div className="profile-alert error">Printer not found. Reconnect it or pick another printer.</div> : null}
          {needsManual ? (
            <div className="profile-alert error">This printer does not report automatic two-side printing. Choose Manual so the agent prints the front pages first.</div>
          ) : null}
          {!printer ? <p className="printer-preset-empty">No duplex printer selected. Double-side orders will wait until you pick one.</p> : null}
          {message ? <div className="profile-alert success">{message}</div> : null}
          {error ? <div className="profile-alert error">{error}</div> : null}
        </>
      )}
    </>
  );
}
