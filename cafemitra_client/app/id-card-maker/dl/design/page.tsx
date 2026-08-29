import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Driving Licence Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function DlCardDesignPage() {
  return <IdCardDesignClient docType="dl" />;
}
