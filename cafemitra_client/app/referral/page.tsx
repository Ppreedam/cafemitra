import type { Metadata } from "next";
import ReferralClient from "./ReferralClient";

export const metadata: Metadata = {
  title: "Refer & Earn | RepetiGo",
  robots: { index: false, follow: false },
};

export default function ReferralPage() {
  return <ReferralClient />;
}
