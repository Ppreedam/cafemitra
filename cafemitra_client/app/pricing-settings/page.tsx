import type { Metadata } from "next";
import PricingSettingsClient from "./PricingSettingsClient";

export const metadata: Metadata = {
  title: "Pricing Settings | RepetiGo",
  robots: { index: false, follow: false },
};

export default function PricingSettingsPage() {
  return <PricingSettingsClient />;
}
