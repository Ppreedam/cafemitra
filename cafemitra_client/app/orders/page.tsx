import type { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Orders | RepetiGo",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
