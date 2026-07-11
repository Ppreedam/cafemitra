"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
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
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { clearSession } from "@/lib/api";
import { fetchPricingServices, formatPriceItem, savePricingService, saveServicePrinter, type PriceItem, type PriceRange } from "@/lib/pricing";
import { fallbackPrinters, fetchAgentHealth, runAgentTestPrint, saveAgentPrinter, type AgentHealth } from "@/lib/printpilot-agent";
import { DashboardShell } from "../DashboardShell";

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
      { name: "Wallet & Settlement", icon: Wallet },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const setupSteps: SetupStep[] = [
  { key: "download", title: "Download Agent", helper: "Install the PrintPilot desktop app", icon: Download },
  { key: "verify", title: "Verify Agent", helper: "Check agent connection", icon: ShieldCheck },
  { key: "printer", title: "Select Printer", helper: "Choose default PrintPilot printer", icon: Printer },
  { key: "pricing", title: "Pricing", helper: "Set BW, color, and minimum order", icon: Wallet },
  { key: "qr", title: "QR Setup", helper: "Generate PrintPilot customer QR", icon: QrCode },
  { key: "test", title: "Test Print", helper: "Send a demo page to printer", icon: Play },
];

const setupStepGuides: Record<SetupStep["key"], { title: string; videoUrl?: string; bullets: string[] }> = {
  download: {
    title: "Install the desktop agent",
    bullets: [
      "Download the PrintPilot Agent on the computer connected to the printer.",
      "Extract the file if it is downloaded as a ZIP.",
      "Open the agent app and keep it running in the background.",
    ],
  },
  verify: {
    title: "Confirm the agent connection",
    bullets: [
      "Make sure the desktop agent is open.",
      "Login in the agent with the same RepetiGo account.",
      "Click Retry here and confirm that the status changes to connected.",
    ],
  },
  printer: {
    title: "Choose the default printer",
    bullets: [
      "Select the printer that should receive customer print jobs.",
      "Use Microsoft Print to PDF only for testing.",
      "Save the printer after selection.",
    ],
  },
  pricing: {
    title: "Set customer print pricing",
    bullets: [
      "Add charges for black and white, color, or custom services.",
      "Use page ranges when the rate changes by page count.",
      "Choose how customers can pay before saving.",
    ],
  },
  qr: {
    title: "Prepare the customer QR",
    bullets: [
      "Generate the QR for your shop.",
      "Download and print the QR poster.",
      "Place it where customers can scan before uploading documents.",
    ],
  },
  test: {
    title: "Run one test print",
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

const paymentModes = ["Online Payment", "Cash Counter"];
const PRINTPILOT_AGENT_DOWNLOAD_URL = "https://drive.google.com/";

export default function AutoPrintPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [agentDownloaded, setAgentDownloaded] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [agentMessage, setAgentMessage] = useState("Run the desktop agent, then check the connection.");
  const [isVerifyingAgent, setIsVerifyingAgent] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>(fallbackPrinters);
  const [selectedPrinter, setSelectedPrinter] = useState(fallbackPrinters[0]);
  const [printerMessage, setPrinterMessage] = useState("");
  const [printerError, setPrinterError] = useState("");
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);
  const [printerSaved, setPrinterSaved] = useState(false);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: "black_white", label: "Black & White", rate: 2 },
    { id: "color", label: "Color", rate: 10 },
  ]);
  const [paymentMode, setPaymentMode] = useState("Online Payment");
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
  const [testStatus, setTestStatus] = useState<"idle" | "printing" | "success">("idle");
  const [testPrintMessage, setTestPrintMessage] = useState("");
  const [testPrintError, setTestPrintError] = useState("");
  const printerReady = printerSaved && Boolean(selectedPrinter);
  const pricingReady = pricingSaved && priceItems.length > 0;
  const qrSetupReady = qrReady || (agentConnected && printerReady && pricingReady && Boolean(qrUrl));
  const testPrintReady = testStatus === "success";
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
    const storedUser = readJson<{ id?: string }>("cafemitra_user");
    const storedShop = readJson<{ shopName?: string }>("cafemitra_shop");
    const code = `CM${String(storedUser.id || "0").padStart(4, "0")}`;
    const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || window.location.origin;
    setShopCode(code);
    setShopName(storedShop.shopName || "RepetiGo Shop");
    setQrUrl(`${publicBaseUrl}/s/${code}`);

    fetchPricingServices()
      .then((services) => {
        const autoPrint = services.find((service) => service.serviceKey === "auto_document_print");
        if (!autoPrint) return;
        setPriceItems(Array.isArray(autoPrint.settings.priceItems) ? autoPrint.settings.priceItems : priceItems);
        setPaymentMode(String(autoPrint.settings.paymentMode ?? "Online Payment"));
        setPricingSaved(Boolean(autoPrint.settings.pricingSaved));
        setIsShopOpen(autoPrint.settings.isOpen !== false);
        const savedPrinter = String(autoPrint.settings.selectedPrinter || "").trim();
        if (savedPrinter) {
          setSelectedPrinter(savedPrinter);
          setPrinterSaved(true);
        }
      })
      .catch(() => undefined);

    verifyAgent({ silent: true });
  }, []);

  useEffect(() => {
    if (currentStep.key !== "qr" || !qrUrl || qrImage) return;
    generateQr({ copyToClipboard: false }).catch(() => undefined);
  }, [currentStep.key, qrImage, qrUrl]);

  async function verifyAgent(options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setIsVerifyingAgent(true);
      setAgentMessage("Checking local PrintPilot Agent...");
    }

    try {
      const health = await fetchAgentHealth();
      const connected = health.status === "running";
      setAgentConnected(connected);
      setAgentHealth(health);

      const scannedPrinters = Array.isArray(health.printers) && health.printers.length ? health.printers : fallbackPrinters;
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
          ? formatAgentConnectedMessage(health)
          : "Agent found, but not running. Start it from the desktop app.",
      );
    } catch {
      setAgentConnected(false);
      setAgentHealth(null);
      setAgentMessage("Agent not found. Download, open, and start the desktop app.");
    } finally {
      setIsVerifyingAgent(false);
    }
  }

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
      const result = await runAgentTestPrint({
        printer: selectedPrinter,
        shopName,
        shopCode,
        qrUrl,
        qrImage: image,
      });
      setTestStatus("success");
      setTestPrintMessage(result.message || `QR test page sent to ${result.printer || selectedPrinter}.`);
    } catch (error) {
      setTestStatus("idle");
      setTestPrintError(error instanceof Error ? error.message : "Could not run test print. Is the PrintPilot Agent running?");
    }
  }

  async function savePrinter() {
    setPrinterMessage("");
    setPrinterError("");
    setIsSavingPrinter(true);
    try {
      const result = await saveAgentPrinter(selectedPrinter);
      const scannedPrinters = Array.isArray(result.printers) && result.printers.length ? result.printers : availablePrinters;
      const savedPrinter = result.printer || selectedPrinter;
      await saveServicePrinter("auto_document_print", savedPrinter);
      setAvailablePrinters(scannedPrinters);
      setSelectedPrinter(savedPrinter);
      setPrinterSaved(true);
      setPrinterMessage(`Printer saved: ${savedPrinter}${result.mockMode ? " (Mock Test Mode)" : ""}`);
      await verifyAgent({ silent: true });
      window.dispatchEvent(new Event("cafemitra:printers-updated"));
    } catch (error) {
      setPrinterError(error instanceof Error ? error.message : "Could not save printer. Is the PrintPilot Agent running?");
    } finally {
      setIsSavingPrinter(false);
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
    const image = qrImage || (await generateQr({ copyToClipboard: false }));
    const svg = buildQrPosterSvg(shopName, shopCode, qrUrl, image);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${shopCode}-qr-poster.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
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
          <div className="dashboard-hero auto-print-hero">
            <div>
              <span className="auto-print-kicker">RepetiGo PrintPilot</span>
              <h1>PrintPilot Setup</h1>
              <p>Upload. Pay. Print. Customers scan the QR, upload a document, complete payment, and send the job to the PrintPilot printer.</p>
            </div>
            <div className="auto-print-hero-actions">
              <span className={`status-pill ${printPilotActive ? "" : "warning"}`}>{printPilotActive ? "PrintPilot Active" : "Setup in Progress"}</span>
              <button className={`shop-status-toggle ${isShopOpen ? "open" : "closed"}`} type="button" onClick={toggleShopOpenStatus} disabled={isSavingShopStatus}>
                <span />
                {isSavingShopStatus ? "Updating..." : isShopOpen ? "Shop Open" : "Shop Closed"}
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
                  <a className="btn btn-primary" href={PRINTPILOT_AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer" onClick={() => setAgentDownloaded(true)}>
                    <Download size={16} /> Download Agent
                  </a>
                </div>
              ) : null}

              {currentStep.key === "printer" ? (
                <div className="wizard-action-content">
                  <div className="printer-radio-list">
                    {availablePrinters.map((printer) => (
                      <label className="printer-radio" key={printer}>
                        <input
                          checked={selectedPrinter === printer}
                          name="printer"
                          type="radio"
                          onChange={() => {
                            setSelectedPrinter(printer);
                            setPrinterSaved(false);
                          }}
                        />
                        <span>{printer}</span>
                      </label>
                    ))}
                    {!availablePrinters.length ? (
                      <div className="profile-alert error">No printer found. Install or connect a Windows printer, then verify the agent again.</div>
                    ) : null}
                  </div>
                  {printerMessage ? <div className="profile-alert success">{printerMessage}</div> : null}
                  {printerError ? <div className="profile-alert error">{printerError}</div> : null}
                  <button className="btn btn-primary" type="button" onClick={savePrinter} disabled={!agentConnected || !selectedPrinter || isSavingPrinter}>
                    <Printer size={16} /> {isSavingPrinter ? "Saving..." : "Save Printer"}
                  </button>
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
                    {paymentModes.map((mode) => (
                      <button
                        className={paymentMode === mode ? "active" : ""}
                        key={mode}
                        type="button"
                        onClick={() => {
                          setPaymentMode(mode);
                          setPricingSaved(false);
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
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
                      <button className="btn btn-primary" disabled={!qrSetupReady} type="button" onClick={downloadQr}>
                        <Download size={16} /> Download
                      </button>
                      <button className="btn" disabled={!qrSetupReady} type="button" onClick={shareQr}>
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                    <div className="qr-poster-card">
                      <div className="qr-poster-hero">
                        <Send size={42} />
                        <h3>{shopName}</h3>
                        <p>Scan. Upload. Pay. Print.</p>
                      </div>
                      <div className="qr-poster-body">
                        <div className="poster-qr-frame" aria-label="Generated shop QR preview">
                          {qrImage ? (
                            <>
                              <img src={qrImage} alt="Shop QR code" />
                              <span className="qr-brand-badge poster-brand-badge">
                                <span className="brand-repeti">Repeti</span><span className="brand-go">GO</span>
                              </span>
                            </>
                          ) : (
                            <QrCode size={150} />
                          )}
                        </div>
                        <div className="poster-upload-row">
                          <span className="poster-icon-tile">
                            <Smartphone size={28} />
                          </span>
                          <strong>Scan to Upload Documents</strong>
                        </div>
                        <div className="poster-secure-row">
                          <span className="poster-shield">
                            <ShieldCheck size={34} />
                          </span>
                          <div>
                            <strong>100% Secure Document Upload</strong>
                            <p>Your documents are encrypted, private, and automatically deleted after printing.</p>
                          </div>
                        </div>
                      </div>
                      <div className="qr-poster-footer">
                        <span>Powered by</span>
                        <strong>Repeti<span>Go</span></strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep.key === "test" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${testPrintReady ? "success" : "info"}`}>
                    <span />
                    <strong>{testStatus === "printing" ? "Sending QR Test Page..." : testStatus === "success" ? "QR Test Print Sent" : testPrintReady ? "Test Print Ready" : "Ready for test print"}</strong>
                    <p>{testStatus === "success" ? testPrintMessage : testPrintReady ? `The generated shop QR will print on ${selectedPrinter}.` : `The generated shop QR will be sent to the selected printer: ${selectedPrinter}.`}</p>
                  </div>
                  {testPrintError ? <div className="profile-alert error">{testPrintError}</div> : null}
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
                  {currentGuide.videoUrl ? (
                    <video controls src={currentGuide.videoUrl} />
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

function createQrImage(value: string) {
  return QRCode.toDataURL(value, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#111a44", light: "#ffffff" },
  });
}

function formatAgentConnectedMessage(health: AgentHealth) {
  const account = health.account ? `Signed in as ${health.account}.` : "";
  const printer = health.printer ? `Printer: ${health.printer}.` : "Select a printer to continue.";
  return [account, printer].filter(Boolean).join(" ");
}

function buildQrPosterSvg(shopName: string, shopCode: string, qrUrl: string, qrImage: string) {
  const qrMarkup = qrImage
    ? `<image href="${qrImage}" x="184" y="324" width="352" height="352"/>
       <rect x="266" y="469" width="188" height="50" rx="25" fill="#ffffff" stroke="#1f63f2" stroke-width="5"/>
       <text x="360" y="502" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="900" fill="#08164a">Repeti<tspan fill="#2b6df3">Go</tspan></text>`
    : `<rect x="184" y="324" width="352" height="352" rx="18" fill="#eef4ff"/>
       <path d="M330 470h60v60h-60zM252 374h88v88h-88zM380 374h88v88h-88zM252 584h88v88h-88z" fill="none" stroke="#1f63f2" stroke-width="15"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1120" viewBox="0 0 720 1120">
  <rect width="720" height="1120" fill="#f5f8ff"/>
  <rect x="24" y="24" width="672" height="1072" rx="42" fill="#ffffff" stroke="#1f63f2" stroke-width="3"/>
  <clipPath id="posterClip"><rect x="24" y="24" width="672" height="1072" rx="42"/></clipPath>
  <g clip-path="url(#posterClip)">
    <rect x="24" y="24" width="672" height="220" fill="#061340"/>
    <circle cx="360" cy="42" r="170" fill="#0c2c87" opacity="0.36"/>
    <path d="M315 80l96-42-26 88-24-31-36 26 28-36z" fill="#2f76ff"/>
    <path d="M305 85l-44 13M314 103l-32 10M326 118l-25 7" fill="none" stroke="#8fb5ff" stroke-width="7" stroke-linecap="round"/>
    <text x="360" y="148" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="900" fill="#ffffff">${escapeSvg(shopName)}</text>
    <text x="360" y="195" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#ffd21f">Scan. Upload. Pay. Print.</text>
    <path d="M24 221C204 268 516 268 696 221v66H24z" fill="#1f63f2"/>
    <path d="M24 238C204 284 516 284 696 238v72H24z" fill="#ffffff"/>
  </g>
  <rect x="136" y="292" width="448" height="448" rx="34" fill="#ffffff" stroke="#1f63f2" stroke-width="5"/>
  ${qrMarkup}
  <circle cx="154" cy="796" r="40" fill="#eaf2ff"/>
  <rect x="141" y="772" width="26" height="48" rx="6" fill="none" stroke="#1f63f2" stroke-width="5"/>
  <path d="M148 788h13M148 808h13M153 798h18" stroke="#1f63f2" stroke-width="4" stroke-linecap="round"/>
  <text x="206" y="807" font-family="Arial, sans-serif" font-size="29" font-weight="900" fill="#08164a">Scan to Upload Documents</text>
  <line x1="84" y1="842" x2="636" y2="842" stroke="#dfe7f4" stroke-width="2"/>
  <circle cx="154" cy="914" r="48" fill="#eaf2ff"/>
  <path d="M154 876l32 14v25c0 28-20 42-32 47-12-5-32-19-32-47v-25z" fill="#1f63f2"/>
  <rect x="142" y="909" width="24" height="22" rx="4" fill="#ffffff"/>
  <path d="M147 909v-9a7 7 0 0114 0v9" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
  <text x="214" y="900" font-family="Arial, sans-serif" font-size="27" font-weight="900" fill="#16a34a">100% Secure Document Upload</text>
  <text x="214" y="936" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#08164a">Encrypted, private, and automatically</text>
  <text x="214" y="964" font-family="Arial, sans-serif" font-size="21" font-weight="700" fill="#08164a">deleted after printing.</text>
  <rect x="24" y="1018" width="672" height="78" rx="34" fill="#0b6cff"/>
  <rect x="24" y="1064" width="672" height="32" fill="#0b6cff"/>
  <text x="304" y="1066" text-anchor="end" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#ffffff">Powered by</text>
  <text x="324" y="1068" font-family="Arial, sans-serif" font-size="36" font-weight="900" fill="#ffffff">Repeti<tspan fill="#9fc2ff">Go</tspan></text>
</svg>`;
}

function escapeSvg(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
