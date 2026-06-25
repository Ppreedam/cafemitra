"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
  MonitorDown,
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
import { clearSession } from "@/lib/api";
import { fetchPricingServices, savePricingService, type PriceItem } from "@/lib/pricing";

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
  key: "agent" | "verify" | "printer" | "pricing" | "qr" | "test" | "live";
  title: string;
  helper: string;
  icon: LucideIcon;
};

type AgentHealth = {
  app?: string;
  status?: "running" | "stopped";
  account?: string;
  printer?: string;
  mockMode?: boolean;
  printers?: string[];
  apiBaseUrl?: string;
  lastCheckAt?: string;
  lastJob?: string;
  lastJobCount?: number;
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
  { key: "agent", title: "Install Agent", helper: "Download EXE and install on shop PC", icon: MonitorDown },
  { key: "verify", title: "Verify Agent", helper: "Check local agent connection", icon: ShieldCheck },
  { key: "printer", title: "Select Printer", helper: "Choose default PrintPilot printer", icon: Printer },
  { key: "pricing", title: "Pricing", helper: "Set BW, color, and minimum order", icon: Wallet },
  { key: "qr", title: "QR Setup", helper: "Generate PrintPilot customer QR", icon: QrCode },
  { key: "test", title: "Test Print", helper: "Send a demo page to printer", icon: Play },
  { key: "live", title: "Go Live", helper: "Enable PrintPilot orders", icon: CheckCircle2 },
];

const fallbackPrinters = ["Microsoft Print to PDF", "Fax"];

const queue = [
  { file: "Aadhaar.pdf", pages: 3, amount: "Rs. 6", status: "Printed", tone: "#16b978" },
  { file: "Admit-card.pdf", pages: 2, amount: "Rs. 4", status: "Printing", tone: "#1688f5" },
  { file: "PAN-form.pdf", pages: 5, amount: "Rs. 10", status: "Pending", tone: "#ff7b1a" },
  { file: "Passport-photo.pdf", pages: 1, amount: "Rs. 10", status: "Failed", tone: "#e9546a" },
];

const paymentModes = ["No Payment", "Online Payment", "Cash Counter", "Both"];

