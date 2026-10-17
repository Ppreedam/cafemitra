"use client";

import { useEffect, useState } from "react";
import { Printer, Trash2 } from "lucide-react";
import {
  deleteAgentPrinterPreset,
  fallbackColorModes,
  fallbackPaperSizes,
  fetchAgentPrinterPresets,
  saveAgentPrinterPreset,
  type PrinterPreset,
  type PrinterPresetsResult,
} from "@/lib/printpilot-agent";

type Props = {
  agentConnected: boolean;
  printers: string[];
  selectedPrinter: string;
  onSelectPrinter: (printer: string) => void;
  /** Saves the shop's default printer; resolves with the message to show. */
  onSavePrinter: (printer: string) => Promise<string>;
  /** A Printer Settings row was saved - completes the step and makes its printer the default if none is set. */
  onPresetSaved: (printer: string) => void;
};

// Step 3 as shop owners know it from the tutorial video: pick the printer, Save Printer, then save a
// paper size + color/grayscale for it. Orders for that paper size + color print on that printer (no
// print profile needed). The "Advanced" print profiles sit below it in the same step.
export default function SimplePrinterSetup({ agentConnected, printers, selectedPrinter, onSelectPrinter, onSavePrinter, onPresetSaved }: Props) {
  const [presets, setPresets] = useState<PrinterPreset[]>([]);
  const [paperSizes, setPaperSizes] = useState<string[]>(fallbackPaperSizes);
  const [colorModes, setColorModes] = useState<string[]>(fallbackColorModes);
  const [paperSize, setPaperSize] = useState(fallbackPaperSizes[0]);
  const [colorMode, setColorMode] = useState(fallbackColorModes[0]);
  const [editing, setEditing] = useState<PrinterPreset | null>(null);
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [printerMessage, setPrinterMessage] = useState("");
  const [printerError, setPrinterError] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const [presetError, setPresetError] = useState("");

  function applyPresets(result: PrinterPresetsResult) {
    setPresets(Array.isArray(result.presets) ? result.presets : []);
    if (Array.isArray(result.paperSizes) && result.paperSizes.length) setPaperSizes(result.paperSizes);
    if (Array.isArray(result.colorModes) && result.colorModes.length) setColorModes(result.colorModes);
  }

  useEffect(() => {
    if (!agentConnected) return;
    let cancelled = false;
    fetchAgentPrinterPresets()
      .then((result) => {
        if (!cancelled) applyPresets(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [agentConnected]);

  async function savePrinter() {
    setPrinterMessage("");
    setPrinterError("");
    setIsSavingPrinter(true);
    try {
      setPrinterMessage(await onSavePrinter(selectedPrinter));
    } catch (error) {
      setPrinterError(error instanceof Error ? error.message : "Could not save printer. Is the PrintPilot Agent running?");
    } finally {
      setIsSavingPrinter(false);
    }
  }

  async function savePreset() {
    setPresetMessage("");
    setPresetError("");
    if (!selectedPrinter) {
      setPresetError("Select a printer first.");
      return;
    }
    setIsSavingPreset(true);
    try {
      const preset: PrinterPreset = { printer: selectedPrinter, paperSize, colorMode, profile: "" };
      applyPresets(await saveAgentPrinterPreset(preset, editing ?? undefined));
      setPresetMessage(`Saved: ${preset.printer} – ${preset.paperSize} – ${preset.colorMode}`);
      setEditing(null);
      onPresetSaved(preset.printer);
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not save printer setting. Is the PrintPilot Agent running?");
    } finally {
      setIsSavingPreset(false);
    }
  }

  function editPreset(preset: PrinterPreset) {
    setEditing(preset);
    onSelectPrinter(preset.printer);
    setPaperSize(preset.paperSize);
    setColorMode(preset.colorMode);
    setPresetMessage("");
    setPresetError("");
  }

  async function removePreset(preset: PrinterPreset) {
    setPresetMessage("");
    setPresetError("");
    try {
      applyPresets(await deleteAgentPrinterPreset(preset));
      setPresetMessage("Printer setting deleted.");
      if (editing && editing.printer === preset.printer && editing.paperSize === preset.paperSize && editing.colorMode === preset.colorMode) setEditing(null);
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not delete printer setting.");
    }
  }

  // Rows made with a print profile are managed under Advanced; this list is the plain printer rows.
  const plainPresets = presets.filter((preset) => !preset.profile);
  const profilePresetCount = presets.length - plainPresets.length;

  return (
    <>
      <div className="printer-radio-list">
        {printers.map((printer) => (
          <label className="printer-radio" key={printer}>
            <input checked={selectedPrinter === printer} name="printer" type="radio" onChange={() => onSelectPrinter(printer)} />
            <span>{printer}</span>
          </label>
        ))}
        {!printers.length ? <div className="profile-alert error">No printer found. Install or connect a Windows printer, then verify the agent again.</div> : null}
      </div>
      {printerMessage ? <div className="profile-alert success">{printerMessage}</div> : null}
      {printerError ? <div className="profile-alert error">{printerError}</div> : null}
      <button className="btn btn-primary" type="button" onClick={savePrinter} disabled={!agentConnected || !selectedPrinter || isSavingPrinter}>
        <Printer size={16} /> {isSavingPrinter ? "Saving..." : "Save Printer"}
      </button>

      <div className="panel-title-row compact printer-preset-title">
        <div>
          <h2>Printer Settings</h2>
          <p>Save a paper size + color/grayscale combination per printer. Orders are routed to the printer matching what the customer requested.</p>
        </div>
      </div>
      <div className="printer-preset-form">
        <label className="auto-field">
          <span>Paper Size</span>
          <select value={paperSize} onChange={(event) => setPaperSize(event.target.value)}>
            {paperSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="auto-field">
          <span>Color / Grayscale</span>
          <select value={colorMode} onChange={(event) => setColorMode(event.target.value)}>
            {colorModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="button" onClick={savePreset} disabled={!agentConnected || !selectedPrinter || isSavingPreset}>
          {isSavingPreset ? "Saving..." : editing ? "Update Setting" : "Save Setting"}
        </button>
      </div>
      {presetMessage ? <div className="profile-alert success">{presetMessage}</div> : null}
      {presetError ? <div className="profile-alert error">{presetError}</div> : null}

      <div className="printer-preset-list">
        {plainPresets.map((preset) => (
          <div className="printer-preset-row" key={`${preset.printer}-${preset.paperSize}-${preset.colorMode}`}>
            <div>
              <strong>{preset.printer}</strong>
              <small>
                {preset.paperSize} · {preset.colorMode}
              </small>
            </div>
            <button className="printer-preset-edit" type="button" onClick={() => editPreset(preset)}>
              Edit
            </button>
            <button className="icon-action-btn danger" type="button" onClick={() => removePreset(preset)} aria-label="Delete printer setting">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {!plainPresets.length ? <p className="printer-preset-empty">No printer settings yet.</p> : null}
        {profilePresetCount ? <p className="printer-preset-empty">{profilePresetCount} more setting(s) use a print profile - see Advanced below.</p> : null}
      </div>
    </>
  );
}
