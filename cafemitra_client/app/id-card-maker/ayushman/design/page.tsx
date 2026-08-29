import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Ayushman Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function AyushmanCardDesignPage() {
  return <IdCardDesignClient docType="ayushman" />;
}
