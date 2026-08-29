import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Voter ID Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function VoterCardDesignPage() {
  return <IdCardDesignClient docType="voter" />;
}
