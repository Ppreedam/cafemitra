"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Download,
  Eye,
  EyeOff,
  FileUp,
  FolderOpen,
  ImageIcon,
  LoaderCircle,
  LogIn,
  MessageSquareWarning,
  Printer,
  RotateCcw,
  Save,
  Settings,
  X,
} from "lucide-react";
import { hasStoredSession } from "@/lib/api";
import { trackToolEvent } from "@/lib/analytics";
import { BUSINESS } from "@/lib/businessInfo";
import {
  PHOTO_DEFAULTS,
  PdfPasswordError,
  ZERO_ADJUST,
  buildCardPdf,
  loadCardPdf,
  loadImage,
  processPhoto,
  readSavedAdjust,
  renderCardPreview,
  saveAdjust,
  type AadhaarDesign,
  type CardAdjust,
  type CardElements,
  type CardOffsets,
  type NumberSizes,
  DEFAULT_NUMBER_SIZES,
  type Face,
  type FaceAdjust,
  type LoadedCard,
  type OutputKind,
  type PhotoParams,
} from "@/lib/idCardStudio";

const TEXT_SIZES = [
  { label: "Small", value: 90 },
  { label: "Normal", value: 100 },
  { label: "Medium", value: 110 },
  { label: "Large", value: 120 },
  { label: "Extra Large", value: 130 },
];

const PHOTO_BORDERS = [
  { label: "No border", value: 0 },
  { label: "Thin", value: 0.5 },
  { label: "Medium", value: 1 },
  { label: "Thick", value: 1.6 },
];

const DEFAULT_LINE_COLOR = "#de2129";

const STAMPS = ["PDF PRINTOUT", "E-AADHAAR PRINTOUT", "DUPLICATE COPY"];

const OUTPUT_LABELS: Record<OutputKind, string> = {
  card: "Card PDF (PVC / thermal printer)",
  a4: "A4 sheet",
  "4x6": "4x6 photo paper",
};

const ELEMENT_LABELS: Array<[keyof CardElements, string, string?]> = [
  ["frontHeader", "Front page header"],
  ["frontFooterLine", "Front page footer margin", "Red line above the footer"],
  ["frontFooterText", "Front page footer text", "मेरा आधार, मेरी पहचान"],
  ["backHeader", "Rear page header"],
  ["backFooterLine", "Rear page footer margin", "Red line above the footer"],
  ["backFooter", "Rear page footer", "1947 | help@uidai.gov.in | www.uidai.gov.in"],
  ["backUid", "Rear page UID", "Aadhaar number on the back"],
  ["autoAlign", "Auto align contents", "Shrink text that would not fit"],
  ["photoFrame", "Photo frame", "Border around the photo"],
  ["issueDate", "Download date", "“Aadhaar no. issued” on the front edge"],
  ["detailsDate", "Generation date", "“Details as on” on the back edge"],
  ["coloredFooter", "Colored footer", "Red आधार and icons"],
  ["frontVid", "Front VID"],
  ["backVid", "Rear VID"],
];

const OFFSET_LABELS: Array<[keyof CardOffsets, string]> = [
  ["frontHeader", "Front header offset"],
  ["backHeader", "Rear header offset"],
  ["frontFooter", "Front footer offset"],
  ["backFooter", "Rear footer offset"],
  ["photo", "Photo offset"],
];

// Everything the Settings dialog and bottom bar control. Saved to
// localStorage by "Save" so the next visit starts with the same setup.
type Prefs = {
  design: AadhaarDesign;
  photoScale: number;
  photoBorder: number;
  qrScale: number;
  sizes: NumberSizes;
  frontFooterSize: number;
  frontFooterBold: boolean;
  backFooterSize: number;
  backFooterBold: boolean;
  lineColor: string;
  frontSize: number;
  backSize: number;
  frontGap: number;
  backGap: number;
  bold: boolean;
  removeInfo: boolean;
  mobileNumber: boolean;
  elements: CardElements;
  offsets: CardOffsets;
  printer: OutputKind;
  rotateFront: boolean;
  rotateBack: boolean;
  outline: boolean;
  a4Copies: number;
  stampOn: boolean;
  stampText: string;
  passwordFromFilename: boolean;
  showPassword: boolean;
  rememberPassword: boolean;
  // e-EPIC voter card, clean and original (percent of the letter's size / line gap).
  voterFrontSize: number;
  voterAddressSize: number;
  voterFrontGap: number;
  voterAddressGap: number;
  voterFrontBold: boolean;
  voterAddressBold: boolean;
  // e-PAN card (NSDL / UTI), clean and original.
  panBold: boolean;
};

const DEFAULT_PREFS: Prefs = {
  design: "clean",
  photoScale: 100,
  photoBorder: 0.5,
  qrScale: 100,
  sizes: DEFAULT_NUMBER_SIZES,
  frontFooterSize: 12,
  frontFooterBold: true,
  backFooterSize: 8.5,
  backFooterBold: true,
  lineColor: DEFAULT_LINE_COLOR,
  frontSize: 100,
  backSize: 100,
  frontGap: 90,
  backGap: 100,
  bold: false,
  removeInfo: false,
  mobileNumber: true,
  elements: {
    frontHeader: true,
    frontFooterLine: true,
    frontFooterText: true,
    backHeader: true,
    backFooterLine: true,
    backFooter: true,
    backUid: true,
    autoAlign: true,
    photoFrame: true,
    issueDate: false,
    detailsDate: false,
    coloredFooter: false,
    frontVid: true,
    backVid: true,
  },
  offsets: { frontHeader: 0, backHeader: 0, frontFooter: 0, backFooter: 0, photo: 0 },
  printer: "card",
  rotateFront: false,
  rotateBack: false,
  outline: true,
  a4Copies: 1,
  stampOn: false,
  stampText: STAMPS[0],
  passwordFromFilename: false,
  showPassword: false,
  rememberPassword: false,
  voterFrontSize: 100,
  voterAddressSize: 100,
  voterFrontGap: 100,
  voterAddressGap: 100,
  voterFrontBold: false,
  voterAddressBold: false,
  panBold: false,
};

const PREFS_KEY = "cafemitra_idcard_settings";
const LAST_PASSWORD_KEY = "cafemitra_idcard_last_password";

