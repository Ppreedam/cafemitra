"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import ImageTransformTool from "../ImageTransformTool";

export default function ResizeImageClient({ children }: { children?: ReactNode }) {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-transform-shell">
        <ImageTransformTool slug="resize-image">{children}</ImageTransformTool>
      </div>
    </DashboardShell>
  );
}
