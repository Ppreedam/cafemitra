"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import ImageTransformTool from "../ImageTransformTool";

export default function ImageConverterClient({ children }: { children?: ReactNode }) {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-transform-shell">
        <ImageTransformTool slug="image-converter">{children}</ImageTransformTool>
      </div>
    </DashboardShell>
  );
}
