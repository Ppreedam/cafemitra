"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// The resume's real design is authored at a fixed desktop width - narrower
// wrappers used to reflow it (stack the sidebar, shrink padding) via a mobile
// media query, which meant a two-column template silently turned into a
// different-looking single column on phones. Instead this renders the page
// at its true width always, then visually shrinks it to fit whatever space
// is available, the way a browser's PDF viewer would - same layout at every
// screen size, just smaller.
const STAGE_WIDTH = 680;

export function ResumeScaleStage({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [outerHeight, setOuterHeight] = useState(0);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage) return;
    const recalc = () => {
      const width = outer.clientWidth;
      const nextScale = width > 0 ? Math.min(1, width / STAGE_WIDTH) : 1;
      setScale(nextScale);
      setOuterHeight(stage.scrollHeight * nextScale);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(outer);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="resbuild-scale-outer" ref={outerRef} style={outerHeight ? { height: outerHeight } : undefined}>
      <div className="resbuild-scale-stage" ref={stageRef} style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
