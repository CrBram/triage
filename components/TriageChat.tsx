"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { TriageMessage } from "@/mastra/triage";
import type {
  TriageResult,
  TriageTurn,
  Urgency,
} from "@/mastra/schemas/triage";
import Button from "./Button";
import LoadingBubble from "./LoadingBubble";
import NextStepActions from "./NextStepActions";

type TriageChatProps = {
  title?: string;
  placeholder?: string;
  onSessionId?: (id: string | null) => void;
};

const urgencyStyles: Record<Urgency, string> = {
  emergency: "bg-error/15 text-error",
  urgent: "bg-warning/20 text-warning",
  routine: "bg-success/15 text-success",
};

export default function TriageChat({
  title = "How are you feeling today?",
  placeholder = "Describe your current symptoms as accurately as possible.",
  onSessionId,
}: TriageChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLLIElement>(null);

  const canSend = message.trim().length > 0 && !isLoading;

  useEffect(() => {
    if (isLoading || result) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [isLoading, result]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;
  const lastQuestion = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.content;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;

    const nextMessages: TriageMessage[] = [
      ...messages,
      { role: "user", content: message.trim() },
    ];
    setMessages(nextMessages);
    setMessage("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await res.json()) as
        | (TriageTurn & { id?: string })
        | { error: string };

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Something went wrong.");
      }

      if (data.type === "question") {
        setMessages([
          ...nextMessages,
          { role: "assistant", content: data.question },
        ]);
      } else {
        setResult(data.result);
        if (data.id) {
          setSessionId(data.id);
          onSessionId?.(data.id);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function reset() {
    setMessage("");
    setMessages([]);
    setResult(null);
    setSessionId(null);
    onSessionId?.(null);
    setError(null);
  }

  if (result) {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-10 overflow-y-auto py-4">
        <h1>Your assessment</h1>

        <div className="flex w-full flex-col gap-5 rounded-card bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span
              className={`rounded-md px-2.5 py-1 capitalize ${urgencyStyles[result.urgency]}`}
            >
              {result.urgency}
            </span>
            <span className="rounded-md bg-accent/25 px-2.5 py-1">
              {result.pathway}
            </span>
            <span className="rounded-md bg-black/5 px-2.5 py-1">
              {result.consultationType}
            </span>
          </div>

          <p className="text-lg leading-relaxed">{result.patientMessage}</p>

          {result.redFlags.length > 0 && (
            <ul className="flex flex-col gap-1 text-sm text-black/70">
              {result.redFlags.map((flag) => (
                <li key={flag}>• {flag}</li>
              ))}
            </ul>
          )}

          <NextStepActions result={result} id={sessionId ?? "unknown"} />

          <details className="text-xs text-black/50">
            <summary className="cursor-pointer">Raw output</summary>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-3 text-black/70">
              {JSON.stringify({ id: sessionId, ...result }, null, 2)}
            </pre>
          </details>
        </div>

        <Button variant="secondary" onClick={reset}>
          Start a new assessment
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`grid h-full w-full max-w-2xl min-h-0 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        hasMessages ? "grid-rows-[0fr_1fr_0fr]" : "grid-rows-[1fr_auto_1fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden" aria-hidden />

      <div
        className={`flex min-h-0 w-full flex-col items-center ${
          hasMessages ? "h-full overflow-hidden" : ""
        }`}
      >
        <h1 className="mb-6 shrink-0 text-center">{title}</h1>

        <div
          className={`grid w-full min-h-0 transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            hasMessages
              ? "mb-4 flex-1 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto overscroll-contain">
              <ul className="flex w-full flex-col gap-3 text-base font-semibold leading-relaxed">
                {messages.map((m, i) => (
                  <li
                    key={i}
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
                {isLoading && (
                  <li className="text-left">
                    <LoadingBubble />
                  </li>
                )}
                <li
                  ref={messagesEndRef}
                  aria-hidden
                  className="h-0 list-none"
                />
              </ul>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full shrink-0 flex-col gap-3 rounded-card bg-white p-5 shadow-card"
        >
          <textarea
            ref={inputRef}
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lastQuestion ? "Type your answer…" : placeholder}
            rows={4}
            disabled={isLoading}
            className="w-full resize-none bg-transparent text-lg text-black/70 outline-none placeholder:text-black/70 disabled:opacity-60"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
            <Button type="submit" disabled={!canSend} className="gap-2">
              Send
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                className="size-4"
              >
                <path
                  d="M6 3.5 10.5 8 6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </form>
      </div>

      <div className="min-h-0 overflow-hidden" aria-hidden />
    </div>
  );
}
