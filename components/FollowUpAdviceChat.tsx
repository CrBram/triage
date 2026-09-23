"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { TriageResult } from "@/mastra/schemas/triage";
import type { AdviceMessage } from "@/mastra/advice";
import Button from "./Button";
import LoadingBubble from "./LoadingBubble";

type FollowUpAdviceChatProps = {
  assessment: Pick<
    TriageResult,
    | "urgency"
    | "pathway"
    | "next"
    | "summary"
    | "patientMessage"
    | "redFlags"
  >;
};

export default function FollowUpAdviceChat({
  assessment,
}: FollowUpAdviceChatProps) {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AdviceMessage[]>([
    {
      role: "assistant",
      content:
        'You can ask something simple — for example “Can I take Dalfalgan?” or “Is it okay to drink water?”',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLLIElement>(null);

  const canSend = message.trim().length > 0 && !isLoading;

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading, open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const nextMessages: AdviceMessage[] = [
      ...messages,
      { role: "user", content: message.trim() },
    ];
    setMessages(nextMessages);
    setMessage("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment,
          messages: nextMessages,
        }),
      });
      const data = (await res.json()) as
        | { reply: string }
        | { error: string };

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Something went wrong.");
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open && (
        <div className="pointer-events-auto flex h-[min(420px,70dvh)] w-[min(100vw-2rem,360px)] flex-col overflow-hidden rounded-card border border-black/8 bg-white shadow-card">
          <header className="flex shrink-0 items-start justify-between gap-2 border-b border-black/8 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">Ask a question</p>
              <p className="mt-0.5 text-xs text-black/50">
                Simple tips while you wait — assessment stays the same.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-black/50 transition-colors hover:bg-black/5 hover:text-black"
              aria-label="Close chat"
            >
              ✕
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <ul className="flex flex-col gap-2 text-sm font-semibold leading-relaxed">
              {messages.map((m, i) => (
                <li
                  key={`${m.role}-${i}`}
                  className={m.role === "user" ? "text-right" : "text-left"}
                >
                  <span
                    className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left ${
                      m.role === "user"
                        ? "bg-accent/25 text-black"
                        : "bg-black/5 text-black/80"
                    }`}
                  >
                    {m.content}
                  </span>
                </li>
              ))}
              {isLoading && (
                <li className="text-left">
                  <LoadingBubble />
                </li>
              )}
              <li ref={messagesEndRef} aria-hidden className="h-0 list-none" />
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-black/8 px-3 py-3"
          >
            <textarea
              ref={inputRef}
              name="advice-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something simple…"
              rows={2}
              disabled={isLoading}
              className="mb-2 w-full resize-none bg-transparent text-sm text-black/70 outline-none placeholder:text-black/40 disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-xs text-error" role="alert">
                {error}
              </p>
              <Button
                type="submit"
                disabled={!canSend}
                className="shrink-0 px-3 py-1.5 text-xs"
              >
                Ask
              </Button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto flex size-12 items-center justify-center rounded-full bg-accent text-black shadow-card transition-colors hover:bg-accent/80"
        aria-expanded={open}
        aria-label={open ? "Close advice chat" : "Open advice chat"}
      >
        {open ? (
          <span className="text-lg leading-none" aria-hidden>
            ✕
          </span>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="size-5"
          >
            <path
              d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3H7.5A2.5 2.5 0 0 1 5 13.5v-7Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
