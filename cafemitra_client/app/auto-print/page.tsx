import type { Metadata } from "next";
import AutoPrintClient from "./AutoPrintClient";

export const metadata: Metadata = {
  title: "PrintPilot | RepetiGo",
  robots: { index: false, follow: false },
};

export default function AutoPrintPage() {
  return <AutoPrintClient />;
}
