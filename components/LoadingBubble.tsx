"use client";

import { useEffect, useState } from "react";

const DEFAULT_PHRASES = [
  "Reading your message…",
  "Checking for warning signs…",
  "Thinking about the right next step…",
  "Almost there…",
];

type LoadingBubbleProps = {
  phrases?: string[];
  /** Milliseconds each phrase stays on screen. */
  interval?: number;
};

/**
 * Assistant-style chat bubble shown while waiting for the triage agent.
 * Cycles through short phrases and sweeps a soft glare across the bubble.
 */
export default function LoadingBubble({
  phrases = DEFAULT_PHRASES,
  interval = 2200,
}: LoadingBubbleProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (phrases.length < 2) return;
    const fadeMs = 250;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;

    const cycle = setInterval(() => {
      setVisible(false);
      fadeTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, fadeMs);
    }, interval);

    return () => {
      clearInterval(cycle);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [phrases.length, interval]);

  return (
    <span
      role="status"
      aria-live="polite"
      className="relative inline-block max-w-[85%] overflow-hidden rounded-lg bg-black/5 px-3 py-2 text-black/50"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden"
      />
      <span
        className={`relative block transition-opacity duration-250 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {phrases[index]}
      </span>
    </span>
  );
}
