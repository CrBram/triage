"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import { useActiveInstance } from "@/components/ActiveInstanceProvider";
import type { Instance } from "@/lib/instances";

export default function InstancesPage() {
  const { refreshInstances } = useActiveInstance();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instances?includeInactive=1");
      if (!res.ok) throw new Error("Failed to load instances.");
      const data = (await res.json()) as Instance[];
      setInstances(data);
      setDraftNames(
        Object.fromEntries(data.map((item) => [item.id, item.name])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to create instance.");
      }
      setNewName("");
      await load();
      await refreshInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create.");
    } finally {
      setCreating(false);
    }
  }

  async function saveName(instance: Instance) {
    const name = (draftNames[instance.id] ?? instance.name).trim();
    if (!name || name === instance.name) return;
    setSavingId(instance.id);
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Failed to save name.");
      }
      await load();
      await refreshInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSavingId(null);
    }
  }

  async function setActive(instance: Instance, active: boolean) {
    setSavingId(instance.id);
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed to update instance status.");
      await load();
      await refreshInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-10 -mx-4 -mt-4 mb-8 bg-background px-4 pt-8 pb-4 sm:-mx-6 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Instances</h1>
        <p className="mt-1 text-sm text-black/60">
          Manage care instances and their configurations.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-black/50">
          Add instance
        </h2>
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 rounded-card bg-white p-5 shadow-card sm:flex-row sm:items-end"
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold text-black/45">Name</span>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. AZ Alma"
              className="w-full rounded-lg border border-black/10 bg-background/40 px-3 py-2 text-sm font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:bg-white"
            />
          </label>
          <Button type="submit" disabled={creating || !newName.trim()}>
            {creating ? "Adding…" : "Add instance"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-black/50">
          All instances
        </h2>

        {loading ? (
          <p className="text-sm text-black/50">Loading instances…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {instances.map((instance) => {
              const draft = draftNames[instance.id] ?? instance.name;
              const dirty = draft.trim() !== instance.name;
              const busy = savingId === instance.id;

              return (
                <li
                  key={instance.id}
                  className={`rounded-card bg-white p-5 shadow-card ${
                    instance.active ? "" : "opacity-70"
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-black/45">
                      Name
                      {!instance.active && (
                        <span className="ml-2 rounded-md bg-black/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black/50">
                          Inactive
                        </span>
                      )}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) =>
                          setDraftNames((prev) => ({
                            ...prev,
                            [instance.id]: e.target.value,
                          }))
                        }
                        className="min-w-0 w-full flex-1 rounded-lg border border-black/10 bg-background/40 px-3 py-2 text-sm font-semibold text-black outline-none transition-colors focus:border-accent focus:bg-white"
                      />
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={busy || !dirty || !draft.trim()}
                          onClick={() => void saveName(instance)}
                        >
                          {busy && dirty ? "Saving…" : "Save"}
                        </Button>
                        {instance.active ? (
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busy}
                            onClick={() => void setActive(instance, false)}
                            className="text-error hover:bg-error/10"
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void setActive(instance, true)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-black/40">
                      id: {instance.id}
                    </span>
                  </div>
                </li>
              );
            })}
            {instances.length === 0 && (
              <li className="rounded-card border border-dashed border-black/15 bg-white/40 px-4 py-8 text-center text-sm text-black/50">
                No instances yet.
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
