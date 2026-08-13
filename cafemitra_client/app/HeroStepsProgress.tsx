"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";

const CHECKPOINTS = [
  { pct: 25, label: "Scan", detail: "Customer scans shop QR" },
  { pct: 50, label: "Upload", detail: "Document uploads instantly" },
  { pct: 75, label: "Pay", detail: "Pays online, no queue" },
  { pct: 100, label: "Print", detail: "Job lands on your printer" },
];

function wait(ms: number, signal: { cancelled: boolean }) {
  return new Promise<void>((resolve) => {
    const id = setTimeout(resolve, ms);
    if (signal.cancelled) clearTimeout(id);
  });
}

export function HeroStepsProgress() {
  const [percent, setPercent] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPercent(100);
      return;
    }

    const signal = { cancelled: false };

    async function run() {
      while (!signal.cancelled) {
        setPercent(1);
        await wait(1100, signal);
        for (const checkpoint of CHECKPOINTS) {
          if (signal.cancelled) return;
          setPercent(checkpoint.pct);
          await wait(1800, signal);
        }
        await wait(2400, signal);
      }
    }

    run();
    return () => {
      signal.cancelled = true;
    };
  }, []);

  return (
    <div className="ai-steps-card">
      <div className="ai-steps-head">
        <strong>How customers use RepetiGo</strong>
        <a href="#demo">
          <Play size={12} /> How it works
        </a>
      </div>
      <div className="ai-progress-track">
        <div className="ai-progress-fill" style={{ width: `${percent}%` }}>
          <span className="ai-progress-percent">{percent}%</span>
        </div>
        {CHECKPOINTS.map((checkpoint) => (
          <span key={checkpoint.pct} className="ai-progress-tick" style={{ left: `${checkpoint.pct}%` }} />
        ))}
      </div>
      <div className="ai-steps-labels">
        {CHECKPOINTS.map((checkpoint) => (
          <span key={checkpoint.label} className={`ai-steps-label ${percent >= checkpoint.pct ? "done" : ""}`}>
            <strong>{checkpoint.label}</strong>
            <em>{checkpoint.detail}</em>
          </span>
        ))}
      </div>
    </div>
  );
}