function readPrefs(): Prefs {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (saved && typeof saved === "object") {
      const elements = { ...DEFAULT_PREFS.elements, ...saved.elements };
      // Older saves had a single "vid" switch for both sides.
      if (saved.elements && saved.elements.vid === false && saved.elements.frontVid === undefined) {
        elements.frontVid = false;
        elements.backVid = false;
      }
      delete (elements as Record<string, unknown>).vid;
      return {
        ...DEFAULT_PREFS,
        ...saved,
        elements,
        offsets: { ...DEFAULT_PREFS.offsets, ...saved.offsets },
        sizes: { ...DEFAULT_PREFS.sizes, ...saved.sizes },
      };
    }
  } catch {
    undefined;
  }
  return DEFAULT_PREFS;
}

function storageGet(key: string) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function storageSet(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    undefined;
  }
}

// Passwords to try automatically when a PDF is locked and none was typed.
function passwordCandidates(fileName: string, prefs: Prefs) {
  const list: string[] = [];
  if (prefs.passwordFromFilename) {
    const base = fileName.replace(/\.pdf$/i, "");
    for (const part of [base, ...base.split(/[^A-Za-z0-9]+/)]) {
      if (part.length >= 4) list.push(part, part.toUpperCase());
    }
  }
  if (prefs.rememberPassword) {
    const last = storageGet(LAST_PASSWORD_KEY);
    if (last) list.push(last);
  }
  return Array.from(new Set(list));
}

type Modal = "" | "help" | "photo" | "settings" | "print" | "login";

