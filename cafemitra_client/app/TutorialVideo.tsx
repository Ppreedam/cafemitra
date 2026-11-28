"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

// YouTube tutorial that starts muted as soon as it scrolls into view (browsers only
// allow autoplay when muted - the viewer turns sound on with the speaker icon in the
// player). Until then only the thumbnail is loaded, so the player's scripts don't
// slow the page; pressing the thumbnail plays it immediately, with sound.
export default function TutorialVideo({ youtubeId, title, heading }: { youtubeId: string; title: string; heading?: string }) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || started) return;
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  return (
    <div className="agent-tutorial tutorial-video">
      {heading ? <h3>{heading}</h3> : null}
      <div className="agent-tutorial-frame" ref={frameRef}>
        {started ? (
          <iframe
            key={muted ? "muted" : "sound"}
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${muted ? 1 : 0}&playsinline=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="tutorial-video-play"
            onClick={() => {
              setMuted(false);
              setStarted(true);
            }}
            aria-label={`Play video: ${title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
            <span className="tutorial-video-badge">
              <Play size={26} fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      {started && muted ? <small className="customer-inline-help">Playing without sound - tap the speaker icon on the video to turn sound on.</small> : null}
    </div>
  );
}
