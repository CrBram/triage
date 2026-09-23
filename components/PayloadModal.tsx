"use client";

import { useEffect } from "react";

type PayloadModalProps = {
  open: boolean;
  sessionId: string;
  payload: unknown;
  onClose: () => void;
};

export default function PayloadModal({
  open,
  sessionId,
  payload,
  onClose,
}: PayloadModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payload-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        aria-label="Close payload"
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(80dvh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-card bg-background shadow-card">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/8 px-5 py-4">
          <div>
            <h2
              id="payload-title"
              className="text-lg font-semibold tracking-tight"
            >
              Full payload
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-black/45">
              {sessionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-black/55 transition-colors hover:bg-black/5 hover:text-black"
          >
            Close
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <pre className="overflow-x-auto rounded-lg bg-white p-4 text-xs leading-relaxed text-black/70 shadow-card">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
