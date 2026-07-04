"use client";

import Link from "next/link";
import { BarChart3, Bookmark, ChevronDown, LogOut, Printer, Settings, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { clearSession } from "@/lib/api";

export type ProfileMenuUser = {
  email?: string;
  fullName?: string;
  profilePhoto?: string;
};

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
};

type ProfileMenuProps = {
  user: ProfileMenuUser;
  className?: string;
};

const profileMenuItems: ProfileMenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Bookmark },
  { label: "My Profile", href: "/profile", icon: UserRound },
  { label: "PrintPilot Setup", href: "/auto-print", icon: Printer },
  { label: "Pricing & Settings", href: "/pricing-settings", icon: Settings },
  { label: "Wallet & Settlement", href: "/wallet", icon: Wallet },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Sign Out", href: "/login", icon: LogOut, onClick: clearSession },
];

export function ProfileMenu({ user, className = "" }: ProfileMenuProps) {
  const ownerName = user.fullName || "Owner";
  const initial = ownerName.charAt(0).toUpperCase() || "O";

  return (
    <details className={`profile-menu ${className}`.trim()}>
      <summary className="user-menu">
        <ProfileAvatar initial={initial} photo={user.profilePhoto} className="avatar" />
        <span>
          <strong>{ownerName}</strong>
          <small>Owner</small>
        </span>
        <ChevronDown size={15} />
      </summary>
      <div className="profile-dropdown">
        <div className="profile-head">
          <ProfileAvatar initial={initial} photo={user.profilePhoto} className="profile-photo" />
          <div>
            <strong>{ownerName}</strong>
            <span>{user.email || "No email added"}</span>
          </div>
        </div>
        <div className="profile-list">
          {profileMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} onClick={item.onClick} key={item.label}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function ProfileAvatar({ initial, photo, className }: { initial: string; photo?: string; className: string }) {
  if (photo) {
    return <img className={className} src={photo} alt="" />;
  }

  return <span className={className}>{initial}</span>;
}
