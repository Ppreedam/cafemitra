"use client";

import { use } from "react";
import ShopDetailView from "@/components/ShopDetailView";

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ShopDetailView shopId={Number(id)} />;
}
