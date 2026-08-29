import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Ration Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function RationCardDesignPage() {
  return <IdCardDesignClient docType="ration" />;
}
