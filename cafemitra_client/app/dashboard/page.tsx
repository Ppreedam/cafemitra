import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | RepetiGo",
  robots: { index: false, follow: false },
};

export default function Dashboard() {
  return <DashboardClient />;
}
