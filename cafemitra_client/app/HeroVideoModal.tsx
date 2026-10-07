"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

const videos = [
  { key: "demo", label: "Product Demo", title: "RepetiGo Product Demo", id: "hUspj2vx-wA" },
  { key: "setup", label: "Setup Tutorial", title: "PrintPilot Complete Setup Tutorial 2026", id: "TP76Eedq-aY" },
] as const;

export default function HeroVideoModal() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<(typeof videos)[number]["key"]>("demo");
  const video = videos.find((item) => item.key === active) ?? videos[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button className="ai-btn ai-btn-light" type="button" onClick={() => setOpen(true)}>
        <Play size={17} /> Watch Demo (2 min)
      </button>
      {open ? (
        <div className="hero-video-backdrop" role="dialog" aria-modal="true" aria-label="RepetiGo videos" onClick={() => setOpen(false)}>
          <div className="hero-video-modal" onClick={(event) => event.stopPropagation()}>
            <div className="hero-video-head">
              <div className="hero-video-tabs">
                {videos.map((item) => (
                  <button
                    className={item.key === active ? "active" : ""}
                    key={item.key}
                    type="button"
                    onClick={() => setActive(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button className="hero-video-close" type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <h3>{video.title}</h3>
            <div className="agent-tutorial-frame">
              <iframe
                key={video.id}
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
