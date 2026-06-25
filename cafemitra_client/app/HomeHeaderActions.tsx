"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, ChevronDown, Landmark, LogOut, Printer, Settings, UserRound } from "lucide-react";
import { clearSession, hasStoredSession } from "@/lib/api";

type HeaderUser = {
  id?: string;
  email?: string;
  fullName?: string;
  balance?: number;
  profilePhoto?: string;
};

const fallbackUser: HeaderUser = {
  fullName: "Owner",
  email: "",
  id: "",
  balance: 0,
  profilePhoto: "",
};

export function HomeHeaderActions() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<HeaderUser>(fallbackUser);

  useEffect(() => {
    const storedUser = readJson<HeaderUser>("cafemitra_user");

    setIsLoggedIn(hasStoredSession());
    setUser({ ...fallbackUser, ...storedUser });
    setIsReady(true);
  }, []);

  if (!isReady || !isLoggedIn) {
    return (
      <div className="header-actions">
        <Link className="btn" href="/login">
          Login
        </Link>
        <Link className="btn btn-primary" href="/register">
          Sign Up
        </Link>
      </div>
    );
  }

  const ownerName = user.fullName || "Owner";
  const initial = ownerName.charAt(0).toUpperCase() || "O";
  const balance = Number(user.balance || 0);

  return (
    <div className="header-actions">
      <details className="profile-menu home-profile-menu">
        <summary className="user-menu">
          <ProfileAvatar initial={initial} photo={user.profilePhoto} className="avatar" />
          <span>
            <strong>{ownerName}</strong>
            <small style={{ display: "block", color: "#697397" }}>Owner</small>
          </span>
          <ChevronDown size={15} />
        </summary>
        <div className="profile-dropdown">
          <div className="profile-head">
            <ProfileAvatar initial={initial} photo={user.profilePhoto} className="profile-photo" />
            <div>
              <strong>{ownerName}</strong>
              <span>{user.email || "No email added"}</span>
              <span>Balance: {balance}</span>
              <span>User ID: {user.id || "Not assigned"}</span>
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
