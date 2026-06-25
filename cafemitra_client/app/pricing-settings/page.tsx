"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calculator,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  LayoutGrid,
  MessageCircle,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ProfileTopbar } from "@/app/profile/ProfileTopbar";
import { fetchPricingServices, savePricingService, type PriceItem, type PricingService } from "@/lib/pricing";

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

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
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
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings", active: true },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const paymentModes = ["No Payment", "Online Payment", "Cash Counter", "Both"];

export default function PricingSettingsPage() {
  const [services, setServices] = useState<PricingService[]>([]);
  const [activeKey, setActiveKey] = useState("auto_document_print");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState("");

  useEffect(() => {
    fetchPricingServices()
      .then((items) => {
        setServices(items);
        setActiveKey(items[0]?.serviceKey || "auto_document_print");
      })
      .catch(() => setError("Could not load pricing settings."));
  }, []);

  const activeService = useMemo(() => services.find((service) => service.serviceKey === activeKey), [activeKey, services]);

  function updatePaymentMode(serviceKey: string, value: string) {
    setServices((current) =>
      current.map((service) =>
        service.serviceKey === serviceKey
          ? {
              ...service,
              settings: {
                ...service.settings,
                paymentMode: value,
              },
            }
          : service,
      ),
    );
  }

  function addPriceItem(serviceKey: string) {
    setServices((current) =>
      current.map((service) => {
        if (service.serviceKey !== serviceKey) return service;
        const items = getPriceItems(service);
        const nextIndex = items.length + 1;
        return {
          ...service,
          settings: {
            ...service.settings,
            priceItems: [...items, { id: `${Date.now()}-${nextIndex}`, label: `Charge ${nextIndex}`, rate: 0 }],
          },
        };
      }),
    );
  }

  function updatePriceItem(serviceKey: string, itemId: string, field: keyof PriceItem, value: string) {
    setServices((current) =>
      current.map((service) => {
        if (service.serviceKey !== serviceKey) return service;
        return {
          ...service,
          settings: {
            ...service.settings,
            priceItems: getPriceItems(service).map((item) =>
              item.id === itemId ? { ...item, [field]: field === "rate" ? Number(value || 0) : value } : item,
            ),
          },
        };
      }),
    );
  }

  function removePriceItem(serviceKey: string, itemId: string) {
    setServices((current) =>
      current.map((service) => {
        if (service.serviceKey !== serviceKey) return service;
        const remaining = getPriceItems(service).filter((item) => item.id !== itemId);
        return {
          ...service,
          settings: {
            ...service.settings,
            priceItems: remaining.length ? remaining : getPriceItems(service),
          },
        };
      }),
    );
  }

  async function saveService(service: PricingService) {
    setMessage("");
    setError("");
    setSavingKey(service.serviceKey);
    try {
      const saved = await savePricingService(service.serviceKey, service.settings);
      setServices((current) => current.map((item) => (item.serviceKey === saved.serviceKey ? saved : item)));
      setMessage(`${saved.serviceName} pricing saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save pricing.");
    } finally {
      setSavingKey("");
    }
  }

  function resetDefaults() {
    fetchPricingServices()
      .then((items) => {
        setServices(items);
        setMessage("Latest saved pricing loaded.");
        setError("");
      })
      .catch(() => setError("Could not reload pricing settings."));
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
        <ProfileTopbar />

        <div className="dashboard pricing-settings-dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Pricing & Settings</h1>
              <p>Har tool ke customer charges yahan manage karo. Same pricing respective service pages me bhi use hogi.</p>
            </div>
            <span className="status-pill">Central Pricing Active</span>
          </div>

          {message ? <div className="profile-alert success">{message}</div> : null}
          {error ? <div className="profile-alert error">{error}</div> : null}

          <section className="pricing-settings-layout">
            <aside className="panel pricing-service-list">
              <div className="panel-title-row compact">
                <h2>Tools</h2>
                <Calculator size={18} />
              </div>
              <div className="pricing-service-buttons">
                {services.map((service) => (
                  <button
                    className={activeKey === service.serviceKey ? "active" : ""}
                    type="button"
                    key={service.serviceKey}
                    onClick={() => setActiveKey(service.serviceKey)}
                  >
                    {service.serviceKey === "auto_document_print" ? <Printer size={18} /> : <Image size={18} />}
                    <span>
                      <strong>{service.serviceName}</strong>
                      <small>{getServiceSummary(service)}</small>
                    </span>
                    <CheckCircle2 size={17} />
                  </button>
                ))}
              </div>
            </aside>

            <section className="panel pricing-editor-panel">
              {activeService ? (
                <>
                  <div className="panel-title-row">
                    <div>
                      <span className="setup-badge">Service Pricing</span>
                      <h2>{activeService.serviceName}</h2>
                    </div>
                    <Link className="mini-link" href={activeService.serviceKey === "auto_document_print" ? "/auto-print" : "#"}>
                      Open Tool
                    </Link>
                  </div>

                  <div className="service-pricing-form single">
                    <label className="auto-field">
                      <span>Payment Mode</span>
                      <select value={String(activeService.settings.paymentMode || "Online Payment")} onChange={(event) => updatePaymentMode(activeService.serviceKey, event.target.value)}>
                        {paymentModes.map((mode) => (
                          <option value={mode} key={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <section className="price-items-panel" aria-label="Flexible price items">
                    <div className="panel-title-row compact">
                      <div>
                        <h2>Price Items</h2>
                        <p>Jis kaam ke liye payment lena hai, uska naam aur price set karo.</p>
                      </div>
                      <button className="icon-action-btn" type="button" onClick={() => addPriceItem(activeService.serviceKey)} aria-label="Add price item">
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="price-item-list">
                      {getPriceItems(activeService).map((item) => (
                        <div className="price-item-row" key={item.id}>
                          <label className="auto-field">
                            <span>Charge For</span>
                            <input value={item.label} onChange={(event) => updatePriceItem(activeService.serviceKey, item.id, "label", event.target.value)} />
                          </label>
                          <label className="auto-field">
                            <span>Price</span>
                            <input min="0" type="number" value={item.rate} onChange={(event) => updatePriceItem(activeService.serviceKey, item.id, "rate", event.target.value)} />
                          </label>
                          <button className="icon-action-btn danger" type="button" onClick={() => removePriceItem(activeService.serviceKey, item.id)} aria-label="Remove price item">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="pricing-preview-strip">
                    <strong>Customer Preview</strong>
                    <span>{getServiceSummary(activeService)}</span>
                  </div>

                  <div className="profile-actions">
                    <button className="btn" type="button" onClick={resetDefaults}>
                      <RefreshCw size={16} /> Reload
                    </button>
                    <button className="btn btn-primary" type="button" onClick={() => saveService(activeService)} disabled={savingKey === activeService.serviceKey}>
                      <Save size={16} /> {savingKey === activeService.serviceKey ? "Saving..." : "Save Pricing"}
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}

function getPriceItems(service: PricingService) {
  return Array.isArray(service.settings.priceItems) ? service.settings.priceItems : [];
}

function getServiceSummary(service: PricingService) {
  const items = getPriceItems(service);
  return items.length ? items.map((item) => `${item.label} Rs. ${item.rate}`).join(" | ") : "No pricing items";
}
