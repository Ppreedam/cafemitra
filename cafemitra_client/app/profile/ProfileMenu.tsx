"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Bookmark, ChevronDown, ExternalLink, Gift, LogOut, Megaphone, Printer, Settings, SlidersHorizontal, UserRound, Wallet, X, type LucideIcon } from "lucide-react";
import { clearSession } from "@/lib/api";
import { setToolsOpenInNewTab, useToolsOpenInNewTab } from "@/lib/uiPrefs";

export type ProfileMenuUser = {
  email?: string;
  fullName?: string;
  profilePhoto?: string;
  isInfluencer?: boolean;
};

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
  influencerOnly?: boolean;
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
  { label: "Service Credits & Settlement", href: "/wallet", icon: Wallet },
  { label: "Refer & Earn", href: "/referral", icon: Gift },
  { label: "Influencer Dashboard", href: "/influencer", icon: Megaphone, influencerOnly: true },
  { label: "Sign Out", href: "/login", icon: LogOut, onClick: clearSession },
];

export function ProfileMenu({ user, className = "" }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductSettingsOpen, setIsProductSettingsOpen] = useState(false);
  const toolsInNewTab = useToolsOpenInNewTab();
  const ownerName = user.fullName || "Owner";
  const initial = ownerName.charAt(0).toUpperCase() || "O";

  return (
    <>
    <details
      className={`profile-menu ${className}`.trim()}
      open={isOpen}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onFocus={() => setIsOpen(true)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <summary
        className="user-menu"
        onClick={(event) => {
          event.preventDefault();
          setIsOpen((current) => !current);
        }}
      >
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
          {profileMenuItems.filter((item) => !item.influencerOnly || user.isInfluencer).map((item) => {
            const Icon = item.icon;
            return (
              <Fragment key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                >
                  <Icon size={18} /> {item.label}
                </Link>
                {item.label === "Pricing & Settings" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsProductSettingsOpen(true);
                    }}
                  >
                    <SlidersHorizontal size={18} /> Product Settings
                  </button>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </div>
    </details>
      {isProductSettingsOpen ? (
        <div
          className="product-settings-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Product settings"
          onMouseDown={(event) => event.target === event.currentTarget && setIsProductSettingsOpen(false)}
        >
          <div className="product-settings-card">
            <div className="product-settings-head">
              <h2>Product Settings</h2>
              <button type="button" aria-label="Close" onClick={() => setIsProductSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <label className="product-settings-row">
              <span className="product-settings-icon">
                <ExternalLink size={18} />
              </span>
              <span className="product-settings-text">
                <strong>Open tools in a new tab</strong>
                <small>
                  {toolsInNewTab ? "Sidebar tools open in a new browser tab." : "Sidebar tools open in the same tab (default)."}
                </small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={toolsInNewTab}
                onChange={(event) => setToolsOpenInNewTab(event.target.checked)}
              />
            </label>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ProfileAvatar({ initial, photo, className }: { initial: string; photo?: string; className: string }) {
  if (photo) {
    return <img className={className} src={photo} alt="" />;
  }

  return <span className={className}>{initial}</span>;
}
