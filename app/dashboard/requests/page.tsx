"use client";

import { useCallback, useEffect, useState } from "react";
import RequestCard from "@/components/RequestCard";
import { useActiveInstance } from "@/components/ActiveInstanceProvider";
import type { TriageSession } from "@/lib/sessions";

export default function RequestsPage() {
  const { activeInstanceId, activeInstance } = useActiveInstance();
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/triage?instanceId=${encodeURIComponent(activeInstanceId)}`,
      );
      if (!res.ok) throw new Error("Failed to load requests.");
      setSessions((await res.json()) as TriageSession[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [activeInstanceId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 bg-background px-4 pt-8 pb-4 sm:-mx-6 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="mt-1 text-sm text-black/60">
          Triage assessments for{" "}
          {activeInstance?.name ?? "the selected instance"}.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-black/50">Loading requests…</p>
      ) : sessions.length === 0 ? (
        <div className="rounded-card border border-dashed border-black/15 bg-white/40 px-6 py-16 text-center">
          <p className="text-sm text-black/55">
            No triage requests yet for this instance.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <li key={session.id} className="h-full">
              <RequestCard session={session} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
