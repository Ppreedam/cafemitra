import type { Metadata } from "next";
import WalletClient from "./WalletClient";

export const metadata: Metadata = {
  title: "Wallet | RepetiGo",
  robots: { index: false, follow: false },
};

export default function WalletPage() {
  return <WalletClient />;
}
