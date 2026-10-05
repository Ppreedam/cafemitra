import type { Metadata } from "next";
import InfluencerClient from "./InfluencerClient";

export const metadata: Metadata = {
  title: "Influencer Dashboard | RepetiGo",
  robots: { index: false, follow: false },
};

export default function InfluencerPage() {
  return <InfluencerClient />;
}
