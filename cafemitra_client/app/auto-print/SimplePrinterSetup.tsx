"use client";

import { useEffect, useState } from "react";
import { Printer, Trash2 } from "lucide-react";
import {
  deleteAgentPrintProfile,
  deleteAgentPrinterPreset,
  fallbackColorModes,
  fallbackPaperSizes,
  fetchAgentPrinterPresets,
  openAgentPrintPreferences,
  saveAgentPrintProfile,
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
// "Printer Preferences" on a row opens that printer's own Preferences window; what the owner picks is
// kept as a print profile named after the row (rowProfileName) and linked to it.
export default function SimplePrinterSetup({ agentConnected, printers, selectedPrinter, onSelectPrinter, onSavePrinter, onPresetSaved }: Props) {
  const [presets, setPresets] = useState<PrinterPreset[]>([]);
  const [paperSizes, setPaperSizes] = useState<string[]>(fallbackPaperSizes);
  const [colorModes, setColorModes] = useState<string[]>(fallbackColorModes);
  const [paperSize, setPaperSize] = useState(fallbackPaperSizes[0]);
  const [colorMode, setColorMode] = useState(fallbackColorModes[0]);
  const [openingPreferencesFor, setOpeningPreferencesFor] = useState("");
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
      applyPresets(await saveAgentPrinterPreset(preset));
      setPresetMessage(`Saved: ${preset.printer} – ${preset.paperSize} – ${preset.colorMode}`);
      onPresetSaved(preset.printer);
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not save printer setting. Is the PrintPilot Agent running?");
    } finally {
      setIsSavingPreset(false);
    }
  }

  async function setRowPreferences(preset: PrinterPreset) {
    const name = rowProfileName(preset);
    const saved = preset.profile === name;
    setOpeningPreferencesFor(presetKey(preset));
    setPresetError("");
    setPresetMessage("Printer preferences window is open on this PC. Set paper type, quality etc., then press OK there.");
    try {
      // Starts from the row's saved preferences when it already has them.
      const result = await openAgentPrintPreferences({ printer: preset.printer, originalName: saved ? name : undefined });
      await saveAgentPrintProfile({ name, printer: preset.printer, devMode: result.devMode });
      if (!saved) applyPresets(await saveAgentPrinterPreset({ ...preset, profile: name }, preset));
      setPresetMessage(`Preferences saved for ${preset.printer} – ${preset.paperSize} – ${preset.colorMode}${result.summary ? ` (${result.summary})` : ""}.`);
      onPresetSaved(preset.printer);
    } catch (error) {
      setPresetMessage("");
      setPresetError(error instanceof Error ? error.message : "Could not open printer preferences. Update the PrintPilot Agent to the latest version.");
    } finally {
      setOpeningPreferencesFor("");
    }
  }

  async function removePreset(preset: PrinterPreset) {
    setPresetMessage("");
    setPresetError("");
    try {
      applyPresets(await deleteAgentPrinterPreset(preset));
      // The row's own preferences profile goes with it.
      if (preset.profile) await deleteAgentPrintProfile(preset.profile).catch(() => undefined);
      setPresetMessage("Printer setting deleted.");
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not delete printer setting.");
    }
  }

  // Rows made with an Advanced print profile are managed under Advanced; this list is the plain printer rows
  // (with or without their own Printer Preferences).
  const plainPresets = presets.filter((preset) => !preset.profile || preset.profile === rowProfileName(preset));
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
          {isSavingPreset ? "Saving..." : "Save Setting"}
        </button>
      </div>
      {presetMessage ? <div className="profile-alert success">{presetMessage}</div> : null}
      {presetError ? <div className="profile-alert error">{presetError}</div> : null}

      <div className="printer-preset-list">
        {plainPresets.map((preset) => (
          <div className="printer-preset-row" key={presetKey(preset)}>
            <div>
              <strong>{preset.printer}</strong>
              <small>
                {preset.paperSize} · {preset.colorMode}
                {preset.profile ? " · ✓ Preferences saved" : ""}
              </small>
            </div>
            <button className="printer-preset-edit" type="button" onClick={() => setRowPreferences(preset)} disabled={!agentConnected || Boolean(openingPreferencesFor)}>
              {openingPreferencesFor === presetKey(preset) ? "Waiting for preferences..." : "Printer Preferences"}
            </button>
            <button className="icon-action-btn danger" type="button" onClick={() => removePreset(preset)} disabled={Boolean(openingPreferencesFor)} aria-label="Delete printer setting">
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

function presetKey(preset: PrinterPreset) {
  return `${preset.printer}-${preset.paperSize}-${preset.colorMode}`;
}

/** The print profile that holds a row's own Printer Preferences. */
function rowProfileName(preset: PrinterPreset) {
  return `${preset.printer} · ${preset.paperSize} · ${preset.colorMode}`;
}
