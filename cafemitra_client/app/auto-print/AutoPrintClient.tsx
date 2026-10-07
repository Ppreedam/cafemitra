"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrinterProfileSetup from "./PrinterProfileSetup";
import { BROWSER_PRINT, PrintProfileSelect, useAgentPrint } from "../PrintProfileSelect";
import { sendPdfToAgent } from "@/lib/agent-print";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  Home,
  IdCard,
  Image,
  Landmark,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Play,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Settings,
  Share2,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { clearSession, hasStoredSession } from "@/lib/api";
import { fetchCashCounterStatus, fetchPricingServices, formatPriceItem, normalizePaymentMode, savePricingService, saveServicePrinter, type PriceItem, type PriceRange } from "@/lib/pricing";
import {
  fallbackPrinters,
  fetchAgentHealth,
  fetchAgentPrinterPresets,
  fetchServerAgentStatus,
  saveAgentPrinter,
  type AgentHealth,
} from "@/lib/printpilot-agent";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type SetupStep = {
  key: "download" | "verify" | "printer" | "pricing" | "qr" | "test";
  title: string;
  helper: string;
  icon: LucideIcon;
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print", active: true },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools" },
      { name: "WhatsApp Print", icon: MessageCircle },
      { name: "Passport Photo", icon: UserRound },
      { name: "ID Card Print", icon: IdCard },
      { name: "Admit Card Hub", icon: ClipboardList },
      { name: "Document Services", icon: FileText },
      { name: "All Services", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users },
      { name: "Service Credits & Settlement", icon: Wallet },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const setupSteps: SetupStep[] = [
  { key: "download", title: "Download Agent", helper: "Install the PrintPilot desktop app", icon: Download },
  { key: "verify", title: "Verify Agent", helper: "Check agent connection", icon: ShieldCheck },
  { key: "printer", title: "Printer Profiles", helper: "Create profiles, map paper & color", icon: Printer },
  { key: "pricing", title: "Pricing", helper: "Set BW, color, and minimum order", icon: Wallet },
  { key: "qr", title: "QR Setup", helper: "Generate PrintPilot customer QR", icon: QrCode },
  { key: "test", title: "Test Print", helper: "Send a demo page to printer", icon: Play },
];

const setupStepGuides: Record<SetupStep["key"], { title: string; videoUrl?: string; youtubeId?: string; bullets: string[] }> = {
  download: {
    title: "Install the desktop agent",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-1.mp4",
    youtubeId: "hXQMlTIynDg",
    bullets: [
      "Download the PrintPilot Agent on the computer connected to the printer.",
      "Extract the file if it is downloaded as a ZIP.",
      "Open the agent app and keep it running in the background.",
    ],
  },
  verify: {
    title: "Confirm the agent connection",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-2.mp4",
    youtubeId: "x0MDUlcpWyY",
    bullets: [
      "Make sure the desktop agent is open.",
      "Login in the agent with the same RepetiGo account.",
      "Click Retry here and confirm that the status changes to connected.",
    ],
  },
  printer: {
    title: "Set up print profiles",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-3.mp4",
    youtubeId: "GhFBF4ZY-Bc",
    bullets: [
      "Create a profile: enter a name, pick the printer and click Set Preferences.",
      "In the printer's Preferences window choose paper size, paper type and quality, press OK, then Save Profile.",
      "Under Printer Settings, pick the profile for each paper size + color/grayscale and Save.",
    ],
  },
  pricing: {
    title: "Set customer print pricing",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-4.mp4",
    youtubeId: "0Rsqf4AdST0",
    bullets: [
      "Add charges for black and white, color, or custom services.",
      "Use page ranges when the rate changes by page count.",
      "Choose how customers can pay before saving.",
    ],
  },
  qr: {
    title: "Prepare the customer QR",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-5.mp4",
    youtubeId: "oEuTk6xRWkM",
    bullets: [
      "Generate the QR for your shop.",
      "Download and print the QR poster.",
      "Place it where customers can scan before uploading documents.",
    ],
  },
  test: {
    title: "Run one test print",
    videoUrl: "https://newsbuilder.in/wp-content/uploads/2026/09/Agent-Guide-6.mp4",
    youtubeId: "LmCbdEtdUqU",
    bullets: [
      "Confirm the agent is connected and a printer is selected.",
      "Click Run Test Print to send a sample QR page.",
      "If the test fails, check the agent and printer connection.",
    ],
  },
};

const queue = [
  { file: "Aadhaar.pdf", pages: 3, amount: "Rs. 6", status: "Printed", tone: "#16b978" },
  { file: "Admit-card.pdf", pages: 2, amount: "Rs. 4", status: "Printing", tone: "#1688f5" },
  { file: "PAN-form.pdf", pages: 5, amount: "Rs. 10", status: "Pending", tone: "#ff7b1a" },
  { file: "Passport-photo.pdf", pages: 1, amount: "Rs. 10", status: "Failed", tone: "#e9546a" },
];

