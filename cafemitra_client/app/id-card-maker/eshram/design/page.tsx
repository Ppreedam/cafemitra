import type { Metadata } from "next";
import IdCardDesignClient from "../../IdCardDesignClient";

export const metadata: Metadata = {
  title: "e-Shram Card Design | RepetiGo",
  robots: { index: false, follow: false },
};

export default function EshramCardDesignPage() {
  return <IdCardDesignClient docType="eshram" />;
}
