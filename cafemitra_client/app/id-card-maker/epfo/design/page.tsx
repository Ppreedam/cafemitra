import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "EPFO / UAN Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function EpfoCardDesignPage() {
  return <IdCardDesignClient docType="epfo" />;
}