export default function AutoPrintPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [agentInstalled, setAgentInstalled] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [agentMessage, setAgentMessage] = useState("Click Retry to check the local PrintPilot Agent.");
  const [isVerifyingAgent, setIsVerifyingAgent] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState<string[]>(fallbackPrinters);
  const [selectedPrinter, setSelectedPrinter] = useState(fallbackPrinters[0]);
  const [printerMessage, setPrinterMessage] = useState("");
  const [printerError, setPrinterError] = useState("");
  const [isSavingPrinter, setIsSavingPrinter] = useState(false);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([
    { id: "black_white", label: "Black & White", rate: 2 },
    { id: "color", label: "Color", rate: 10 },
  ]);
  const [paymentMode, setPaymentMode] = useState("Online Payment");
  const [pricingMessage, setPricingMessage] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const [shopCode, setShopCode] = useState("CM0000");
  const [shopName, setShopName] = useState("CafeMitra Shop");
  const [qrUrl, setQrUrl] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "printing" | "success">("idle");
  const [autoPrintLive, setAutoPrintLive] = useState(false);

  const completedCount = useMemo(() => {
    return [
      agentInstalled,
      agentConnected,
      Boolean(selectedPrinter),
      priceItems.length > 0,
      qrReady,
      testStatus === "success",
      autoPrintLive,
    ].filter(Boolean).length;
  }, [agentConnected, agentInstalled, autoPrintLive, priceItems.length, qrReady, selectedPrinter, testStatus]);

  const progress = `${(completedCount / setupSteps.length) * 100}%`;
  const currentStep = setupSteps[activeStep];
  const CurrentStepIcon = currentStep.icon;
  const samplePrice = Number(priceItems[0]?.rate || 0) * 5;

  useEffect(() => {
    const storedUser = readJson<{ id?: string }>("cafemitra_user");
    const storedShop = readJson<{ shopName?: string }>("cafemitra_shop");
    const code = `CM${String(storedUser.id || "0").padStart(4, "0")}`;
    const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_APP_URL || window.location.origin;
    setShopCode(code);
    setShopName(storedShop.shopName || "CafeMitra Shop");
    setQrUrl(`${publicBaseUrl}/s/${code}`);

    fetchPricingServices()
      .then((services) => {
        const autoPrint = services.find((service) => service.serviceKey === "auto_document_print");
        if (!autoPrint) return;
        setPriceItems(Array.isArray(autoPrint.settings.priceItems) ? autoPrint.settings.priceItems : priceItems);
        setPaymentMode(String(autoPrint.settings.paymentMode ?? "Online Payment"));
      })
      .catch(() => undefined);

    verifyAgent({ silent: true });
  }, []);

  async function verifyAgent(options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setIsVerifyingAgent(true);
      setAgentMessage("Checking local PrintPilot Agent...");
    }

    try {
      const health = await fetchAgentHealth();
      const connected = health.status === "running";
      setAgentInstalled(true);
      setAgentConnected(connected);
      setAgentHealth(health);

      const scannedPrinters = Array.isArray(health.printers) && health.printers.length ? health.printers : fallbackPrinters;
      setAvailablePrinters(scannedPrinters);

      if (health.printer && scannedPrinters.includes(health.printer)) {
        setSelectedPrinter(health.printer);
      } else if (!scannedPrinters.includes(selectedPrinter)) {
        setSelectedPrinter(scannedPrinters[0] || "");
      }

      setAgentMessage(
        connected
          ? `Connected${health.account ? ` as ${health.account}` : ""}${health.printer ? ` on ${health.printer}` : ""}${health.mockMode ? " in mock test mode" : ""}.`
          : "Agent found, but it is stopped. Click Start Agent in the desktop app.",
      );
    } catch {
      setAgentInstalled(false);
      setAgentConnected(false);
      setAgentHealth(null);
      setAgentMessage("Agent not found. Open CafeMitra PrintPilot Agent, login, then click Start Agent.");
    } finally {
      setIsVerifyingAgent(false);
    }
  }

  function runTestPrint() {
    setTestStatus("printing");
    window.setTimeout(() => setTestStatus("success"), 800);
  }

  async function savePrinter() {
    setPrinterMessage("");
    setPrinterError("");
    setIsSavingPrinter(true);
    try {
      const result = await saveAgentPrinter(selectedPrinter);
      const scannedPrinters = Array.isArray(result.printers) && result.printers.length ? result.printers : availablePrinters;
      setAvailablePrinters(scannedPrinters);
      setSelectedPrinter(result.printer || selectedPrinter);
      setPrinterMessage(`Printer saved: ${result.printer || selectedPrinter}${result.mockMode ? " (Mock Test Mode)" : ""}`);
      await verifyAgent({ silent: true });
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
      });
      setPricingMessage("PrintPilot pricing saved.");
    } catch (error) {
      setPricingError(error instanceof Error ? error.message : "Could not save pricing.");
    } finally {
      setIsSavingPricing(false);
    }
  }

  function addPriceItem() {
    const nextIndex = priceItems.length + 1;
    setPriceItems((current) => [...current, { id: `${Date.now()}-${nextIndex}`, label: `Charge ${nextIndex}`, rate: 0 }]);
  }

  function updatePriceItem(itemId: string, field: keyof PriceItem, value: string) {
    setPriceItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: field === "rate" ? Number(value || 0) : value } : item)),
    );
  }

  function removePriceItem(itemId: string) {
    setPriceItems((current) => (current.length > 1 ? current.filter((item) => item.id !== itemId) : current));
  }

  async function generateQr() {
    const image = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#111a44", light: "#ffffff" },
    });
    setQrImage(image);
    setQrReady(true);
    if (qrUrl) navigator.clipboard?.writeText(qrUrl).catch(() => undefined);
  }

  function downloadQr() {
    const svg = buildQrPosterSvg(shopName, shopCode, qrUrl, qrImage);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${shopCode}-qr-poster.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function printPoster() {
    const popup = window.open("", "_blank", "width=720,height=900");
    if (!popup) return;
    popup.document.write(`<html><head><title>${shopCode} QR Poster</title></head><body style="margin:0">${buildQrPosterSvg(shopName, shopCode, qrUrl, qrImage)}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  }

  function shareQr() {
    if (navigator.share) {
      navigator.share({ title: `${shopName} PrintPilot QR`, text: "Upload. Pay. Print.", url: qrUrl }).catch(() => undefined);
      return;
    }
    navigator.clipboard?.writeText(qrUrl).catch(() => undefined);
  }

  return (
    <main className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-main">
            Cafe<span className="brand-accent">Mitra</span>
          </span>
          <span className="brand-dot">.online</span>
        </Link>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, index) => (
            <div key={`${group.label}-${index}`}>
              {group.label ? <div className="nav-label">{group.label}</div> : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={`side-link ${item.active ? "active" : ""}`} href={item.href ?? "#"} key={item.name}>
                    <Icon size={17} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="help-box">
          <div className="help-avatar">
            <UserRound size={21} />
          </div>
          <strong>Need Help?</strong>
          <p>We are here to assist you.</p>
          <Link className="btn" href="#">
            <CircleHelp size={15} /> Contact Support
          </Link>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <Link href="/" aria-label="Open menu">
              <Menu size={22} />
            </Link>
          </div>
          <div className="topbar-right">
            <div className="business-switcher">
              <Building2 size={17} />
              Cyber Cafe Shankar
              <ChevronDown size={15} />
            </div>
            <details className="printer-menu">
              <summary>
                <Printer size={17} />
                <span className={`printer-dot ${agentConnected ? "online" : "offline"}`} />
                <span>{selectedPrinter}</span>
                <small>{agentConnected ? "Connected" : "Offline"}</small>
                <ChevronDown size={14} />
              </summary>
              <div className="printer-dropdown">
                {availablePrinters.map((printer, index) => (
                  <button className="printer-option printer-option-button" key={printer} type="button" onClick={() => setSelectedPrinter(printer)}>
                    <span className={`printer-dot ${index === 1 ? "offline" : "online"}`} />
                    <div>
                      <strong>{printer}</strong>
                      <small>{index === 1 ? "Disconnected" : "Connected"}</small>
                    </div>
                  </button>
                ))}
              </div>
            </details>
            <div className="notification-dot">
              <Bell size={23} />
            </div>
            <details className="profile-menu">
              <summary className="user-menu">
                <span className="avatar">S</span>
                <span>
                  <strong>Shankar Kumar</strong>
                  <small style={{ display: "block", color: "#697397" }}>Owner</small>
                </span>
                <ChevronDown size={15} />
              </summary>
              <div className="profile-dropdown">
                <div className="profile-head">
                  <span className="profile-photo">S</span>
                  <div>
                    <strong>Shankar Kumar</strong>
                    <span>sk6201184579@gmail.com</span>
                    <span>Balance: 0</span>
                    <span>User ID: 204927</span>
                  </div>
                </div>
                <div className="profile-list">
                  <Link href="/dashboard">
                    <Bookmark size={18} /> Dashboard
                  </Link>
                  <Link href="/profile">
                    <UserRound size={18} /> My Profile
                  </Link>
                  <Link href="/auto-print">
                    <Printer size={18} /> PrintPilot Setup
                  </Link>
                  <Link href="/pricing-settings">
                    <Settings size={18} /> Pricing & Settings
                  </Link>
                  <Link href="#">
                    <Landmark size={18} /> Withdraw
                  </Link>
                  <Link href="/login" onClick={clearSession}>
                    <LogOut size={18} /> Sign Out
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </header>

        <div className="dashboard auto-print-dashboard">
          <div className="dashboard-hero auto-print-hero">
            <div>
              <span className="auto-print-kicker">CafeMitra PrintPilot</span>
              <h1>PrintPilot Setup</h1>
              <p>Upload. Pay. Print. Customer QR scan karega, document upload karega, payment karega, aur PrintPilot printer par job bhej dega.</p>
            </div>
            <span className={`status-pill ${autoPrintLive ? "" : "warning"}`}>{autoPrintLive ? "PrintPilot Active" : "Setup in Progress"}</span>
          </div>

          <section className="auto-print-layout" aria-label="PrintPilot setup wizard">
            <aside className="panel setup-wizard-panel">
              <div className="setup-progress-header">
                <div>
                  <strong>{completedCount}/7 ready</strong>
                  <span>MVP setup progress</span>
                </div>
                <span>{Math.round((completedCount / setupSteps.length) * 100)}%</span>
              </div>
              <div className="setup-progress">
                <span style={{ width: progress }} />
              </div>
              <div className="wizard-step-list">
                {setupSteps.map((step, index) => {
                  const Icon = step.icon;
                  const complete =
                    (step.key === "agent" && agentInstalled) ||
                    (step.key === "verify" && agentConnected) ||
                    (step.key === "printer" && Boolean(selectedPrinter)) ||
                    (step.key === "pricing" && priceItems.length > 0) ||
                    (step.key === "qr" && qrReady) ||
                    (step.key === "test" && testStatus === "success") ||
                    (step.key === "live" && autoPrintLive);

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
              <div className="panel-title-row">
                <div>
                  <span className="setup-badge">Step {activeStep + 1}</span>
                  <h2>{currentStep.title}</h2>
                </div>
                <span className="icon-tile" style={{ "--tile-color": "#1688f5" } as React.CSSProperties}>
                  <CurrentStepIcon size={23} />
                </span>
              </div>

              {currentStep.key === "agent" ? (
                <div className="wizard-action-content">
                  <div className="agent-card">
                    <MonitorDown size={34} />
                    <div>
                      <strong>CafeMitra PrintPilot Agent</strong>
                      <span className={`agent-status ${agentInstalled ? "success" : "danger"}`}>
                        {agentInstalled ? "Installed" : "Not Installed"}
                      </span>
                    </div>
                  </div>
                  <ol className="compact-steps">
                    <li>Download EXE</li>
                    <li>Run as Administrator</li>
                    <li>Install and keep it running</li>
                  </ol>
                  <button className="btn btn-primary" type="button" onClick={() => setAgentInstalled(true)}>
                    <Download size={16} /> Download Agent
                  </button>
                </div>
              ) : null}

              {currentStep.key === "verify" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${agentConnected ? "success" : "danger"}`}>
                    <span />
                    <strong>{agentConnected ? "Agent Connected" : agentHealth ? "Agent Stopped" : "Agent Not Found"}</strong>
                    <p>{agentMessage}</p>
                    {agentHealth ? (
                      <p>
                        {agentHealth.apiBaseUrl ? `API: ${agentHealth.apiBaseUrl}` : ""}
                        {agentHealth.lastCheckAt ? ` | Last check: ${agentHealth.lastCheckAt}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <button className="btn btn-primary" type="button" onClick={() => verifyAgent()} disabled={isVerifyingAgent}>
                    <RefreshCw size={16} /> {isVerifyingAgent ? "Checking..." : "Retry"}
                  </button>
                </div>
              ) : null}

              {currentStep.key === "printer" ? (
                <div className="wizard-action-content">
                  <div className="printer-radio-list">
                    {availablePrinters.map((printer) => (
                      <label className="printer-radio" key={printer}>
                        <input checked={selectedPrinter === printer} name="printer" type="radio" onChange={() => setSelectedPrinter(printer)} />
                        <span>{printer}</span>
                      </label>
                    ))}
                    {!availablePrinters.length ? (
                      <div className="profile-alert error">No printer found. Install or connect a Windows printer, then verify the agent again.</div>
                    ) : null}
                  </div>
                  {printerMessage ? <div className="profile-alert success">{printerMessage}</div> : null}
                  {printerError ? <div className="profile-alert error">{printerError}</div> : null}
                  <button className="btn btn-primary" type="button" onClick={savePrinter} disabled={!selectedPrinter || isSavingPrinter}>
                    <Printer size={16} /> {isSavingPrinter ? "Saving..." : "Save Printer"}
                  </button>
                </div>
              ) : null}

              {currentStep.key === "pricing" ? (
                <div className="wizard-action-content">
                  <div className="panel-title-row compact">
                    <h2>Price Items</h2>
                    <button className="icon-action-btn" type="button" onClick={addPriceItem} aria-label="Add price item">
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="price-item-list">
                    {priceItems.map((item) => (
                      <div className="price-item-row" key={item.id}>
                        <label className="auto-field">
                          <span>Charge For</span>
                          <input value={item.label} onChange={(event) => updatePriceItem(item.id, "label", event.target.value)} />
                        </label>
                        <label className="auto-field">
                          <span>Price</span>
                          <input min="0" type="number" value={item.rate} onChange={(event) => updatePriceItem(item.id, "rate", event.target.value)} />
                        </label>
                        <button className="icon-action-btn danger" type="button" onClick={() => removePriceItem(item.id)} aria-label="Remove price item">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="payment-mode-list">
                    {paymentModes.map((mode) => (
                      <button className={paymentMode === mode ? "active" : ""} key={mode} type="button" onClick={() => setPaymentMode(mode)}>
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
                  <div className="qr-preview real-qr-preview" aria-label="Generated shop QR preview">
                    {qrImage ? (
                      <>
                        <img src={qrImage} alt="Shop QR code" />
                        <span className="qr-brand-badge">
                          Cafe<span>Mitra</span>
                        </span>
                      </>
                    ) : (
                      <QrCode size={96} />
                    )}
                  </div>
                  <div>
                    <strong>Generate PrintPilot QR</strong>
                    {/* <p>Customer is QR se upload, price, payment aur order status flow open karega.</p> */}
                    {qrUrl.includes("localhost") || qrUrl.includes("127.0.0.1") ? (
                      <div className="profile-alert error">
                        Phone se scan karne ke liye localhost ki jagah deployed URL ya same Wi-Fi LAN IP use karo.
                      </div>
                    ) : null}
                    <div className="qr-url-box">
                      <span>{shopCode}</span>
                      <input value={qrUrl} onChange={(event) => {
                        setQrUrl(event.target.value);
                        setQrReady(false);
                        setQrImage("");
                      }} />
                    </div>
                    <div className="qr-buttons">
                      <button className="btn btn-primary" type="button" onClick={generateQr}>
                        <QrCode size={16} /> Generate QR
                      </button>
                      <button className="btn" disabled={!qrReady} type="button" onClick={downloadQr}>
                        <Download size={16} /> Download
                      </button>
                      <button className="btn" disabled={!qrReady} type="button" onClick={printPoster}>
                        <Printer size={16} /> Print Poster
                      </button>
                      <button className="btn" disabled={!qrReady} type="button" onClick={shareQr}>
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                    <div className="qr-analytics-grid">
                      <div><small>Total Scans</small><strong>{qrReady ? 42 : 0}</strong></div>
                      <div><small>Orders Created</small><strong>{qrReady ? 12 : 0}</strong></div>
                      <div><small>Conversion Rate</small><strong>{qrReady ? "28%" : "0%"}</strong></div>
                    </div>
                  </div>
                </div>
              ) : null}

              {currentStep.key === "test" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${testStatus === "success" ? "success" : "info"}`}>
                    <span />
                    <strong>{testStatus === "printing" ? "Printing Demo Page..." : testStatus === "success" ? "Test Print Successful" : "Ready for test print"}</strong>
                    <p>Demo page selected printer par bheji jayegi: {selectedPrinter}.</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={runTestPrint}>
                    <Play size={16} /> Run Test Print
                  </button>
                </div>
              ) : null}

              {currentStep.key === "live" ? (
                <div className="wizard-action-content">
                  <div className={`connection-result ${autoPrintLive ? "success" : "info"}`}>
                    <span />
                    <strong>{autoPrintLive ? "PrintPilot Active" : "Shop Ready"}</strong>
                    <p>Go Live ke baad paid customer orders PrintPilot queue me aana shuru honge.</p>
                  </div>
                  <button className="btn btn-primary" type="button" onClick={() => setAutoPrintLive(true)}>
                    <CheckCircle2 size={16} /> Go Live
                  </button>
                </div>
              ) : null}
            </section>

            <aside className="dashboard-stack">
              <article className="panel auto-status-panel">
                <div className="panel-title-row compact">
                  <h2>PrintPilot Console</h2>
                  <span className={`agent-status ${agentConnected ? "success" : "danger"}`}>{agentConnected ? "Running" : "Offline"}</span>
                </div>
                <div className="status-stat-grid">
                  <div>
                    <small>Printer</small>
                    <strong>{selectedPrinter}</strong>
                  </div>
                  <div>
                    <small>Today's Orders</small>
                    <strong>18</strong>
                  </div>
                  <div>
                    <small>Revenue</small>
                    <strong>Rs. 420</strong>
                  </div>
                  <div>
                    <small>Health</small>
                    <strong>{agentConnected ? "Online" : "Offline"}</strong>
                  </div>
                </div>
              </article>

              <article className="panel customer-flow-panel">
                <h2>Customer Scan Flow</h2>
                <div className="phone-flow">
                  <div className="phone-top">
                    <strong>Shankar Cyber Cafe</strong>
                    <span>Verified | Sitamarhi</span>
                  </div>
                  <button type="button">
                    <FileText size={15} /> Upload Document
                  </button>
                  <div className="phone-price">
                    <span>5 Pages</span>
                    <strong>Rs. {samplePrice}</strong>
                  </div>
                  <button type="button">Pay Now</button>
                  <small>Order #1245 | Paid</small>
                </div>
              </article>
            </aside>
          </section>

          <section className="panel print-queue-panel" aria-label="Auto print queue">
            <div className="panel-title-row compact">
              <div>
                <h2>PrintPilot Queue</h2>
                <p>Pending, printing, completed aur failed jobs ka live view.</p>
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
          </section>
        </div>
      </section>
    </main>
  );
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}

