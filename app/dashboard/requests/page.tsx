"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RequestCard from "@/components/RequestCard";
import { useActiveInstance } from "@/components/ActiveInstanceProvider";
import type { TriageSession } from "@/lib/sessions";

type StatusFilter = "all" | "unresolved" | "resolved";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unresolved", label: "Unresolved" },
  { id: "resolved", label: "Resolved" },
];

export default function RequestsPage() {
  const { activeInstanceId, activeInstance } = useActiveInstance();
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
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

  const filtered = useMemo(() => {
    if (filter === "resolved") return sessions.filter((s) => s.resolved);
    if (filter === "unresolved") return sessions.filter((s) => !s.resolved);
    return sessions;
  }, [sessions, filter]);

  function handleUpdated(updated: TriageSession) {
    setSessions((prev) =>
      prev.map((session) => (session.id === updated.id ? updated : session)),
    );
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 bg-background px-4 pt-8 pb-4 sm:-mx-6 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="mt-1 text-sm text-black/60">
          Triage assessments for{" "}
          {activeInstance?.name ?? "the selected instance"}.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-accent text-black"
                    : "bg-white/70 text-black/60 hover:bg-white hover:text-black"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-black/50">Loading requests…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-black/15 bg-white/40 px-6 py-16 text-center">
          <p className="text-sm text-black/55">
            {sessions.length === 0
              ? "No triage requests yet for this instance."
              : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((session) => (
            <li key={session.id} className="h-full">
              <RequestCard session={session} onUpdated={handleUpdated} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
