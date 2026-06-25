"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  Landmark,
  LogOut,
  Menu,
  Printer,
  Settings,
  UserRound,
} from "lucide-react";
import { apiFetch, clearSession, hasStoredSession, storeSession } from "@/lib/api";

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

export function ProfileTopbar() {
  const [profile, setProfile] = useState<ProfileSummary>(fallbackProfile);

  useEffect(() => {
    hydrateFromStorage();
    fetchProfile();

    window.addEventListener("cafemitra:profile-updated", hydrateFromStorage);
    return () => window.removeEventListener("cafemitra:profile-updated", hydrateFromStorage);
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

  const ownerName = profile.user.fullName || "Owner";
  const initial = ownerName.charAt(0).toUpperCase() || "O";
  const balance = Number(profile.user.balance || 0);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" aria-label="Open menu">
          <Menu size={22} />
        </Link>
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
            <span className="printer-dot online" />
            <span>Epson L805</span>
            <small>Connected</small>
            <ChevronDown size={14} />
          </summary>
          <div className="printer-dropdown">
            <div className="printer-option">
              <span className="printer-dot online" />
              <div>
                <strong>Epson L805</strong>
                <small>Connected</small>
              </div>
            </div>
            <div className="printer-option">
              <span className="printer-dot offline" />
              <div>
                <strong>Canon G3010</strong>
                <small>Disconnected</small>
              </div>
            </div>
          </div>
        </details>
        <div className="notification-dot">
          <Bell size={23} />
        </div>
        <details className="profile-menu">
          <summary className="user-menu">
            <ProfileAvatar initial={initial} photo={profile.user.profilePhoto} className="avatar" />
            <span>
              <strong>{ownerName}</strong>
              <small style={{ display: "block", color: "#697397" }}>Owner</small>
            </span>
            <ChevronDown size={15} />
          </summary>
          <div className="profile-dropdown">
            <div className="profile-head">
              <ProfileAvatar initial={initial} photo={profile.user.profilePhoto} className="profile-photo" />
              <div>
                <strong>{ownerName}</strong>
                <span>{profile.user.email || "No email added"}</span>
                <span>Balance: {balance}</span>
                <span>User ID: {profile.user.id || "Not assigned"}</span>
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
  );
}

function ProfileAvatar({ initial, photo, className }: { initial: string; photo?: string; className: string }) {
  if (photo) {
    return <img className={className} src={photo} alt="" />;
  }

  return <span className={className}>{initial}</span>;
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}
