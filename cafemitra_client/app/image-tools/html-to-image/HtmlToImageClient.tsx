"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import ImageTransformTool from "../ImageTransformTool";

export default function HtmlToImageClient({ children }: { children?: ReactNode }) {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-transform-shell">
        <ImageTransformTool slug="html-to-image">{children}</ImageTransformTool>
      </div>
    </DashboardShell>
  );
}
