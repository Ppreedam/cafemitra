"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasStoredSession } from "@/lib/api";
import { ProfileMenu } from "./profile/ProfileMenu";

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

  return (
    <div className="header-actions">
      <ProfileMenu user={user} className="home-profile-menu" />
    </div>
  );
}

function readJson<T>(key: string): Partial<T> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}") as Partial<T>;
  } catch {
    return {};
  }
}
