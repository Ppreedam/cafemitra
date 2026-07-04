import Link from "next/link";
import {
  BarChart3,
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  LayoutGrid,
  MessageCircle,
  Printer,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ProfileForms } from "./ProfileForms";
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
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

export default function ProfilePage() {
  return (
    <DashboardShell activePath="/profile">
      <div className="dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>My Profile</h1>
              <p>Manage owner details, password, and cafe branding setup.</p>
            </div>
            <span className="status-pill">Profile Active</span>
          </div>

          <ProfileForms />
      </div>
    </DashboardShell>
  );
}
