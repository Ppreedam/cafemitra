import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Aadhaar Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function AadhaarCardDesignPage() {
  return <IdCardDesignClient docType="aadhaar" />;
}
