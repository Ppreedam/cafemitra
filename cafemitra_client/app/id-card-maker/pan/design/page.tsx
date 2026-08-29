import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "PAN Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function PanCardDesignPage() {
  return <IdCardDesignClient docType="pan" />;
}
