"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteAgentPrintProfile,
  deleteAgentPrinterPreset,
  fallbackColorModes,
  fallbackPaperSizes,
  fetchAgentPrintProfiles,
  fetchAgentPrinterPresets,
  openAgentPrintPreferences,
  saveAgentPrintProfile,
  saveAgentPrinterPreset,
  type PrintProfile,
  type PrinterPreset,
  type PrinterPresetsResult,
  type PrintProfilesResult,
} from "@/lib/printpilot-agent";

type Props = {
  agentConnected: boolean;
  /** Called with the printer of every saved Printer Settings row. */
  onPresetSaved?: (printer: string) => void;
};

// Step 3 of PrintPilot Setup. (1) Print profiles: a name + printer + that
// printer's own Preferences (paper size, glossy paper, quality...), opened on
// this PC by the desktop agent. (2) Printer Settings: which profile prints
// each paper size + color/grayscale order.
export default function PrinterProfileSetup({ agentConnected, onPresetSaved }: Props) {
  const [profiles, setProfiles] = useState<PrintProfile[]>([]);
  const [printers, setPrinters] = useState<string[]>([]);
  const [unsupported, setUnsupported] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [printer, setPrinter] = useState("");
  const [editingName, setEditingName] = useState("");
  const [devMode, setDevMode] = useState("");
  const [devModePrinter, setDevModePrinter] = useState("");
  const [preferencesSummary, setPreferencesSummary] = useState("");
  const [isOpeningPreferences, setIsOpeningPreferences] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Printer Settings form
  const [presets, setPresets] = useState<PrinterPreset[]>([]);
  const [paperSizes, setPaperSizes] = useState<string[]>(fallbackPaperSizes);
  const [colorModes, setColorModes] = useState<string[]>(fallbackColorModes);
  const [paperSize, setPaperSize] = useState(fallbackPaperSizes[0]);
  const [colorMode, setColorMode] = useState(fallbackColorModes[0]);
  const [presetProfile, setPresetProfile] = useState("");
  const [editingPreset, setEditingPreset] = useState<PrinterPreset | null>(null);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetMessage, setPresetMessage] = useState("");
  const [presetError, setPresetError] = useState("");

  function applyProfiles(result: PrintProfilesResult) {
    setProfiles(result.profiles ?? []);
    setPrinters(result.printers ?? []);
  }

  function applyPresets(result: PrinterPresetsResult) {
    setPresets(Array.isArray(result.presets) ? result.presets : []);
    if (Array.isArray(result.paperSizes) && result.paperSizes.length) setPaperSizes(result.paperSizes);
    if (Array.isArray(result.colorModes) && result.colorModes.length) setColorModes(result.colorModes);
  }

  useEffect(() => {
    if (!agentConnected) return;
    let cancelled = false;
    fetchAgentPrintProfiles()
      .then((result) => {
        if (!cancelled) applyProfiles(result);
      })
      .catch(() => {
        // An agent build from before print profiles has no /print-profiles route.
        if (!cancelled) setUnsupported(true);
      });
    fetchAgentPrinterPresets()
      .then((result) => {
        if (!cancelled) applyPresets(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [agentConnected]);

  // ── Profiles ───────────────────────────────────────────────────────
  const editingProfile = profiles.find((profile) => profile.name === editingName);
  const hasPreferences = Boolean(printer) && devModePrinter === printer && Boolean(devMode);
  // Renaming an existing profile on the same printer keeps its saved settings.
  const keepsSavedPreferences = Boolean(editingProfile) && editingProfile?.printer === printer;
  const canSaveProfile = agentConnected && Boolean(name.trim()) && Boolean(printer) && (hasPreferences || keepsSavedPreferences);
  const busy = isOpeningPreferences || isSavingProfile;

  function resetProfileForm() {
    setName("");
    setPrinter("");
    setEditingName("");
    setDevMode("");
    setDevModePrinter("");
    setPreferencesSummary("");
  }

  function editProfile(profile: PrintProfile) {
    setName(profile.name);
    setPrinter(profile.missing ? "" : profile.printer);
    setEditingName(profile.name);
    setDevMode("");
    setDevModePrinter("");
    setPreferencesSummary(profile.summary ?? "");
    setProfileMessage("");
    setProfileError("");
  }

  async function setPreferences() {
    if (!printer) return;
    setIsOpeningPreferences(true);
    setProfileError("");
    setProfileMessage("Printer preferences window is open on this PC. Set paper size, paper type and quality, then press OK there.");
    try {
      const result = await openAgentPrintPreferences({
        printer,
        originalName: editingName || undefined,
        devMode: devModePrinter === printer ? devMode || undefined : undefined,
      });
      setDevMode(result.devMode);
      setDevModePrinter(printer);
      setPreferencesSummary(result.summary ?? "");
      setProfileMessage("Preferences set. Click Save Profile to keep them.");
    } catch (error) {
      setProfileMessage("");
      setProfileError(error instanceof Error ? error.message : "Could not open printer preferences.");
    } finally {
      setIsOpeningPreferences(false);
    }
  }

  async function saveProfile() {
    const trimmed = name.trim();
    if (!canSaveProfile) return;
    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    try {
      applyProfiles(
        await saveAgentPrintProfile({
          name: trimmed,
          printer,
          originalName: editingName || undefined,
          devMode: hasPreferences ? devMode : undefined,
        }),
      );
      // A rename/printer change is carried over into Printer Settings rows.
      applyPresets(await fetchAgentPrinterPresets());
      setProfileMessage(`Profile "${trimmed}" saved.`);
      resetProfileForm();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not save print profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function removeProfile(profile: PrintProfile) {
    const used = presets.filter((preset) => preset.profile === profile.name).length;
    const warning = used ? ` ${used} printer setting(s) use it - those orders will be held until you pick another profile.` : "";
    if (!window.confirm(`Delete profile "${profile.name}"?${warning}`)) return;
    setProfileError("");
    setProfileMessage("");
    try {
      applyProfiles(await deleteAgentPrintProfile(profile.name));
      if (editingName === profile.name) resetProfileForm();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not delete print profile.");
    }
  }

  // ── Printer Settings ───────────────────────────────────────────────
  async function savePreset() {
    const profile = profiles.find((item) => item.name === presetProfile);
    if (!profile) {
      setPresetError("Select a profile first.");
      return;
    }
    setIsSavingPreset(true);
    setPresetError("");
    setPresetMessage("");
    try {
      const preset: PrinterPreset = { printer: profile.printer, paperSize, colorMode, profile: profile.name };
      applyPresets(await saveAgentPrinterPreset(preset, editingPreset ?? undefined));
      setPresetMessage(`Saved: ${paperSize} · ${colorMode} → ${profile.name}`);
      setEditingPreset(null);
      onPresetSaved?.(profile.printer);
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not save printer setting. Is the PrintPilot Agent running?");
    } finally {
      setIsSavingPreset(false);
    }
  }

  function editPreset(preset: PrinterPreset) {
    setEditingPreset(preset);
    setPaperSize(preset.paperSize);
    setColorMode(preset.colorMode);
    setPresetProfile(preset.profile ?? "");
    setPresetMessage("");
    setPresetError("");
  }

  async function removePreset(preset: PrinterPreset) {
    setPresetError("");
    setPresetMessage("");
    try {
      applyPresets(await deleteAgentPrinterPreset(preset));
      setPresetMessage("Printer setting deleted.");
      if (editingPreset && editingPreset.paperSize === preset.paperSize && editingPreset.colorMode === preset.colorMode) setEditingPreset(null);
    } catch (error) {
      setPresetError(error instanceof Error ? error.message : "Could not delete printer setting.");
    }
  }

  const profileNames = new Set(profiles.map((profile) => profile.name));

  if (unsupported) {
    return <div className="profile-alert error">Update the PrintPilot Agent to the latest version to set up print profiles.</div>;
  }

  return (
    <>
      <div className="panel-title-row compact printer-preset-title">
        <div>
          <h2>Print Profiles</h2>
          <p>
            Name a profile, pick its printer and click Set Preferences - the printer&apos;s own Preferences window opens on this PC (paper size, glossy/plain paper,
            print quality...). Press OK there, then Save Profile.
          </p>
        </div>
      </div>
      <div className="printer-preset-form">
        <label className="auto-field">
          <span>Profile Name</span>
          <input value={name} maxLength={120} placeholder="e.g. 4x6-photo-print-best-glossy" onChange={(event) => setName(event.target.value)} disabled={!agentConnected || busy} />
        </label>
        <label className="auto-field">
          <span>Printer</span>
          <select value={printer} onChange={(event) => setPrinter(event.target.value)} disabled={!agentConnected || busy}>
            <option value="">Select a printer</option>
            {printers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="printer-preset-form">
        <button className="btn" type="button" onClick={setPreferences} disabled={!agentConnected || !printer || busy}>
          {isOpeningPreferences ? "Waiting for preferences..." : "Set Preferences"}
        </button>
        <button className="btn btn-primary" type="button" onClick={saveProfile} disabled={!canSaveProfile || busy}>
          {isSavingProfile ? "Saving..." : editingName ? "Update Profile" : "Save Profile"}
        </button>
        {editingName && !busy ? (
          <button className="printer-preset-edit" type="button" onClick={resetProfileForm}>
            Cancel edit
          </button>
        ) : null}
      </div>
      {printer ? (
        <p className="printer-preset-empty">
          {hasPreferences || keepsSavedPreferences
            ? `✓ Preferences: ${preferencesSummary || "set"}${hasPreferences ? "" : " (saved)"}`
            : "Preferences not set yet - click Set Preferences."}
        </p>
      ) : null}
      {profileMessage ? <div className="profile-alert success">{profileMessage}</div> : null}
      {profileError ? <div className="profile-alert error">{profileError}</div> : null}

      <div className="printer-preset-list">
        {profiles.map((profile) => (
          <div className="printer-preset-row" key={profile.name}>
            <div>
              <strong>{profile.name}</strong>
              <small>
                {profile.printer}
                {profile.missing ? " (not found)" : ""}
                {profile.summary ? ` · ${profile.summary}` : ""}
              </small>
            </div>
            <button className="printer-preset-edit" type="button" onClick={() => editProfile(profile)} disabled={!agentConnected || busy}>
              Edit
            </button>
            <button className="icon-action-btn danger" type="button" onClick={() => removeProfile(profile)} aria-label="Delete print profile" disabled={!agentConnected || busy}>
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {!profiles.length ? <p className="printer-preset-empty">No print profiles yet. Create one above.</p> : null}
      </div>

      <div className="panel-title-row compact printer-preset-title">
        <div>
          <h2>Printer Settings</h2>
          <p>Pick which profile prints each paper size + color/grayscale order. The order prints on that profile&apos;s printer with its saved preferences.</p>
        </div>
      </div>
      <div className="printer-preset-form printer-preset-form-wide">
        <label className="auto-field">
          <span>Paper Size</span>
          <select value={paperSize} onChange={(event) => setPaperSize(event.target.value)} disabled={!agentConnected}>
            {paperSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="auto-field">
          <span>Color / Grayscale</span>
          <select value={colorMode} onChange={(event) => setColorMode(event.target.value)} disabled={!agentConnected}>
            {colorModes.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
        <label className="auto-field">
          <span>Profile</span>
          <select value={presetProfile} onChange={(event) => setPresetProfile(event.target.value)} disabled={!agentConnected}>
            <option value="">Select a profile</option>
            {profiles.map((profile) => (
              <option key={profile.name} value={profile.name}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" type="button" onClick={savePreset} disabled={!agentConnected || !presetProfile || isSavingPreset}>
          {isSavingPreset ? "Saving..." : editingPreset ? "Update" : "Save"}
        </button>
      </div>
      {presetMessage ? <div className="profile-alert success">{presetMessage}</div> : null}
      {presetError ? <div className="profile-alert error">{presetError}</div> : null}

      <div className="printer-preset-list">
        {presets.map((preset) => (
          <div className="printer-preset-row" key={`${preset.paperSize}-${preset.colorMode}-${preset.printer}`}>
            <div>
              <strong>
                {preset.paperSize} · {preset.colorMode}
              </strong>
              <small>
                {preset.profile
                  ? `${preset.profile}${profileNames.has(preset.profile) ? "" : " (profile missing)"} · ${preset.printer}`
                  : `${preset.printer} (no profile - edit to pick one)`}
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
        {!presets.length ? <p className="printer-preset-empty">No printer settings yet.</p> : null}
      </div>
    </>
  );
}
