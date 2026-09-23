"use client";

import { useEffect, useMemo, useState } from "react";
import type { Urgency } from "@/mastra/schemas/triage";
import type { TriageSession } from "@/lib/sessions";
import ChatHistoryModal from "@/components/ChatHistoryModal";
import PayloadModal from "@/components/PayloadModal";

const urgencyStyles: Record<Urgency, string> = {
  emergency: "bg-error/15 text-error",
  urgent: "bg-warning/20 text-warning",
  routine: "bg-success/15 text-success",
};

type RequestCardProps = {
  session: TriageSession;
  onUpdated?: (session: TriageSession) => void;
};

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function RequestCard({ session, onUpdated }: RequestCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [localSession, setLocalSession] = useState(session);

  useEffect(() => {
    setLocalSession(session);
  }, [session]);

  const confidencePct = Math.round(localSession.confidence * 100);
  const created = new Date(localSession.createdAt);

  const payload = useMemo(() => {
    const { messages: _messages, ...rest } = localSession;
    return rest;
  }, [localSession]);

  async function markResolved() {
    if (localSession.resolved || resolving) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/triage/${localSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: true }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      const updated = (await res.json()) as TriageSession;
      setLocalSession(updated);
      onUpdated?.(updated);
    } catch {
      // Keep card usable even if resolve fails.
    } finally {
      setResolving(false);
    }
  }

  return (
    <>
      <article
        className={`flex h-full flex-col gap-3 rounded-card bg-white p-5 shadow-card ${
          localSession.resolved ? "opacity-80" : ""
        }`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-black/50">
              {localSession.id}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {localSession.pathway}
            </h2>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${urgencyStyles[localSession.urgency]}`}
            >
              {localSession.urgency}
            </span>
            {localSession.resolved && (
              <span className="rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                Resolved
              </span>
            )}
          </div>
        </header>

        <p className="line-clamp-3 text-sm leading-relaxed text-black/70">
          {localSession.summary}
        </p>

        <div className="mt-auto flex flex-col gap-3">
          <dl className="grid grid-cols-2 gap-3 border-t border-black/8 pt-3 text-xs">
            <div>
              <dt className="font-semibold text-black/45">Next step</dt>
              <dd className="mt-0.5 font-semibold capitalize text-black">
                {localSession.next}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-black/45">Confidence</dt>
              <dd className="mt-0.5 font-semibold text-black">
                {confidencePct}%
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-semibold text-black/45">Phone</dt>
              <dd className="mt-0.5 font-semibold text-black">
                {localSession.phoneNumber ?? "Not provided"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="font-semibold text-black/45">Received</dt>
              <dd className="mt-0.5 font-semibold text-black">
                {created.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          </dl>

          <div
            className="h-1.5 overflow-hidden rounded-full bg-black/8"
            role="meter"
            aria-label="Confidence"
            aria-valuenow={confidencePct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${confidencePct}%` }}
            />
          </div>

          {localSession.phoneNumber && (
            <a
              href={telHref(localSession.phoneNumber)}
              onClick={() => void markResolved()}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-accent/80"
            >
              {resolving ? "Contacting…" : "Contact"}
            </a>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="text-xs font-semibold text-black/55 transition-colors hover:text-black"
            >
              View chat history
            </button>
            <button
              type="button"
              onClick={() => setPayloadOpen(true)}
              className="text-xs font-semibold text-black/55 transition-colors hover:text-black"
            >
              View full payload
            </button>
          </div>
        </div>
      </article>

      <ChatHistoryModal
        open={historyOpen}
        sessionId={localSession.id}
        messages={localSession.messages}
        patientMessage={localSession.patientMessage}
        onClose={() => setHistoryOpen(false)}
      />

      <PayloadModal
        open={payloadOpen}
        sessionId={localSession.id}
        payload={payload}
        onClose={() => setPayloadOpen(false)}
      />
    </>
  );
}