const paymentModeOptions = [
  { value: "Online Payment", label: "Online Payment" },
  { value: "Both", label: "Online Payment + Cash Counter" },
  { value: "Cash Counter", label: "Only Cash Counter" },
];
export default function AutoPrintClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);

  // Lets a deep link (e.g. the desktop agent's "wrong printer" alert CTA)
  // land directly on a given step instead of always starting at Step 1 -
  // ?step=<step key>, matching SetupStep["key"].
  useEffect(() => {
    const stepKey = searchParams.get("step");
    if (!stepKey) return;
    const index = setupSteps.findIndex((step) => step.key === stepKey);
    if (index >= 0) setActiveStep(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Self-hosted MP4 is tried first for each step's guide video; the YouTube
  // embed is kept only as a fallback for when the MP4 fails to load, since
  // relying on YouTube alone pulls in its own player chrome/related-video
  // overlay that made the guide video look wrong.
  const [guideVideoFailed, setGuideVideoFailed] = useState(false);
  const [agentDownloaded, setAgentDownloaded] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [agentMessage, setAgentMessage] = useState("Run the desktop agent, then check the connection.");
  const [isVerifyingAgent, setIsVerifyingAgent] = useState(false);
  // Guards against overlapping verifyAgent() calls - the background poll
  // (see the effect below) fires every 4s, but a single check can take
  // longer than that once it falls through all three layers.
  const verifyInFlightRef = useRef(false);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>(fallbackPrinters);
  const [selectedPrinter, setSelectedPrinter] = useState(fallbackPrinters[0]);
  const [printerSaved, setPrinterSaved] = useState(false);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: "black_white", label: "Black & White", rate: 2 },
    { id: "color", label: "Color", rate: 10 },
  ]);
  const [paymentMode, setPaymentMode] = useState("Online Payment");
  const [cashCounterAvailable, setCashCounterAvailable] = useState(true);
  const [cashCounterReason, setCashCounterReason] = useState("");
  const [pricingMessage, setPricingMessage] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(true);
  const [isSavingShopStatus, setIsSavingShopStatus] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const [shopCode, setShopCode] = useState("CM0000");
  const [shopName, setShopName] = useState("RepetiGo Shop");
  const [qrUrl, setQrUrl] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [posterPreviewUrl, setPosterPreviewUrl] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "printing" | "success">("idle");
  const [testPrintDone, setTestPrintDone] = useState(false);
  const testPrint = useAgentPrint("auto-print-test");
  const [testPrintMessage, setTestPrintMessage] = useState("");
  const [testPrintError, setTestPrintError] = useState("");
  const [qrDownloadError, setQrDownloadError] = useState("");
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);
  const printerReady = printerSaved && Boolean(selectedPrinter);
  const pricingReady = pricingSaved && priceItems.length > 0;
  const qrSetupReady = qrReady || (agentConnected && printerReady && pricingReady && Boolean(qrUrl));
  const testPrintReady = testPrintDone || testStatus === "success";
  const stepCompletion: Record<SetupStep["key"], boolean> = {
    download: agentDownloaded || agentConnected,
    verify: agentConnected,
    printer: printerReady,
    pricing: pricingReady,
    qr: qrSetupReady,
    test: testPrintReady,
  };
  const visibleStepCompletion: Record<SetupStep["key"], boolean> = agentConnected
    ? stepCompletion
    : {
        download: false,
        verify: false,
        printer: false,
        pricing: false,
        qr: false,
        test: false,
      };

  const completedCount = setupSteps.filter((step) => visibleStepCompletion[step.key]).length;
  const progressPercent = Math.round((completedCount / setupSteps.length) * 100);
  const progress = `${progressPercent}%`;
  const printPilotActive = completedCount === setupSteps.length;
  const currentStep = setupSteps[activeStep];
  const CurrentStepIcon = currentStep.icon;
  const currentGuide = setupStepGuides[currentStep.key];

  useEffect(() => {
    setGuideVideoFailed(false);
  }, [activeStep]);

  useEffect(() => {
    if (!hasStoredSession()) {
      router.push(`/login?next=${encodeURIComponent("/auto-print")}`);
      return;
    }

    const storedUser = readJson<{ id?: string }>("cafemitra_user");
    const storedShop = readJson<{ shopName?: string }>("cafemitra_shop");
    const code = `CM${String(storedUser.id || "0").padStart(4, "0")}`;
    const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || window.location.origin;
    setShopCode(code);
    setShopName(storedShop.shopName || "RepetiGo Shop");
    setQrUrl(`${publicBaseUrl}/s/${code}`);

    loadPricingSettings();

    fetchCashCounterStatus().then((status) => {
      setCashCounterAvailable(status.available);
      setCashCounterReason(status.reason);
    });

    verifyAgent({ silent: true });
  }, [router]);

  // Step 2 used to need a manual "Retry" click once the agent was actually
  // up - poll quietly in the background after Download is clicked (no
  // point before that) until it connects, and re-check the moment the
  // browser tab regains focus (the likely moment right after installing
  // and starting the agent in another window), so Verify completes on its
  // own instead of making the owner come back and click it.
  useEffect(() => {
    if (!agentDownloaded || agentConnected) return;
    const interval = window.setInterval(() => {
      verifyAgent({ silent: true });
    }, 4000);
    function handleVisible() {
      if (document.visibilityState === "visible") verifyAgent({ silent: true });
    }
    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentDownloaded, agentConnected]);

  // Step 3 (Select Printer) has the same gap Step 2 used to: the desktop
  // agent can now report its own printer straight to the server (its own
  // Printer Setup screen, right after login - see CafeMitraApi.cs's
  // SaveSelectedPrinter), but this page only ever read that once, on
  // mount. Poll the same settings quietly until a printer shows up, so
  // picking it in the agent completes this step here too without a manual
  // refresh - same reasoning as the agent-verify poll above.
  useEffect(() => {
    if (printerReady) return;
    const interval = window.setInterval(() => {
      loadPricingSettings();
    }, 4000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printerReady]);

  useEffect(() => {
    if (currentStep.key !== "qr" || !qrImage) return;
    let cancelled = false;
    loadLogoDataUrl()
      .then((logoImage) => {
        if (cancelled) return;
        const svg = buildQrPosterSvg(shopName, shopCode, qrUrl, qrImage, logoImage);
        setPosterPreviewUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [currentStep.key, qrImage, qrUrl, shopCode, shopName]);

  useEffect(() => {
    if (currentStep.key !== "qr" || !qrUrl || qrImage) return;
    generateQr({ copyToClipboard: false }).catch(() => undefined);
  }, [currentStep.key, qrImage, qrUrl]);

  async function loadPricingSettings() {
    try {
      const services = await fetchPricingServices();
      const autoPrint = services.find((service) => service.serviceKey === "auto_document_print");
      if (!autoPrint) return;
      setPriceItems((current) => (Array.isArray(autoPrint.settings.priceItems) ? autoPrint.settings.priceItems : current));
      setPaymentMode(normalizePaymentMode(String(autoPrint.settings.paymentMode ?? "Online Payment")));
      setPricingSaved(Boolean(autoPrint.settings.pricingSaved));
      setTestPrintDone(Boolean(autoPrint.settings.testPrintDone));
      setIsShopOpen(autoPrint.settings.isOpen !== false);
      const savedPrinter = String(autoPrint.settings.selectedPrinter || "").trim();
      if (savedPrinter) {
        setSelectedPrinter(savedPrinter);
        setPrinterSaved(true);
      }
    } catch {
      // Best-effort - the mount call and the background poll both swallow
      // failures the same way the original inline fetch did.
    }
  }

  async function verifyAgent(options: { silent?: boolean } = {}) {
    if (verifyInFlightRef.current) return; // a poll tick landed mid-check - skip, the next one will catch up
    verifyInFlightRef.current = true;
    if (!options.silent) {
      setIsVerifyingAgent(true);
      setAgentMessage("Checking local PrintPilot Agent...");
    }

    try {
      // 1) The local agent's own /status - richest signal (printers,
      // account, already-selected printer) when the browser can reach it.
      const health = await fetchAgentHealth();
      let connected = health.status === "running";
      let scannedPrinters = Array.isArray(health.printers) && health.printers.length ? health.printers : fallbackPrinters;
      let viaServer = false;

      // 2) The same local bridge's /printer-presets - a second real call,
      // in case /status's own "running" flag was momentarily wrong (the
      // desktop agent can legitimately report "stopped" for an instant
      // around a WebSocket reconnect) while the bridge itself is clearly
      // reachable - this call succeeding proves that on its own.
      if (!connected) {
        try {
          const presets = await fetchAgentPrinterPresets();
          if (Array.isArray(presets.printers) && presets.printers.length) {
            connected = true;
            scannedPrinters = presets.printers;
          }
        } catch {
          // Still unreachable locally - fall through to the server check.
        }
      }

      // 3) RepetiGo's own server, for when the browser can't reach
      // 127.0.0.1:8765 at all (Chrome's Private Network Access blocking an
      // outdated agent build, a firewall, antivirus...). Confirms the
      // agent's real connection to RepetiGo - the one that actually
      // delivers print jobs - instead of the browser's own loopback
      // reachability, which isn't actually what matters here.
      if (!connected) {
        try {
          const serverStatus = await fetchServerAgentStatus();
          connected = serverStatus.connected;
          viaServer = connected;
        } catch {
          // Couldn't even reach RepetiGo - genuinely offline.
        }
      }

      setAgentConnected(connected);
      setAgentHealth(health);
      setAvailablePrinters(scannedPrinters);
      if (!connected) {
        setPrinterSaved(false);
      }

      if (health.printer && scannedPrinters.includes(health.printer)) {
        setSelectedPrinter(health.printer);
      } else if (!scannedPrinters.includes(selectedPrinter)) {
        setSelectedPrinter(scannedPrinters[0] || "");
      }

      setAgentMessage(
        connected
          ? viaServer
            ? "Agent Connected (confirmed via RepetiGo - this browser can't reach it directly). Printer list may be out of date; reinstalling the PrintPilot Agent usually fixes this."
            : formatAgentConnectedMessage(health)
          : "Agent found, but not running. Start it from the desktop app.",
      );

    } catch {
      setAgentConnected(false);
      setAgentHealth(null);
      setAgentMessage("Agent not found. Download, open, and start the desktop app.");
    } finally {
      verifyInFlightRef.current = false;
      setIsVerifyingAgent(false);
    }
  }

  // Prints the same A4 QR poster PDF as Step 5's Download, through the
  // agent: with the chosen print profile, or on the saved printer.
  async function runTestPrint() {
    setTestPrintMessage("");
    setTestPrintError("");
    setTestStatus("printing");
    try {
      const image = qrImage || (await createQrImage(qrUrl));
      if (!qrImage) {
        setQrImage(image);
        setQrReady(true);
      }
      const logoImage = await loadLogoDataUrl();
      const pdfBytes = await buildQrPosterPdf(buildQrPosterSvg(shopName, shopCode, qrUrl, image, logoImage));
      const useProfile = testPrint.profile && testPrint.profile !== BROWSER_PRINT;
      const result = await sendPdfToAgent(pdfBytes, {
        profile: useProfile ? testPrint.profile : undefined,
        printer: useProfile ? undefined : selectedPrinter,
        fileName: `${shopCode}-qr-poster.pdf`,
      });
      setTestStatus("success");
      setTestPrintMessage(result.message || `QR poster sent to ${result.printer || selectedPrinter}.`);
      setTestPrintDone(true);
      savePricingService("auto_document_print", { testPrintDone: true }).catch(() => undefined);
    } catch (error) {
      setTestStatus("idle");
      setTestPrintError(error instanceof Error ? error.message : "Could not run test print. Is the PrintPilot Agent running?");
    }
  }

  // Step 3 is done once a Printer Settings row is saved. Its printer also
  // becomes the shop's default printer (test print, server selectedPrinter)
  // if none was saved yet.
  async function handlePresetSaved(printer: string) {
    if (printerSaved && selectedPrinter) return;
    try {
      const result = await saveAgentPrinter(printer);
      const savedPrinter = result.printer || printer;
      await saveServicePrinter("auto_document_print", savedPrinter);
      setSelectedPrinter(savedPrinter);
      setPrinterSaved(true);
      window.dispatchEvent(new Event("cafemitra:printers-updated"));
    } catch {
      // The printer setting itself is saved; the default printer is retried on the next save.
    }
  }

  async function saveAutoPrintPricing() {
    setPricingMessage("");
    setPricingError("");
    setIsSavingPricing(true);
    try {
      await savePricingService("auto_document_print", {
        paymentMode,
        priceItems,
        pricingSaved: true,
      });
      setPricingSaved(true);
      setPricingMessage("PrintPilot pricing saved.");
    } catch (error) {
      setPricingError(error instanceof Error ? error.message : "Could not save pricing.");
    } finally {
      setIsSavingPricing(false);
    }
  }

  async function toggleShopOpenStatus() {
    const nextStatus = !isShopOpen;
    setIsSavingShopStatus(true);
    try {
      await savePricingService("auto_document_print", { isOpen: nextStatus });
      setIsShopOpen(nextStatus);
    } catch {
      setPricingError("Could not update shop open status.");
    } finally {
      setIsSavingShopStatus(false);
    }
  }

  function addPriceItem() {
    setPricingSaved(false);
    const nextIndex = priceItems.length + 1;
    setPriceItems((current) => [...current, { id: `${Date.now()}-${nextIndex}`, label: `Charge ${nextIndex}`, rate: 0 }]);
  }

  function updatePriceItem(itemId: string, field: keyof PriceItem, value: string) {
    setPricingSaved(false);
    setPriceItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: field === "rate" ? Number(value || 0) : value } : item)),
    );
  }

  function addPriceRange(itemId: string) {
    setPricingSaved(false);
    setPriceItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;
        const ranges = item.ranges || [];
        const nextMin = ranges.length ? Number(ranges[ranges.length - 1].maxPages || ranges[ranges.length - 1].minPages) + 1 : 1;
        return {
          ...item,
          ranges: [...ranges, { id: `${Date.now()}-${ranges.length + 1}`, minPages: nextMin, maxPages: undefined, rate: item.rate }],
        };
      }),
    );
  }

  function updatePriceRange(itemId: string, rangeId: string, field: keyof PriceRange, value: string) {
    setPricingSaved(false);
    setPriceItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ranges: (item.ranges || []).map((range) =>
                range.id === rangeId
                  ? {
                      ...range,
                      [field]: field === "maxPages" && value === "" ? undefined : Number(value || 0),
                    }
                  : range,
              ),
            }
          : item,
      ),
    );
  }

  function removePriceRange(itemId: string, rangeId: string) {
    setPricingSaved(false);
    setPriceItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ranges: (item.ranges || []).filter((range) => range.id !== rangeId) } : item)),
    );
  }

  function removePriceItem(itemId: string) {
    setPricingSaved(false);
    setPriceItems((current) => (current.length > 1 ? current.filter((item) => item.id !== itemId) : current));
  }

  async function generateQr(options: { copyToClipboard?: boolean } = {}) {
    const image = await createQrImage(qrUrl);
    setQrImage(image);
    setQrReady(true);
    if (options.copyToClipboard !== false && qrUrl) navigator.clipboard?.writeText(qrUrl).catch(() => undefined);
    return image;
  }

  async function downloadQr() {
    setQrDownloadError("");
    setIsDownloadingQr(true);
    try {
      const image = qrImage || (await generateQr({ copyToClipboard: false }));
      const logoImage = await loadLogoDataUrl();
      const svg = buildQrPosterSvg(shopName, shopCode, qrUrl, image, logoImage);
      const pdfBytes = await buildQrPosterPdf(svg);
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${shopCode}-qr-poster.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      setQrDownloadError(error instanceof Error ? error.message : "Could not generate the QR poster PDF.");
    } finally {
      setIsDownloadingQr(false);
    }
  }

  function shareQr() {
    if (navigator.share) {
      navigator.share({ title: `${shopName} PrintPilot QR`, text: "Upload. Pay. Print.", url: qrUrl }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(qrUrl).catch(() => undefined);
  }

  return (
    <DashboardShell activePath="/auto-print">
      <div className="dashboard auto-print-dashboard">
          <WalletLimitBanner />
          <div className="dashboard-hero auto-print-hero">
            <div>
              <span className="auto-print-kicker">RepetiGo PrintPilot</span>
              <h1>PrintPilot Setup</h1>
              <p>Upload. Pay. Print. Customers scan the QR, upload a document, complete payment, and send the job to the PrintPilot printer.</p>
            </div>
            <div className="auto-print-hero-actions">
              <span className={`status-pill ${printPilotActive ? "" : "warning"}`}>{printPilotActive ? "PrintPilot Active" : "Setup in Progress"}</span>
              <button
                className={`shop-status-toggle ${isShopOpen ? "open" : "closed"}`}
                type="button"
                role="switch"
                aria-checked={isShopOpen}
                onClick={toggleShopOpenStatus}
                disabled={isSavingShopStatus}
              >
                <span className="shop-status-toggle-track">
                  <span className="shop-status-toggle-thumb" />
                </span>
                <span className="shop-status-toggle-label">
                  {isSavingShopStatus ? "Updating..." : isShopOpen ? "Shop Open" : "Shop Closed"}
                </span>
              </button>
            </div>
          </div>

          <section className="auto-print-layout" aria-label="PrintPilot setup wizard">
            <aside className="panel setup-wizard-panel">
              <div className="setup-progress-header">
                <div>
                  <strong>{completedCount}/{setupSteps.length} ready</strong>
                  <span>MVP setup progress</span>
                </div>
                  <span>{progressPercent}%</span>
              </div>
              <div className="setup-progress">
                <span style={{ width: progress }} />
              </div>
              <div className="wizard-step-list">
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const complete = visibleStepCompletion[step.key];

                  return (
                    <button
                      className={`wizard-step ${activeStep === index ? "active" : ""} ${complete ? "complete" : ""}`}
                      key={step.key}
                      type="button"
                      onClick={() => setActiveStep(index)}
                    >
                      <span className="wizard-step-icon">
                        <Icon size={18} />
                      </span>
                      <span>
                        <strong>Step {index + 1}: {step.title}</strong>
                        <small>{step.helper}</small>
                      </span>
                      {complete ? <CheckCircle2 size={18} /> : null}
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="panel setup-action-panel">
              {currentStep.key !== "qr" ? (
                <div className="panel-title-row">
                  <div>
                    <span className="setup-badge">Step {activeStep + 1}</span>
                    <h2>{currentStep.title}</h2>
                  </div>
                  <span className="icon-tile" style={{ "--tile-color": "#1688f5" } as React.CSSProperties}>
                    <CurrentStepIcon size={23} />
                  </span>
                </div>
              ) : null}

              {currentStep.key === "verify" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${agentConnected ? "success" : "danger"}`}>
                    <span />
                    <strong>{agentConnected ? "Agent Connected" : agentHealth ? "Agent Stopped" : "Agent Not Found"}</strong>
                    <p>{agentMessage}</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={() => verifyAgent()} disabled={isVerifyingAgent}>
                    <RefreshCw size={16} /> {isVerifyingAgent ? "Checking..." : "Retry"}
                  </button>
                </div>
              ) : null}

              {currentStep.key === "download" ? (
                <div className="wizard-action-content">
                  <div className="agent-download-card">
                    <Download size={24} />
                    <div>
                      <strong>Download PrintPilot Agent</strong>
                      <p>Install the desktop app on the computer connected to your printer.</p>
                    </div>
                  </div>
                  <a className="btn btn-primary" href="https://raw.githubusercontent.com/httpsankit/cafemitra_updates/refs/heads/main/RepetigoInstaller.exe" target="_blank" rel="noreferrer" onClick={() => setAgentDownloaded(true)}>
                    <Download size={16} /> Download Agent
                  </a>
                </div>
              ) : null}

              {currentStep.key === "printer" ? (
                <div className="wizard-action-content">
                  <PrinterProfileSetup agentConnected={agentConnected} onPresetSaved={handlePresetSaved} />
                </div>
              ) : null}

              {currentStep.key === "pricing" ? (
                <div className="wizard-action-content print-pricing-editor">
                  <div className="panel-title-row compact">
                    <div>
                      <h2>Print Categories</h2>
                      <p>Create a category, then add page ranges inside it.</p>
                    </div>
                    <button className="icon-action-btn" type="button" onClick={addPriceItem} aria-label="Add price item">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="price-item-list">
                    {priceItems.map((item, itemIndex) => (
                      <div className="price-item-row" key={item.id}>
                        <div className="price-item-header">
                          <span>Category {itemIndex + 1}</span>
                          <strong>{item.label || "New print category"}</strong>
                        </div>
                        <div className="price-item-main">
                          <label className="auto-field">
                            <span>Category Name</span>
                            <input value={item.label} onChange={(event) => updatePriceItem(item.id, "label", event.target.value)} />
                          </label>
                          <label className="auto-field">
                            <span>Default Per Page</span>
                            <input min="0" type="number" value={item.rate} onChange={(event) => updatePriceItem(item.id, "rate", event.target.value)} />
                          </label>
                          <button className="icon-action-btn danger" type="button" onClick={() => removePriceItem(item.id)} aria-label="Remove price item">
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <details className="price-range-panel" open={(item.ranges || []).length > 0}>
                          <summary>
                            <span>Page Range Rules</span>
                            <small>{(item.ranges || []).length ? `${(item.ranges || []).length} active` : "General price applies"}</small>
                          </summary>
                          {(item.ranges || []).map((range) => (
                            <div className="price-range-row" key={range.id}>
                              <label className="auto-field">
                                <span>From</span>
                                <input min="1" type="number" value={range.minPages} onChange={(event) => updatePriceRange(item.id, range.id, "minPages", event.target.value)} />
                              </label>
                              <label className="auto-field">
                                <span>To</span>
                                <input min="1" placeholder="Up" type="number" value={range.maxPages ?? ""} onChange={(event) => updatePriceRange(item.id, range.id, "maxPages", event.target.value)} />
                              </label>
                              <label className="auto-field">
                                <span>Per Page</span>
                                <input min="0" type="number" value={range.rate} onChange={(event) => updatePriceRange(item.id, range.id, "rate", event.target.value)} />
                              </label>
                              <button className="icon-action-btn danger" type="button" onClick={() => removePriceRange(item.id, range.id)} aria-label="Remove page range">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                          <div className="price-range-footer">
                            <small>{formatPriceItem(item)}</small>
                            <button type="button" onClick={() => addPriceRange(item.id)}>
                              <Plus size={14} /> Add range
                            </button>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                  <div className="payment-mode-list">
                    {paymentModeOptions.map((option) => {
                      const needsCashCounter = option.value === "Both" || option.value === "Cash Counter";
                      const isLocked = needsCashCounter && !cashCounterAvailable;
                      return (
                        <button
                          className={paymentMode === option.value ? "active" : ""}
                          key={option.value}
                          type="button"
                          disabled={isLocked}
                          title={isLocked ? cashCounterReason : undefined}
                          onClick={() => {
                            setPaymentMode(option.value);
                            setPricingSaved(false);
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="payment-mode-note">Online Payment is available to customers by default. Turn on "Online Payment + Cash Counter" to also let customers pay at your counter, or pick "Only Cash Counter" to accept counter payment only.</p>
                  {!cashCounterAvailable ? <p className="payment-mode-note payment-mode-locked">{cashCounterReason}</p> : null}
                  {pricingMessage ? <div className="profile-alert success">{pricingMessage}</div> : null}
                  {pricingError ? <div className="profile-alert error">{pricingError}</div> : null}
                  <button className="btn btn-primary" type="button" onClick={saveAutoPrintPricing} disabled={isSavingPricing}>
                    <Wallet size={16} /> {isSavingPricing ? "Saving..." : "Save Pricing"}
                  </button>
                </div>
              ) : null}

              {currentStep.key === "qr" ? (
                <div className="wizard-action-content qr-action">
                  <div className="qr-poster-shell">
                    <div className="qr-buttons">
                      <button className="btn btn-primary" disabled={!qrSetupReady || isDownloadingQr} type="button" onClick={downloadQr}>
                        <Download size={16} /> {isDownloadingQr ? "Preparing PDF..." : "Download"}
                      </button>
                      <button className="btn" disabled={!qrSetupReady} type="button" onClick={shareQr}>
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                    {qrDownloadError ? <div className="profile-alert error">{qrDownloadError}</div> : null}
                    {/* The exact poster that Download and Test Print use, so the
                        preview always matches the PDF (shape, icons, text). */}
                    {posterPreviewUrl ? (
                      <img className="qr-poster-image" src={posterPreviewUrl} alt={`QR poster for ${shopName}`} />
                    ) : (
                      <div className="qr-poster-image qr-poster-image-loading">Preparing poster...</div>
                    )}
                  </div>
                </div>
              ) : null}

              {currentStep.key === "test" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${testPrintReady ? "success" : "info"}`}>
                    <span />
                    <strong>{testStatus === "printing" ? "Sending QR Poster..." : testStatus === "success" ? "QR Poster Printed" : testPrintReady ? "Test Print Ready" : "Ready for test print"}</strong>
                    <p>{testStatus === "success" ? testPrintMessage : testPrintReady ? "Your A4 QR poster (same as the Step 5 download) will print through the PrintPilot Agent." : "Your A4 QR poster (same as the Step 5 download) will be sent to the printer through the PrintPilot Agent."}</p>
                  </div>
                  {testPrintError ? <div className="profile-alert error">{testPrintError}</div> : null}
                  <PrintProfileSelect print={testPrint} noProfileLabel={selectedPrinter ? `Saved printer: ${selectedPrinter}` : "Saved printer"} />
                  <button className="btn btn-primary" type="button" onClick={runTestPrint} disabled={!agentConnected || !printerReady || testStatus === "printing"}>
                    <Play size={16} /> {testStatus === "printing" ? "Sending..." : "Run Test Print"}
                  </button>
                </div>
              ) : null}

            </section>

            <aside className="dashboard-stack setup-guide-stack">
              <article className="panel setup-guide-panel">
                <div className="panel-title-row compact">
                  <div>
                    <h2>Step Guide</h2>
                    <p>Step {activeStep + 1}: {currentStep.title}</p>
                  </div>
                  <span className="agent-status success">Help</span>
                </div>
                <div className="guide-video">
                  {currentGuide.videoUrl && !guideVideoFailed ? (
                    <video
                      key={currentStep.key}
                      src={currentGuide.videoUrl}
                      title={`${currentGuide.title} - video guide`}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      onError={() => setGuideVideoFailed(true)}
                    />
                  ) : currentGuide.youtubeId ? (
                    <iframe
                      key={currentStep.key}
                      src={`https://www.youtube.com/embed/${currentGuide.youtubeId}?autoplay=1&mute=1&rel=0`}
                      title={`${currentGuide.title} - video guide`}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      frameBorder={0}
                    />
                  ) : (
                    <div className="guide-video-placeholder">
                      <Play size={28} />
                      <strong>Video guide</strong>
                      <span>Video clip coming soon for this step.</span>
                    </div>
                  )}
                </div>
                <div className="guide-instructions">
                  <strong>{currentGuide.title}</strong>
                  <ol>
                    {currentGuide.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>
              </article>
            </aside>
          </section>

          {/* <section className="panel print-queue-panel" aria-label="Auto print queue">
            <div className="panel-title-row compact">
              <div>
                <h2>PrintPilot Queue</h2>
                <p>Live view of pending, printing, completed, and failed jobs.</p>
              </div>
              <button className="btn" type="button">
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            <div className="queue-table">
              {queue.map((job) => (
                <div className="queue-row" key={job.file}>
                  <FileCheck2 size={18} />
                  <strong>{job.file}</strong>
                  <span>{job.pages} Pages</span>
                  <span>{job.amount}</span>
                  <span className="tag" style={{ "--tag-color": job.tone } as React.CSSProperties}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </section> */}
      </div>
    </DashboardShell>
  );
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}

async function createQrImage(value: string) {
  const { default: QRCode } = await import("qrcode");
  return QRCode.toDataURL(value, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#111a44", light: "#ffffff" },
  });
}

function formatDisplayUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
}

async function loadLogoDataUrl() {
  const response = await fetch("/logo.png");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not load the RepetiGo logo."));
    reader.readAsDataURL(blob);
  });
}

function formatAgentConnectedMessage(health: AgentHealth) {
  const account = health.account ? `Signed in as ${health.account}.` : "";
  const printer = health.printer ? `Printer: ${health.printer}.` : "Select a printer to continue.";
  return [account, printer].filter(Boolean).join(" ");
}

function buildQrPosterSvg(shopName: string, shopCode: string, qrUrl: string, qrImage: string, logoImage: string) {
  const qrMarkup = qrImage
    ? `<image href="${qrImage}" x="184" y="298" width="352" height="352"/>`
    : `<rect x="184" y="298" width="352" height="352" rx="18" fill="#eef4ff"/>
       <path d="M330 444h60v60h-60zM252 348h88v88h-88zM380 348h88v88h-88zM252 558h88v88h-88z" fill="none" stroke="#3b6fd1" stroke-width="15"/>`;

  const displayUrl = escapeSvg(formatDisplayUrl(qrUrl) || "repetigo.com");

  // 24x24 icons - the same paths as the on-screen preview - centred at
  // (cx, cy), so the PDF icons look exactly like the preview.
  const icon = (cx: number, cy: number, size: number, body: string) =>
    `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${size / 24})" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
  const shieldLockIcon = `<path d="M12 2L4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3z" stroke-width="1.6"/><rect x="9.3" y="10.5" width="5.4" height="4.4" rx="1" stroke-width="1.4"/><path d="M10.2 10.5V9a1.8 1.8 0 0 1 3.6 0v1.5" stroke-width="1.4"/>`;
  const scanIcon = `<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" stroke-width="1.8"/><rect x="8" y="9" width="3" height="3" fill="#ffffff" stroke="none"/><rect x="13" y="9" width="3" height="3" fill="#ffffff" stroke="none"/><rect x="8" y="13" width="3" height="3" fill="#ffffff" stroke="none"/>`;
  const uploadIcon = `<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A5.5 5.5 0 0 1 17.4 9.5 4 4 0 0 1 17 18H7z" stroke-width="1.7"/><path d="M12 17v-6m0 0-2.4 2.4M12 11l2.4 2.4" stroke-width="1.7"/>`;
  const printIcon = `<path d="M6 9V4h12v5" stroke-width="1.7"/><rect x="4" y="9" width="16" height="7" rx="1.4" stroke-width="1.7"/><rect x="7" y="14" width="10" height="6" stroke-width="1.7"/>`;
  const secureIcon = `<path d="M12 2L4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3z" stroke-width="1.6"/><path d="M9 12l2 2 4-4" stroke-width="1.7"/>`;
  const privateIcon = `<circle cx="12" cy="8" r="3.2" stroke-width="1.6"/><path d="M6 20c0-3.3 2.7-6 6-6" stroke-width="1.6"/><rect x="12.4" y="14.5" width="6.5" height="5.5" rx="1" stroke-width="1.6"/><path d="M14 14.5v-1.3a1.6 1.6 0 0 1 3.2 0v1.3" stroke-width="1.6"/>`;
  const deleteIcon = `<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" stroke-width="1.6"/><path d="M10 11v6M14 11v6" stroke-width="1.6"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1120" viewBox="0 0 720 1120" font-family="'Baloo 2', Arial, sans-serif">
  <defs>
    <linearGradient id="goGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3b6fd1"/>
      <stop offset="1" stop-color="#22c0a2"/>
    </linearGradient>
  </defs>
  <rect width="720" height="1120" fill="#ffffff"/>

  <image href="${logoImage}" x="170" y="32" width="380" height="79.7"/>

  <line x1="150" y1="148" x2="298" y2="148" stroke="#c8cee3" stroke-width="2"/>
  <circle cx="360" cy="148" r="24" fill="url(#goGrad)"/>
  ${icon(360, 148, 30, shieldLockIcon)}
  <line x1="422" y1="148" x2="570" y2="148" stroke="#c8cee3" stroke-width="2"/>

  <text x="360" y="220" text-anchor="middle" font-size="58" font-weight="800" fill="#1a2456">Scan to Print</text>
  <text x="360" y="260" text-anchor="middle" font-size="24" font-weight="600" fill="#8a8f9c">Secure. Private. AI-Powered.</text>

  <path d="M184 334v-24a12 12 0 0112-12h24" fill="none" stroke="#3b6fd1" stroke-width="7"/>
  <path d="M536 334v-24a12 12 0 00-12-12h-24" fill="none" stroke="#22c0a2" stroke-width="7"/>
  <path d="M184 614v24a12 12 0 0012 12h24" fill="none" stroke="#3b6fd1" stroke-width="7"/>
  <path d="M536 614v24a12 12 0 01-12 12h-24" fill="none" stroke="#22c0a2" stroke-width="7"/>
  ${qrMarkup}

  <text x="284" y="744" text-anchor="middle" font-size="26" font-weight="800" fill="#1a2456">...</text>
  <text x="436" y="744" text-anchor="middle" font-size="26" font-weight="800" fill="#1a2456">...</text>

  <circle cx="222" cy="728" r="36" fill="#3b6fd1"/>
  ${icon(222, 728, 40, scanIcon)}
  <text x="222" y="792" text-anchor="middle" font-size="24" font-weight="700" fill="#1a2456">Scan</text>

  <circle cx="360" cy="728" r="36" fill="#3b6fd1"/>
  ${icon(360, 728, 40, uploadIcon)}
  <text x="360" y="792" text-anchor="middle" font-size="24" font-weight="700" fill="#1a2456">Upload</text>

  <circle cx="498" cy="728" r="36" fill="#22c0a2"/>
  ${icon(498, 728, 40, printIcon)}
  <text x="498" y="792" text-anchor="middle" font-size="24" font-weight="700" fill="#1a2456">Print</text>

  <rect x="0" y="826" width="720" height="68" fill="#22c0a2"/>
  <text x="360" y="868" text-anchor="middle" font-size="28" font-weight="700" letter-spacing="4" fill="#ffffff">${escapeSvg(shopName.toUpperCase())}</text>

  <rect x="0" y="894" width="720" height="196" fill="#1a2456"/>
  <line x1="248" y1="924" x2="248" y2="1058" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
  <line x1="472" y1="924" x2="472" y2="1058" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>

  ${icon(124, 948, 44, secureIcon)}
  <text x="124" y="1004" text-anchor="middle" font-size="24" font-weight="700" fill="#ffffff">Secure</text>
  <text x="124" y="1030" text-anchor="middle" font-size="16" fill="#c7cbe0">End-to-end</text>
  <text x="124" y="1050" text-anchor="middle" font-size="16" fill="#c7cbe0">Encryption</text>

  ${icon(360, 948, 44, privateIcon)}
  <text x="360" y="1004" text-anchor="middle" font-size="24" font-weight="700" fill="#ffffff">Private</text>
  <text x="360" y="1030" text-anchor="middle" font-size="16" fill="#c7cbe0">Your Data</text>
  <text x="360" y="1050" text-anchor="middle" font-size="16" fill="#c7cbe0">is Safe</text>

  ${icon(596, 948, 44, deleteIcon)}
  <text x="596" y="1004" text-anchor="middle" font-size="24" font-weight="700" fill="#ffffff">Auto-delete</text>
  <text x="596" y="1030" text-anchor="middle" font-size="16" fill="#c7cbe0">Files removed</text>
  <text x="596" y="1050" text-anchor="middle" font-size="16" fill="#c7cbe0">after printing</text>

  <path d="M0 1082C180 1058 540 1058 720 1082V1120H0z" fill="url(#goGrad)"/>
  <text x="360" y="1105" text-anchor="middle" font-size="18" font-weight="700" fill="#ffffff">${displayUrl}</text>
</svg>`;
}

const POSTER_WIDTH = 720;
const POSTER_HEIGHT = 1120;

async function rasterizePosterSvg(svg: string, scale = 3) {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new window.Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not render the QR poster image."));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = POSTER_WIDTH * scale;
    canvas.height = POSTER_HEIGHT * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1] ?? "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function buildQrPosterPdf(svg: string) {
  const [{ PDFDocument }, pngBytes] = await Promise.all([import("pdf-lib"), rasterizePosterSvg(svg)]);

  const pdfDoc = await PDFDocument.create();
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const margin = 24;

  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const pngImage = await pdfDoc.embedPng(pngBytes);

  const posterAspect = POSTER_WIDTH / POSTER_HEIGHT;
  const maxWidth = A4_WIDTH - margin * 2;
  const maxHeight = A4_HEIGHT - margin * 2;
  let drawWidth = maxWidth;
  let drawHeight = drawWidth / posterAspect;
  if (drawHeight > maxHeight) {
    drawHeight = maxHeight;
    drawWidth = drawHeight * posterAspect;
  }

  page.drawImage(pngImage, {
    x: (A4_WIDTH - drawWidth) / 2,
    y: (A4_HEIGHT - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });

  return pdfDoc.save();
}

function escapeSvg(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
