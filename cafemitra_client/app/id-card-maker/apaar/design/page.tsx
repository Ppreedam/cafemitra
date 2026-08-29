import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "APAAR ID Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function ApaarCardDesignPage() {
  return <IdCardDesignClient docType="apaar" />;
}