export default function IdCardStudioClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [files, setFiles] = useState<File[]>([]);
  const [fileIndex, setFileIndex] = useState(0);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; error?: boolean }>({ text: "" });
  const [dragOver, setDragOver] = useState(false);

  const [card, setCard] = useState<LoadedCard | null>(null);
  const [adjust, setAdjust] = useState<CardAdjust>(ZERO_ADJUST);
  const [face, setFace] = useState<Face>("front");
  const [mobile, setMobile] = useState("");
  const [photoParams, setPhotoParams] = useState<PhotoParams>(PHOTO_DEFAULTS);
  const [photoJpeg, setPhotoJpeg] = useState<Uint8Array | null>(null);

  const [preview, setPreview] = useState<string[]>([]);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [modal, setModal] = useState<Modal>("");
  const [outputKind, setOutputKind] = useState<OutputKind>("card");
  const [busyOutput, setBusyOutput] = useState(false);
  const [settingsNote, setSettingsNote] = useState("");

  // Saved settings are read after mount so the server render stays default.
  useEffect(() => {
    const saved = readPrefs();
    setPrefs(saved);
    setShowPassword(saved.showPassword);
  }, []);

  const setPref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => setPrefs((p) => ({ ...p, [key]: value }));
  const setElement = (key: keyof CardElements, value: boolean) => setPrefs((p) => ({ ...p, elements: { ...p.elements, [key]: value } }));
  const setSize = (key: keyof NumberSizes, value: number) => setPrefs((p) => ({ ...p, sizes: { ...p.sizes, [key]: value } }));
  const setOffset = (key: keyof CardOffsets, value: number) => {
    if (Number.isFinite(value)) setPrefs((p) => ({ ...p, offsets: { ...p.offsets, [key]: Math.max(-20, Math.min(20, value)) } }));
  };

  const isAadhaar = card?.mode === "aadhaar";
  const isClean = isAadhaar && prefs.design === "clean";
  const isVoter = card?.mode === "voter";
  const isCleanVoter = isVoter && prefs.design === "clean";
  const isPan = card?.mode === "pan";
  const isCleanPan = isPan && prefs.design === "clean";
  const photoSource = (isAadhaar && card?.meta?.photo?.jpeg) || (isVoter && card?.voter?.photoJpeg) || (isPan && card?.pan?.photoJpeg) || null;
  // Largest sizes whose widest line still fits across this voter card (the
  // letter's lines cannot re-wrap). Height is fitted when the card is built.
  const voterMax = {
    front: Math.max(100, Math.min(150, Math.floor((card?.voter?.details?.maxScale ?? 1.5) * 100))),
    address: Math.max(100, Math.min(150, Math.floor((card?.voter?.address?.maxScale ?? 1.5) * 100))),
  };
  const mobileValid = /^\d{10}$/.test(mobile);

  const currentSettings = useCallback(
    () => ({
      adjust,
      outline: prefs.outline,
      a4Copies: prefs.a4Copies,
      design: prefs.design,
      rotateFront: prefs.rotateFront,
      rotateBack: prefs.rotateBack,
      stamp: prefs.stampOn ? prefs.stampText : "",
      clean: {
        sizes: prefs.sizes,
        photoScale: prefs.photoScale / 100,
        photoBorder: prefs.photoBorder,
        qrScale: prefs.qrScale / 100,
        elements: prefs.elements,
        offsets: prefs.offsets,
        footer: {
          frontSize: prefs.frontFooterSize,
          frontBold: prefs.frontFooterBold,
          backSize: prefs.backFooterSize,
          backBold: prefs.backFooterBold,
          lineColor: prefs.lineColor,
        },
      },
      aadhaar: {
        frontScale: prefs.frontSize / 100,
        backScale: prefs.backSize / 100,
        frontSpacing: prefs.frontGap / 100,
        backSpacing: prefs.backGap / 100,
        boldFront: prefs.bold,
        boldBack: prefs.bold,
        removeInfo: prefs.removeInfo,
        mobile: prefs.mobileNumber && mobileValid ? mobile : "",
        photoJpeg,
      },
      voter: {
        frontScale: prefs.voterFrontSize / 100,
        backScale: prefs.voterAddressSize / 100,
        frontGap: prefs.voterFrontGap / 100,
        backGap: prefs.voterAddressGap / 100,
        boldFront: prefs.voterFrontBold,
        boldBack: prefs.voterAddressBold,
        photoJpeg,
      },
      pan: { bold: prefs.panBold, photoJpeg },
    }),
    [adjust, prefs, mobile, mobileValid, photoJpeg],
  );

  function saveSettings() {
    storageSet(PREFS_KEY, JSON.stringify(prefs));
    if (!prefs.rememberPassword) storageSet(LAST_PASSWORD_KEY, null);
    setShowPassword(prefs.showPassword);
    setModal("");
    setStatus({ text: "Settings saved. They will be used every time you open this page." });
  }

  function resetSettings() {
    setPrefs(DEFAULT_PREFS);
    storageSet(PREFS_KEY, null);
    storageSet(LAST_PASSWORD_KEY, null);
    setShowPassword(DEFAULT_PREFS.showPassword);
    setSettingsNote("Settings reset to default.");
  }

  // ---------- loading ----------
  async function loadWithPasswords(file: File, pwd: string): Promise<{ loaded: LoadedCard; used: string }> {
    try {
      return { loaded: await loadCardPdf(file, pwd), used: pwd };
    } catch (error) {
      if (!(error instanceof PdfPasswordError) || pwd) throw error;
      for (const candidate of passwordCandidates(file.name, prefs)) {
        try {
          return { loaded: await loadCardPdf(file, candidate), used: candidate };
        } catch (retryError) {
          if (!(retryError instanceof PdfPasswordError)) throw retryError;
        }
      }
      throw error;
    }
  }

  async function openFile(file: File, pwd: string) {
    setLoading(true);
    setNeedsPassword(false);
    setStatus({ text: `Reading ${file.name}…` });
    try {
      const { loaded, used } = await loadWithPasswords(file, pwd);
      if (used !== pwd) setPassword(used);
      if (used && prefs.rememberPassword) storageSet(LAST_PASSWORD_KEY, used);
      setCard(loaded);
      setAdjust(readSavedAdjust(`${loaded.type.key}:${loaded.mode}`));
      setFace("front");
      setMobile(loaded.meta?.mobile || "");
      setPhotoParams(PHOTO_DEFAULTS);
      setPhotoJpeg(null);
      setStatus({ text: loaded.notice || `${loaded.type.label} ready. Adjust if needed, then Print Card.`, error: Boolean(loaded.notice) });
      trackToolEvent("id_card_maker", `open_${loaded.type.key}_${loaded.mode}`);
    } catch (error) {
      setCard(null);
      setPreview([]);
      if (error instanceof PdfPasswordError) {
        setNeedsPassword(true);
        setStatus({
          text: error.wrong ? "Wrong password. Check capital letters and try again." : "This PDF is password protected. Type the password and press Go.",
          error: true,
        });
        setTimeout(() => passwordRef.current?.focus(), 30);
      } else {
        console.error(error);
        setStatus({ text: "This PDF could not be read. It may be damaged. Download it again and retry.", error: true });
      }
    } finally {
      setLoading(false);
    }
  }

  function addFiles(list: FileList | File[]) {
    const pdfs = Array.from(list).filter((file) => /\.pdf$/i.test(file.name) || file.type === "application/pdf");
    if (!pdfs.length) {
      setStatus({ text: "Choose a PDF file (Aadhaar, PAN, Voter ID, Driving Licence…).", error: true });
      return;
    }
    setFiles(pdfs);
    setFileIndex(0);
    setPassword("");
    void openFile(pdfs[0], "");
  }

  function goToFile(index: number) {
    if (index < 0 || index >= files.length || loading) return;
    setFileIndex(index);
    setPassword("");
    void openFile(files[index], "");
  }

  function go() {
    const file = files[fileIndex];
    if (!file) {
      fileInputRef.current?.click();
      return;
    }
    void openFile(file, password.trim());
  }

  function clearAll() {
    setFiles([]);
    setFileIndex(0);
    setPassword("");
    setNeedsPassword(false);
    setCard(null);
    setPreview([]);
    setNotes([]);
    setStatus({ text: "" });
  }

  // ---------- live preview ----------
  const previewRun = useRef(0);
  useEffect(() => {
    if (!card) return;
    const run = ++previewRun.current;
    const timer = setTimeout(async () => {
      setPreviewBusy(true);
      try {
        const { bytes, notes: layoutNotes } = await buildCardPdf(card, currentSettings(), "card");
        const images = await renderCardPreview(bytes);
        if (run !== previewRun.current) return;
        setPreview(images);
        setNotes(layoutNotes);
      } catch (error) {
        console.error(error);
        if (run === previewRun.current) setNotes(["Preview failed for these settings. Try a smaller text size or reset Adjust Card."]);
      } finally {
        if (run === previewRun.current) setPreviewBusy(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [card, currentSettings]);

  // ---------- adjust card ----------
  function nudge(field: keyof FaceAdjust, delta: number) {
    if (!card) return;
    setAdjust((current) => {
      const next = { ...current, [face]: { ...current[face], [field]: Math.round((current[face][field] + delta) * 10) / 10 } };
      saveAdjust(`${card.type.key}:${card.mode}`, next);
      return next;
    });
  }

  function setAdjustField(field: keyof FaceAdjust, value: number) {
    if (!card || !Number.isFinite(value)) return;
    setAdjust((current) => {
      const next = { ...current, [face]: { ...current[face], [field]: value } };
      saveAdjust(`${card.type.key}:${card.mode}`, next);
      return next;
    });
  }

  function resetAdjust() {
    if (!card) return;
    setAdjust(ZERO_ADJUST);
    saveAdjust(`${card.type.key}:${card.mode}`, ZERO_ADJUST);
  }

  // ---------- output ----------
  function requireLogin() {
    if (hasStoredSession()) return true;
    setModal("login");
    return false;
  }

  function validateBeforeOutput() {
    if (!card) return false;
    if (isAadhaar && prefs.mobileNumber && mobile && !mobileValid) {
      setStatus({ text: "The mobile number needs 10 digits. Fix it in Settings, or clear it.", error: true });
      setSettingsNote("");
      setModal("settings");
      return false;
    }
    return requireLogin();
  }

  async function makeOutput(kind: OutputKind, action: "print" | "download") {
    if (!card || !validateBeforeOutput()) return;
    // Open the tab synchronously so pop-up blockers allow it.
    const printWindow = action === "print" ? window.open("", "_blank") : null;
    setBusyOutput(true);
    try {
      const { bytes } = await buildCardPdf(card, currentSettings(), kind);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const baseName = card.fileName.replace(/\.pdf$/i, "") || "id-card";
      const suffix = kind === "card" ? "card" : kind === "a4" ? "A4-sheet" : "4x6-sheet";
      if (printWindow) {
        printWindow.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `${baseName}-${suffix}.pdf`;
        link.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setModal("");
      setStatus({ text: action === "print" ? "Opened in a new tab. Print at 100% / Actual size, not Fit to page." : `Saved ${baseName}-${suffix}.pdf.` });
      trackToolEvent("id_card_maker", `${action}_${kind}_${card.type.key}`);
    } catch (error) {
      console.error(error);
      printWindow?.close();
      setStatus({ text: "Could not build this PDF. Try resetting Adjust Card.", error: true });
    } finally {
      setBusyOutput(false);
    }
  }

  const reportHref = `https://wa.me/${BUSINESS.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi RepetiGo, ID Card Maker issue.${card ? ` Document: ${card.type.label} (${card.mode}).` : ""} Problem: `,
  )}`;

  const faceAdjust = adjust[face];
  const hasFile = files.length > 0;
  const borderValue = prefs.elements.photoFrame ? prefs.photoBorder : 0;

  return (
    <div className="idstudio">
      <div className="idstudio-toolbar">
        <section className="idstudio-box idstudio-help">
          <span className="idstudio-type" style={{ "--type-color": card?.type.color || "#667795" } as React.CSSProperties}>
            {card ? card.type.label : "No card"}
          </span>
          <small>{card
            ? `${card.pan ? `${card.pan.variant.toUpperCase()} · ` : ""}${isClean || isCleanVoter || isCleanPan ? "Clean design" : isAadhaar || isVoter || isPan ? "Original cut" : card.mode === "raster" ? "Image cut" : "Crop cut"}`
            : "Aadhaar · PAN · Voter · DL"}</small>
          <button type="button" className="idstudio-btn" onClick={() => setModal("help")}>
            <CircleHelp size={15} /> Help
          </button>
        </section>

        <section className="idstudio-box idstudio-file">
          <div className="idstudio-file-fields">
            <label htmlFor="idstudio-file-name">File</label>
            <button id="idstudio-file-name" type="button" className="idstudio-field" onClick={() => fileInputRef.current?.click()} title={files[fileIndex]?.name}>
              {files[fileIndex]?.name || "Click to choose a PDF…"}
            </button>
            <label htmlFor="idstudio-password">Password</label>
            <div className={`idstudio-password${needsPassword ? " needs" : ""}`}>
              <input
                id="idstudio-password"
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder={needsPassword ? "e.g. RAHU1990 (Aadhaar) or 01011990 (PAN)" : "Only if the PDF asks for one"}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") go();
                }}
              />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="idstudio-file-buttons">
            <button type="button" className="idstudio-icon-btn" title="Choose PDF" aria-label="Choose PDF" onClick={() => fileInputRef.current?.click()}>
              <FolderOpen size={18} />
            </button>
            <button type="button" className="idstudio-icon-btn" title="Clear" aria-label="Clear" onClick={clearAll} disabled={!hasFile}>
              <X size={18} />
            </button>
            <button type="button" className="idstudio-go" onClick={go} disabled={loading}>
              {loading ? <LoaderCircle size={18} className="spin" /> : "Go!"}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files?.length) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </section>

        <section className="idstudio-box idstudio-actions">
          <button type="button" className="idstudio-btn" disabled={!photoSource} onClick={() => setModal("photo")} title={photoSource ? undefined : "Photo editing works with standard e-Aadhaar and e-EPIC PDFs"}>
            <ImageIcon size={15} /> Photo Editor
          </button>
          <button
            type="button"
            className="idstudio-btn"
            onClick={() => {
              setSettingsNote("");
              setModal("settings");
            }}
          >
            <Settings size={15} /> Settings
          </button>
          <a className="idstudio-btn" href={reportHref} target="_blank" rel="noopener noreferrer">
            <MessageSquareWarning size={15} /> Report Issue
          </a>
          <button
            type="button"
            className="idstudio-btn idstudio-print"
            disabled={!card || busyOutput}
            onClick={() => {
              setOutputKind(prefs.printer);
              setModal("print");
            }}
          >
            <Printer size={17} /> Print Card
          </button>
          <button type="button" className="idstudio-btn" disabled={!card || busyOutput} onClick={() => void makeOutput(prefs.printer, "download")}>
            <Download size={15} /> Download PDF
          </button>
        </section>

        <section className="idstudio-box idstudio-adjust" aria-label="Adjust card" title={isClean ? "The clean design is laid out automatically. Use the offsets in Settings, or switch Design to Original to adjust the cut." : undefined}>
          <div className="idstudio-pad-wrap">
            <span>Adjust Card</span>
            <Pad
              disabled={!card || isClean}
              labels={["Move cut up", "Move cut down", "Move cut left", "Move cut right"]}
              onUp={() => nudge("y", -1)}
              onDown={() => nudge("y", 1)}
              onLeft={() => nudge("x", -1)}
              onRight={() => nudge("x", 1)}
              onCenter={resetAdjust}
            />
          </div>
          <div className="idstudio-adjust-values">
            <div className="idstudio-face-radios" role="radiogroup" aria-label="Side to adjust">
              {(["front", "back"] as const).map((value) => (
                <label key={value}>
                  <input type="radio" name="idstudio-face" checked={face === value} onChange={() => setFace(value)} disabled={!card || isClean} />
                  {value === "front" ? "Front" : "Back"}
                </label>
              ))}
            </div>
            <div className="idstudio-adjust-grid">
              {(
                [
                  ["x", "X"],
                  ["y", "Y"],
                  ["zx", "XZ"],
                  ["zy", "YZ"],
                ] as const
              ).map(([field, label]) => (
                <label key={field}>
                  <span>{label}</span>
                  <input type="number" step={0.5} value={faceAdjust[field]} disabled={!card || isClean} onChange={(event) => setAdjustField(field, Number(event.target.value))} />
                </label>
              ))}
            </div>
          </div>
          <div className="idstudio-pad-wrap">
            <span>Adjust Zoom</span>
            <Pad
              disabled={!card || isClean}
              labels={["Taller cut (zoom out)", "Shorter cut (zoom in)", "Wider cut (zoom out)", "Narrower cut (zoom in)"]}
              onUp={() => nudge("zy", -1)}
              onDown={() => nudge("zy", 1)}
              onLeft={() => nudge("zx", -1)}
              onRight={() => nudge("zx", 1)}
              onCenter={resetAdjust}
            />
          </div>
        </section>
      </div>

      <div
        className={`idstudio-stage${dragOver ? " drag" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
        }}
      >
        {card ? (
          <div className={`idstudio-cards${previewBusy ? " busy" : ""}`}>
            {(["front", "back"] as const).map((side, i) => (
              <figure key={side} className={face === side ? "active" : ""} onClick={() => setFace(side)}>
                <div className="idstudio-card">
                  {preview[i] ? <img src={preview[i]} alt={`${side === "front" ? "Front" : "Back"} of ${card.type.label}`} /> : <LoaderCircle className="spin" size={26} />}
                </div>
                <figcaption>{side === "front" ? "Front" : "Back"}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <button type="button" className="idstudio-empty" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            {loading ? <LoaderCircle size={34} className="spin" /> : <FileUp size={34} />}
            <strong>{loading ? "Reading PDF…" : "Drop Aadhaar, PAN, Voter ID or DL PDFs here"}</strong>
            <span>{loading ? "Unlocking and finding the card" : "or click to choose. Select several files to step through them with Previous / Next."}</span>
          </button>
        )}
      </div>

      {status.text || notes.length ? (
        <p className={`idstudio-status${status.error ? " error" : ""}`} role="status">
          {status.text} {notes.join(" ")}
        </p>
      ) : null}

      <div className="idstudio-bottombar">
        <label>
          <span>Design</span>
          <select value={prefs.design} disabled={!isAadhaar && !isVoter && !isPan} onChange={(event) => setPref("design", event.target.value as AadhaarDesign)}>
            <option value="clean">Clean card</option>
            <option value="original">Original cut</option>
          </select>
        </label>
        <label className="idstudio-range" title="Photo size">
          <span>Photo</span>
          <input type="range" min={85} max={120} value={prefs.photoScale} disabled={!isClean} onChange={(event) => setPref("photoScale", Number(event.target.value))} />
          <output>{prefs.photoScale}%</output>
        </label>
        <label>
          <span>Border</span>
          <select
            value={borderValue}
            disabled={!isClean && !isCleanVoter}
            onChange={(event) => {
              const value = Number(event.target.value);
              setPrefs((p) => ({ ...p, photoBorder: value || p.photoBorder, elements: { ...p.elements, photoFrame: value > 0 } }));
            }}
          >
            {PHOTO_BORDERS.map((border) => (
              <option key={border.value} value={border.value}>
                {border.label}
              </option>
            ))}
          </select>
        </label>
        <label className="idstudio-range" title="QR code size">
          <span>QR</span>
          <input type="range" min={80} max={120} value={prefs.qrScale} disabled={!isClean} onChange={(event) => setPref("qrScale", Number(event.target.value))} />
          <output>{prefs.qrScale}%</output>
        </label>
        <label>
          <span>Front Text</span>
          <select value={nearestPreset(prefs.frontSize)} disabled={!isAadhaar} onChange={(event) => setPref("frontSize", Number(event.target.value))}>
            {TEXT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Address</span>
          <select value={nearestPreset(prefs.backSize)} disabled={!isAadhaar} onChange={(event) => setPref("backSize", Number(event.target.value))}>
            {TEXT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
        <label className="idstudio-check">
          <input type="checkbox" checked={prefs.bold} disabled={!isAadhaar} onChange={(event) => setPref("bold", event.target.checked)} />
          <span>BOLD Fonts</span>
        </label>
        <label className="idstudio-range" title="Front text size">
          <input type="range" min={85} max={140} value={prefs.frontSize} disabled={!isAadhaar} onChange={(event) => setPref("frontSize", Number(event.target.value))} />
          <output>{prefs.frontSize}%</output>
        </label>
        <span className="idstudio-counter">{hasFile ? `${fileIndex + 1} / ${files.length}` : ""}</span>
        <div className="idstudio-nav">
          <button type="button" onClick={() => goToFile(fileIndex - 1)} disabled={fileIndex <= 0 || loading}>
            <ChevronLeft size={15} /> Previous
          </button>
          <button type="button" onClick={() => goToFile(fileIndex + 1)} disabled={fileIndex >= files.length - 1 || loading}>
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {modal === "help" ? (
        <Dialog title="How to use the ID Card Maker" onClose={() => setModal("")}>
          <ol className="idstudio-help-steps">
            <li>Click <b>File</b> (or the folder icon) and choose the downloaded PDF: e-Aadhaar, e-PAN, e-EPIC voter card, DL and so on. You can pick several at once.</li>
            <li>If the PDF is locked, type the <b>Password</b> and press <b>Go!</b>. e-Aadhaar: first 4 letters of the name in capitals + birth year (RAHU1990). e-PAN: date of birth as DDMMYYYY.</li>
            <li>e-Aadhaar PDFs are redrawn as a clean card: new header and footer, bigger photo. Use the bottom bar and <b>Settings</b> to change text size, photo size, border and which parts are printed. e-EPIC voter cards and NSDL / UTI e-PAN cards print on a plain white background (set Design to Original for the coloured card).</li>
            <li>For other cards, or with Design set to Original, use <b>Adjust Card</b> (move) and <b>Adjust Zoom</b> (size) if the cut is slightly off. The centre button resets.</li>
            <li>Press <b>Print Card</b> and pick PVC card, A4 or 4x6. Print at 100% / Actual size. Press <b>Save</b> in Settings to keep your setup for next time.</li>
          </ol>
          <p className="idstudio-muted">The PDF is processed inside this browser and is not uploaded.</p>
        </Dialog>
      ) : null}

      {modal === "photo" && photoSource ? (
        <PhotoEditor
          jpeg={photoSource}
          initial={photoParams}
          onClose={() => setModal("")}
          onApply={(params, jpeg) => {
            setPhotoParams(params);
            setPhotoJpeg(jpeg);
            setModal("");
          }}
        />
      ) : null}

      {modal === "settings" ? (
        <Dialog title="Settings" onClose={() => setModal("")} size="xl">
          <div className="idstudio-settings-grid">
            <div className="idstudio-settings-col">
              <fieldset className="idstudio-fieldset">
                <legend>Card elements</legend>
                <small className="idstudio-muted">For the clean e-Aadhaar card.</small>
                <div className="idstudio-check-list">
                  {ELEMENT_LABELS.map(([key, label, hint]) => (
                    <label key={key} className="idstudio-check" title={hint}>
                      <input type="checkbox" checked={prefs.elements[key]} onChange={(event) => setElement(key, event.target.checked)} />
                      <span>
                        {label}
                        {hint ? <small>{hint}</small> : null}
                      </span>
                    </label>
                  ))}
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.mobileNumber} onChange={(event) => setPref("mobileNumber", event.target.checked)} />
                    <span>Mobile number</span>
                  </label>
                </div>
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Aadhaar number &amp; VID</legend>
                <SliderSetting label="Front Aadhaar number" hint="Moves down when the front VID is off" min={9} max={18} step={0.5} unit=" pt" value={prefs.sizes.frontNumber} onChange={(value) => setSize("frontNumber", value)} />
                <SliderSetting label="Front VID" hint="Front VID text size" min={5} max={10} step={0.5} unit=" pt" value={prefs.sizes.frontVid} onChange={(value) => setSize("frontVid", value)} />
                <SliderSetting label="Rear Aadhaar number" hint="Moves down when the rear VID is off" min={9} max={18} step={0.5} unit=" pt" value={prefs.sizes.backNumber} onChange={(value) => setSize("backNumber", value)} />
                <SliderSetting label="Rear VID" hint="Rear VID text size" min={5} max={10} step={0.5} unit=" pt" value={prefs.sizes.backVid} onChange={(value) => setSize("backVid", value)} />
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Footer &amp; QR code</legend>
                <SliderSetting label="Front footer size" hint="मेरा आधार, मेरी पहचान" min={8} max={16} step={0.5} unit=" pt" value={prefs.frontFooterSize} onChange={(value) => setPref("frontFooterSize", value)} />
                <label className="idstudio-check">
                  <input type="checkbox" checked={prefs.frontFooterBold} onChange={(event) => setPref("frontFooterBold", event.target.checked)} />
                  <span>Front footer bold</span>
                </label>
                <SliderSetting label="Back footer size" hint="1947 | help@uidai.gov.in | www.uidai.gov.in" min={6} max={10.5} step={0.5} unit=" pt" value={prefs.backFooterSize} onChange={(value) => setPref("backFooterSize", value)} />
                <label className="idstudio-check">
                  <input type="checkbox" checked={prefs.backFooterBold} onChange={(event) => setPref("backFooterBold", event.target.checked)} />
                  <span>Back footer bold</span>
                </label>
                <div className="idstudio-setting">
                  <div>
                    <strong>Footer line</strong>
                    <small>Line above the footer</small>
                  </div>
                  <div className="idstudio-inline">
                    <label className="idstudio-check">
                      <input type="checkbox" checked={prefs.elements.frontFooterLine} onChange={(event) => setElement("frontFooterLine", event.target.checked)} />
                      <span>Front</span>
                    </label>
                    <label className="idstudio-check">
                      <input type="checkbox" checked={prefs.elements.backFooterLine} onChange={(event) => setElement("backFooterLine", event.target.checked)} />
                      <span>Back</span>
                    </label>
                    <input
                      type="color"
                      className="idstudio-color"
                      aria-label="Footer line colour"
                      value={prefs.lineColor}
                      disabled={!prefs.elements.frontFooterLine && !prefs.elements.backFooterLine}
                      onChange={(event) => setPref("lineColor", event.target.value)}
                    />
                    <button type="button" className="idstudio-btn small" disabled={prefs.lineColor === DEFAULT_LINE_COLOR} onClick={() => setPref("lineColor", DEFAULT_LINE_COLOR)}>
                      Red
                    </button>
                  </div>
                </div>
                <SliderSetting label="QR code size" hint="Back of the card" min={80} max={120} value={prefs.qrScale} onChange={(value) => setPref("qrScale", value)} />
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Offsets</legend>
                <small className="idstudio-muted">Points, + moves down (1 pt ≈ 0.35 mm).</small>
                <div className="idstudio-offsets">
                  {OFFSET_LABELS.map(([key, label]) => (
                    <label key={key}>
                      <span>{label}</span>
                      <input type="number" step={0.5} min={-20} max={20} value={prefs.offsets[key]} onChange={(event) => setOffset(key, Number(event.target.value))} />
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="idstudio-settings-col">
              <fieldset className="idstudio-fieldset">
                <legend>Voter ID card</legend>
                <small className="idstudio-muted">For the e-EPIC card, clean and original cut. If the text would not fit, the gap closes first, then the size.</small>
                <SliderSetting label="Front text size" hint="Name, father's name, gender, DOB" min={70} max={voterMax.front} value={Math.min(prefs.voterFrontSize, voterMax.front)} onChange={(value) => setPref("voterFrontSize", value)} />
                <SliderSetting label="Front line gap" hint="Space between the front lines" min={80} max={160} value={prefs.voterFrontGap} onChange={(value) => setPref("voterFrontGap", value)} />
                <label className="idstudio-check">
                  <input type="checkbox" checked={prefs.voterFrontBold} onChange={(event) => setPref("voterFrontBold", event.target.checked)} />
                  <span>Front text bold</span>
                </label>
                <SliderSetting label="Address size" hint="Back of the card" min={70} max={voterMax.address} value={Math.min(prefs.voterAddressSize, voterMax.address)} onChange={(value) => setPref("voterAddressSize", value)} />
                <SliderSetting label="Address line gap" hint="Space between the address lines" min={80} max={160} value={prefs.voterAddressGap} onChange={(value) => setPref("voterAddressGap", value)} />
                <label className="idstudio-check">
                  <input type="checkbox" checked={prefs.voterAddressBold} onChange={(event) => setPref("voterAddressBold", event.target.checked)} />
                  <span>Address bold</span>
                </label>
                <div className="idstudio-setting">
                  <div>
                    <strong>Photo</strong>
                    <small>Brightness, contrast, sharpness, auto-fix</small>
                  </div>
                  <button type="button" className="idstudio-btn small" disabled={!isVoter || !photoSource} onClick={() => setModal("photo")}>
                    <ImageIcon size={14} /> Clean photo
                  </button>
                </div>
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>PAN card</legend>
                <small className="idstudio-muted">NSDL and UTI e-PAN are found automatically, clean and original cut.</small>
                <label className="idstudio-check">
                  <input type="checkbox" checked={prefs.panBold} onChange={(event) => setPref("panBold", event.target.checked)} />
                  <span>
                    Bold text
                    <small>PAN number, name, father&apos;s name, date of birth</small>
                  </span>
                </label>
                <div className="idstudio-setting">
                  <div>
                    <strong>Photo</strong>
                    <small>Brightness, contrast, sharpness, auto-fix</small>
                  </div>
                  <button type="button" className="idstudio-btn small" disabled={!isPan || !photoSource} onClick={() => setModal("photo")}>
                    <ImageIcon size={14} /> Clean photo
                  </button>
                </div>
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Text</legend>
                <label className="idstudio-setting">
                  <strong>Font size</strong>
                  <select value={nearestPreset(prefs.frontSize)} onChange={(event) => setPref("frontSize", Number(event.target.value))}>
                    {TEXT_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </label>
                <SliderSetting label="Front line spacing" hint="Name, DOB, gender, mobile" min={70} max={140} value={prefs.frontGap} onChange={(value) => setPref("frontGap", value)} />
                <SliderSetting label="Address size" hint="Back of the card" min={85} max={150} value={prefs.backSize} onChange={(value) => setPref("backSize", value)} />
                {prefs.design === "original" ? (
                  <SliderSetting label="Address line spacing" hint="Original cut only" min={70} max={140} value={prefs.backGap} onChange={(value) => setPref("backGap", value)} />
                ) : null}
                {isAadhaar ? (
                  <div className="idstudio-setting">
                    <div>
                      <strong>Mobile number</strong>
                      <small>Read from the PDF; edit if needed</small>
                    </div>
                    <input
                      className="idstudio-text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10 digits"
                      aria-label="Mobile number"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                  </div>
                ) : null}
                {isAadhaar && prefs.mobileNumber && mobile && !mobileValid ? <p className="idstudio-error">Enter all 10 digits to print the mobile number.</p> : null}
                {prefs.design === "original" ? (
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.removeInfo} onChange={(event) => setPref("removeInfo", event.target.checked)} />
                    <span>Remove &ldquo;Aadhaar is proof of identity&rdquo; box (original cut)</span>
                  </label>
                ) : null}
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Printer type</legend>
                <div className="idstudio-radio-list">
                  {(
                    [
                      ["card", "Card printer (PVC / thermal)"],
                      ["a4", "A4 sheet printer"],
                      ["4x6", "4x6 photo paper"],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="idstudio-check">
                      <input type="radio" name="idstudio-printer" checked={prefs.printer === value} onChange={() => setPref("printer", value)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Printing options</legend>
                <div className="idstudio-check-list two">
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.rotateFront} onChange={(event) => setPref("rotateFront", event.target.checked)} />
                    <span>Rotate front</span>
                  </label>
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.rotateBack} onChange={(event) => setPref("rotateBack", event.target.checked)} />
                    <span>Rotate back</span>
                  </label>
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.outline} onChange={(event) => setPref("outline", event.target.checked)} />
                    <span>A4 cutting guidelines</span>
                  </label>
                </div>
                <div className="idstudio-inline">
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.stampOn} onChange={(event) => setPref("stampOn", event.target.checked)} />
                    <span>Stamp</span>
                  </label>
                  <select value={prefs.stampText} disabled={!prefs.stampOn} onChange={(event) => setPref("stampText", event.target.value)}>
                    {STAMPS.map((stamp) => (
                      <option key={stamp} value={stamp}>
                        {stamp}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <fieldset className="idstudio-fieldset">
                <legend>Accessibility</legend>
                <div className="idstudio-check-list">
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.passwordFromFilename} onChange={(event) => setPref("passwordFromFilename", event.target.checked)} />
                    <span>
                      Filenames contain password
                      <small>Tries the file name, e.g. RAHU1990.pdf</small>
                    </span>
                  </label>
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.showPassword} onChange={(event) => setPref("showPassword", event.target.checked)} />
                    <span>Show password</span>
                  </label>
                  <label className="idstudio-check">
                    <input type="checkbox" checked={prefs.rememberPassword} onChange={(event) => setPref("rememberPassword", event.target.checked)} />
                    <span>
                      Remember last password
                      <small>Kept in this browser on this computer</small>
                    </span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
          {settingsNote ? <p className="idstudio-status">{settingsNote}</p> : null}
          <div className="idstudio-dialog-actions">
            <button type="button" className="idstudio-btn" onClick={resetSettings}>
              <RotateCcw size={14} /> Reset settings
            </button>
            <button type="button" className="idstudio-btn primary" onClick={saveSettings}>
              <Save size={14} /> Save
            </button>
          </div>
        </Dialog>
      ) : null}

      {modal === "print" && card ? (
        <Dialog title="Print Card" onClose={() => setModal("")}>
          <div className="idstudio-output-options" role="radiogroup" aria-label="Print format">
            {(Object.keys(OUTPUT_LABELS) as OutputKind[]).map((kind) => (
              <label key={kind} className={outputKind === kind ? "active" : ""}>
                <input type="radio" name="idstudio-output" checked={outputKind === kind} onChange={() => setOutputKind(kind)} />
                <span>
                  <strong>{OUTPUT_LABELS[kind]}</strong>
                  <small>{kind === "card" ? "2 pages, 85.6 × 54 mm, front then back" : kind === "a4" ? "Front and back side by side, actual card size" : "Front above back on 4×6 in paper"}</small>
                </span>
              </label>
            ))}
          </div>
          {outputKind === "a4" ? (
            <label className="idstudio-setting">
              <div>
                <strong>Copies on the sheet</strong>
                <small>Each copy is one front + back row</small>
              </div>
              <select value={prefs.a4Copies} onChange={(event) => setPref("a4Copies", Number(event.target.value))}>
                {[1, 2, 3, 4, 5].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <p className="idstudio-muted">Print at 100% / Actual size, not &ldquo;Fit to page&rdquo;, so the card comes out at the real size.</p>
          <div className="idstudio-dialog-actions">
            <button type="button" className="idstudio-btn" disabled={busyOutput} onClick={() => void makeOutput(outputKind, "download")}>
              <Download size={14} /> Download
            </button>
            <button type="button" className="idstudio-btn primary" disabled={busyOutput} onClick={() => void makeOutput(outputKind, "print")}>
              {busyOutput ? <LoaderCircle size={14} className="spin" /> : <Printer size={14} />} Print
            </button>
          </div>
        </Dialog>
      ) : null}

      {modal === "login" ? (
        <div className="resbuild-confirm-overlay" onClick={() => setModal("")}>
          <div className="resbuild-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <span className="resbuild-confirm-icon">
              <LogIn size={20} />
            </span>
            <h3>Login to continue</h3>
            <p>Your card stays exactly as you left it. Log in (or create a free account) to print or download it.</p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setModal("")}>
                Keep editing
              </button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent("/id-card-maker")}`}>
                Login
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function nearestPreset(value: number) {
  return TEXT_SIZES.reduce((best, size) => (Math.abs(size.value - value) < Math.abs(best - value) ? size.value : best), TEXT_SIZES[0].value);
}

function Pad({
  disabled,
  labels,
  onUp,
  onDown,
  onLeft,
  onRight,
  onCenter,
}: {
  disabled: boolean;
  labels: [string, string, string, string];
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onCenter: () => void;
}) {
  return (
    <div className="idstudio-pad">
      <button type="button" className="up" aria-label={labels[0]} title={labels[0]} disabled={disabled} onClick={onUp}>
        <ChevronUp size={16} />
      </button>
      <button type="button" className="left" aria-label={labels[2]} title={labels[2]} disabled={disabled} onClick={onLeft}>
        <ChevronLeft size={16} />
      </button>
      <button type="button" className="center" aria-label="Reset adjustment" title="Reset adjustment" disabled={disabled} onClick={onCenter} />
      <button type="button" className="right" aria-label={labels[3]} title={labels[3]} disabled={disabled} onClick={onRight}>
        <ChevronRight size={16} />
      </button>
      <button type="button" className="down" aria-label={labels[1]} title={labels[1]} disabled={disabled} onClick={onDown}>
        <ChevronDown size={16} />
      </button>
    </div>
  );
}

function Dialog({ title, onClose, children, wide, size }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; size?: "xl" }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="idstudio-backdrop" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`idstudio-dialog${wide ? " wide" : ""}${size === "xl" ? " xl" : ""}`}>
        <header>
          <h2>{title}</h2>
          <button type="button" className="idstudio-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function SliderSetting({
  label,
  hint,
  min,
  max,
  step = 1,
  unit = "%",
  value,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="idstudio-setting">
      <div>
        <strong>{label}</strong>
        <small>{hint}</small>
      </div>
      <span className="idstudio-range">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
        <output>
          {value}
          {unit}
        </output>
      </span>
    </label>
  );
}

function PhotoEditor({
  jpeg,
  initial,
  onClose,
  onApply,
}: {
  jpeg: Uint8Array;
  initial: PhotoParams;
  onClose: () => void;
  onApply: (params: PhotoParams, jpeg: Uint8Array | null) => void;
}) {
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [params, setParams] = useState<PhotoParams>(initial);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(new Blob([jpeg as BlobPart], { type: "image/jpeg" }));
    loadImage(url).then(setImage).catch(console.error);
    return () => URL.revokeObjectURL(url);
  }, [jpeg]);

  useEffect(() => {
    if (!image || !beforeRef.current) return;
    const before = beforeRef.current;
    before.width = image.naturalWidth;
    before.height = image.naturalHeight;
    before.getContext("2d")?.drawImage(image, 0, 0);
  }, [image]);

  useEffect(() => {
    if (!image || !afterRef.current) return;
    const processed = processPhoto(image, params);
    const after = afterRef.current;
    after.width = processed.width;
    after.height = processed.height;
    after.getContext("2d")?.drawImage(processed, 0, 0);
  }, [image, params]);

  async function apply() {
    if (!image) return;
    const untouched = !params.b && !params.c && !params.s && !params.auto;
    if (untouched) {
      onApply(params, null);
      return;
    }
    setApplying(true);
    const blob = await new Promise<Blob | null>((resolve) => processPhoto(image, params).toBlob(resolve, "image/jpeg", 0.95));
    setApplying(false);
    onApply(params, blob ? new Uint8Array(await blob.arrayBuffer()) : null);
  }

  const sliders: Array<[keyof Omit<PhotoParams, "auto">, string, number, number]> = [
    ["b", "Brightness", -60, 60],
    ["c", "Contrast", -60, 60],
    ["s", "Sharpness", 0, 100],
  ];

  return (
    <Dialog title="Photo Editor" onClose={onClose} wide>
      <div className="idstudio-photo-grid">
        <figure>
          <canvas ref={beforeRef} />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          <canvas ref={afterRef} />
          <figcaption>Cleaned</figcaption>
        </figure>
      </div>
      {sliders.map(([key, label, min, max]) => (
        <label key={key} className="idstudio-setting">
          <strong>{label}</strong>
          <span className="idstudio-range">
            <input type="range" min={min} max={max} value={params[key]} onChange={(event) => setParams((p) => ({ ...p, [key]: Number(event.target.value) }))} />
            <output>{params[key]}</output>
          </span>
        </label>
      ))}
      <label className="idstudio-check">
        <input type="checkbox" checked={params.auto} onChange={(event) => setParams((p) => ({ ...p, auto: event.target.checked }))} />
        <span>Auto-fix dull or faded colours</span>
      </label>
      <div className="idstudio-dialog-actions">
        <button type="button" className="idstudio-btn" onClick={() => setParams({ b: 0, c: 0, s: 0, auto: false })}>
          <RotateCcw size={14} /> Reset
        </button>
        <button type="button" className="idstudio-btn primary" onClick={() => void apply()} disabled={!image || applying}>
          Apply to card
        </button>
      </div>
    </Dialog>
  );
}