async function fetchAgentHealth() {
  const endpoints = ["http://127.0.0.1:8765/status", "http://localhost:8765/status"];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(endpoint, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error("Agent health check failed.");
      }
      return (await response.json()) as AgentHealth;
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Agent health check failed.");
}

async function saveAgentPrinter(printerName: string) {
  const endpoints = ["http://127.0.0.1:8765/settings", "http://localhost:8765/settings"];
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printerName }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Could not save printer.");
      }
      return result as { message?: string; printer?: string; mockMode?: boolean; printers?: string[] };
    } catch (error) {
      lastError = error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not save printer.");
}

function buildQrPosterSvg(shopName: string, shopCode: string, qrUrl: string, qrImage: string) {
  const qrMarkup = qrImage
    ? `<image href="${qrImage}" x="190" y="190" width="340" height="340"/>
       <rect x="286" y="342" width="148" height="40" rx="12" fill="#ffffff" stroke="#e6e9f6"/>
       <text x="360" y="368" text-anchor="middle" font-family="Arial" font-size="20" font-weight="900" fill="#0d1748">Cafe<tspan fill="#ff7b1a">Mitra</tspan></text>`
    : `<rect x="190" y="190" width="340" height="340" rx="18" fill="#111a44"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="900" viewBox="0 0 720 900">
  <rect width="720" height="900" fill="#ffffff"/>
  <text x="360" y="92" text-anchor="middle" font-family="Arial" font-size="42" font-weight="800" fill="#0d1748">${escapeSvg(shopName)}</text>
  <text x="360" y="132" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#59658c">Scan to upload print documents</text>
  ${qrMarkup}
  <text x="360" y="590" text-anchor="middle" font-family="Arial" font-size="28" font-weight="800" fill="#5740ed">${shopCode}</text>
  <text x="360" y="630" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#59658c">${escapeSvg(qrUrl)}</text>
  <rect x="150" y="690" width="420" height="72" rx="10" fill="#5740ed"/>
  <text x="360" y="736" text-anchor="middle" font-family="Arial" font-size="24" font-weight="800" fill="#fff">Upload. Pay. Print.</text>
</svg>`;
}

function escapeSvg(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
