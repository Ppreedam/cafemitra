import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "Agriculture Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function AgricultureCardDesignPage() {
  return <IdCardDesignClient docType="agriculture" />;
}
