"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Building2,
  ChevronDown,
  Menu,
  Printer,
  Wallet,
} from "lucide-react";
import { apiFetch, hasStoredSession, storeSession } from "@/lib/api";
import { fallbackPrinters, fetchAgentHealth, saveAgentPrinter, type AgentHealth } from "@/lib/printpilot-agent";
import { ProfileMenu } from "./ProfileMenu";

type ProfileSummary = {
  user: {
    id: string;
    email: string;
    fullName: string;
    balance: number;
    profilePhoto?: string;
  };
  shop: {
    shopName: string;
  };
};

type WalletSummary = {
  balance: number;
  summary?: {
    netWithdrawable?: number;
  };
};

const fallbackProfile: ProfileSummary = {
  user: {
    id: "",
    email: "",
    fullName: "Owner",
    balance: 0,
    profilePhoto: "",
  },
  shop: {
    shopName: "CafeMitra Shop",
  },
};

type ProfileTopbarProps = {
  isSidebarCollapsed?: boolean;
  onMenuClick?: () => void;
};

export function ProfileTopbar({ isSidebarCollapsed = false, onMenuClick }: ProfileTopbarProps) {
  const [profile, setProfile] = useState<ProfileSummary>(fallbackProfile);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [topbarPrinters, setTopbarPrinters] = useState<string[]>(fallbackPrinters);
  const [selectedPrinter, setSelectedPrinter] = useState(fallbackPrinters[0]);

  useEffect(() => {
    hydrateFromStorage();
    fetchProfile();
    fetchWallet();
    refreshPrinters();

    window.addEventListener("cafemitra:profile-updated", hydrateFromStorage);
    window.addEventListener("cafemitra:wallet-updated", fetchWallet);
    window.addEventListener("cafemitra:printers-updated", refreshPrinters);
    window.addEventListener("cafemitra:session-cleared", resetProfile);
    return () => {
      window.removeEventListener("cafemitra:profile-updated", hydrateFromStorage);
      window.removeEventListener("cafemitra:wallet-updated", fetchWallet);
      window.removeEventListener("cafemitra:printers-updated", refreshPrinters);
      window.removeEventListener("cafemitra:session-cleared", resetProfile);
    };
  }, []);

  function hydrateFromStorage() {
    const storedUser = readJson<ProfileSummary["user"]>("cafemitra_user");
    const storedShop = readJson<ProfileSummary["shop"]>("cafemitra_shop");

    setProfile((current) => ({
      user: { ...current.user, ...storedUser },
      shop: { ...current.shop, ...storedShop },
    }));
  }

  async function fetchProfile() {
    if (!hasStoredSession()) return;

    try {
      const response = await apiFetch("/api/profile/");
      if (!response.ok) return;
      const result = (await response.json()) as ProfileSummary;
      storeSession(result);
      setProfile(result);
    } catch {
      undefined;
    }
  }

  async function fetchWallet() {
    if (!hasStoredSession()) return;

    try {
      const response = await apiFetch("/api/wallet/");
      if (!response.ok) return;
      setWallet((await response.json()) as WalletSummary);
    } catch {
      undefined;
    }
  }

  function resetProfile() {
    setProfile(fallbackProfile);
    setWallet(null);
  }

  async function refreshPrinters() {
    try {
      const health = await fetchAgentHealth();
      const printers = Array.isArray(health.printers) && health.printers.length ? health.printers : fallbackPrinters;
      setAgentHealth(health);
      setTopbarPrinters(printers);
      setSelectedPrinter(health.printer && printers.includes(health.printer) ? health.printer : printers[0] || "");
    } catch {
      setAgentHealth(null);
      setTopbarPrinters(fallbackPrinters);
      setSelectedPrinter((current) => (fallbackPrinters.includes(current) ? current : fallbackPrinters[0]));
    }
  }

  async function choosePrinter(printerName: string) {
    setSelectedPrinter(printerName);
    try {
      const result = await saveAgentPrinter(printerName);
      const printers = Array.isArray(result.printers) && result.printers.length ? result.printers : topbarPrinters;
      setTopbarPrinters(printers);
      setSelectedPrinter(result.printer || printerName);
      await refreshPrinters();
      window.dispatchEvent(new Event("cafemitra:printers-updated"));
    } catch {
      undefined;
    }
  }

  const balance = Number(wallet?.summary?.netWithdrawable ?? profile.user.balance ?? 0);
  const isAgentConnected = agentHealth?.status === "running";
  const activePrinter = selectedPrinter || topbarPrinters[0] || "No printer";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-button"
          type="button"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={isSidebarCollapsed}
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
      </div>
      <div className="topbar-right">
        <div className="business-switcher">
          <Building2 size={17} />
          {profile.shop.shopName}
          <ChevronDown size={15} />
        </div>
        <details className="printer-menu">
          <summary>
            <Printer size={17} />
            <span className={`printer-dot ${isAgentConnected ? "online" : "offline"}`} />
            <span>{activePrinter}</span>
            <small>{isAgentConnected ? "Connected" : "Disconnected"}</small>
            <ChevronDown size={14} />
          </summary>
          <div className="printer-dropdown">
            {topbarPrinters.map((printer) => {
              const isSelected = printer === activePrinter;
              return (
                <button className="printer-option" key={printer} type="button" onClick={() => choosePrinter(printer)}>
                  <span className={`printer-dot ${isAgentConnected && isSelected ? "online" : "offline"}`} />
                  <div>
                    <strong>{printer}</strong>
                    <small>{isAgentConnected && isSelected ? "Connected" : isSelected ? "Selected" : "Available"}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </details>
        <Link className="topbar-wallet-link" href="/wallet" aria-label={`Wallet balance ${formatWalletBalance(balance)}`}>
          <Wallet size={21} />
          <span>{formatWalletBalance(balance)}</span>
        </Link>
        <ProfileMenu user={profile.user} />
      </div>
    </header>
  );
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}

function formatWalletBalance(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}
