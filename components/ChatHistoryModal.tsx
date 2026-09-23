"use client";

import { useEffect } from "react";
import type { TriageMessage } from "@/mastra/triage";

type ChatHistoryModalProps = {
  open: boolean;
  sessionId: string;
  messages: TriageMessage[];
  patientMessage?: string;
  onClose: () => void;
};

export default function ChatHistoryModal({
  open,
  sessionId,
  messages,
  patientMessage,
  onClose,
}: ChatHistoryModalProps) {
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

  const transcript: TriageMessage[] = [...messages];
  if (
    patientMessage?.trim() &&
    transcript[transcript.length - 1]?.content !== patientMessage.trim()
  ) {
    transcript.push({ role: "assistant", content: patientMessage.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-history-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/35"
        aria-label="Close chat history"
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(80dvh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-card bg-background shadow-card">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-black/8 px-5 py-4">
          <div>
            <h2
              id="chat-history-title"
              className="text-lg font-semibold tracking-tight"
            >
              Chat history
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
          {transcript.length === 0 ? (
            <p className="text-sm text-black/55">
              No chat history was saved for this request.
            </p>
          ) : (
            <ul className="flex w-full flex-col gap-3 text-base font-semibold leading-relaxed">
              {transcript.map((m, i) => (
                <li
                  key={`${m.role}-${i}`}
                  className={m.role === "user" ? "text-right" : "text-left"}
                >
                  <span
                    className={`inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-left ${
                      m.role === "user"
                        ? "bg-accent/25 text-black"
                        : "bg-black/5 text-black/80"
                    }`}
                  >
                    {m.content}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
