"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import InstructionAccordionItem from "@/components/InstructionAccordionItem";
import { CURRENT_INSTANCE } from "@/lib/instance";
import type { Instruction, InstructionType } from "@/lib/instructions";

const instanceUrl = `/api/instances/${CURRENT_INSTANCE.id}`;
const instructionsUrl = `${instanceUrl}/instructions`;

export default function InstructionsPage() {
  const [items, setItems] = useState<Instruction[]>([]);
  const [baseline, setBaseline] = useState<Record<string, Instruction>>({});
  const [generalInfo, setGeneralInfo] = useState("");
  const [baselineGeneralInfo, setBaselineGeneralInfo] = useState("");
  const [openPathwayId, setOpenPathwayId] = useState<string | null>(null);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const pathways = useMemo(
    () => items.filter((item) => item.type === "pathway"),
    [items],
  );
  const consultations = useMemo(
    () => items.filter((item) => item.type === "consultation"),
    [items],
  );

  const instructionsDirty = useMemo(
    () =>
      items.some((item) => {
        const original = baseline[item.id];
        if (!original) return false;
        return (
          item.name !== original.name ||
          item.description !== original.description
        );
      }),
    [items, baseline],
  );

  const generalInfoDirty = generalInfo !== baselineGeneralInfo;
  const dirty = instructionsDirty || generalInfoDirty;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [instanceRes, instructionsRes] = await Promise.all([
        fetch(instanceUrl),
        fetch(instructionsUrl),
      ]);
      if (!instanceRes.ok) throw new Error("Failed to load instance.");
      if (!instructionsRes.ok) throw new Error("Failed to load instructions.");

      const instance = (await instanceRes.json()) as { generalInfo: string };
      const data = (await instructionsRes.json()) as Instruction[];

      setGeneralInfo(instance.generalInfo ?? "");
      setBaselineGeneralInfo(instance.generalInfo ?? "");
      setItems(data);
      setBaseline(Object.fromEntries(data.map((item) => [item.id, item])));
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateLocal(
    id: string,
    patch: Partial<Pick<Instruction, "name" | "description">>,
  ) {
    setSaved(false);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  async function addItem(type: InstructionType) {
    setError(null);
    try {
      const res = await fetch(instructionsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: "", description: "" }),
      });
      if (!res.ok) throw new Error("Failed to create instruction.");
      const created = (await res.json()) as Instruction;
      setItems((prev) => [...prev, created]);
      setBaseline((prev) => ({ ...prev, [created.id]: created }));
      if (type === "pathway") setOpenPathwayId(created.id);
      else setOpenConsultationId(created.id);
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create.");
    }
  }

  async function deleteItem(id: string, type: InstructionType) {
    setError(null);
    try {
      const res = await fetch(`${instructionsUrl}/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete instruction.");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      setBaseline((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (type === "pathway" && openPathwayId === id) setOpenPathwayId(null);
      if (type === "consultation" && openConsultationId === id) {
        setOpenConsultationId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function handleSave() {
    if (!dirty) {
      setSaved(true);
      return;
    }

    const dirtyItems = items.filter((item) => {
      const original = baseline[item.id];
      if (!original) return false;
      return (
        item.name !== original.name ||
        item.description !== original.description
      );
    });

    setSaving(true);
    setError(null);
    try {
      const tasks: Promise<void>[] = [];

      if (generalInfoDirty) {
        tasks.push(
          (async () => {
            const res = await fetch(instanceUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ generalInfo }),
            });
            if (!res.ok) throw new Error("Failed to save general information.");
            const instance = (await res.json()) as { generalInfo: string };
            setBaselineGeneralInfo(instance.generalInfo);
            setGeneralInfo(instance.generalInfo);
          })(),
        );
      }

      if (dirtyItems.length > 0) {
        tasks.push(
          (async () => {
            const updated = await Promise.all(
              dirtyItems.map(async (item) => {
                const res = await fetch(`${instructionsUrl}/${item.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: item.name,
                    description: item.description,
                  }),
                });
                if (!res.ok) {
                  throw new Error(
                    `Failed to save "${item.name || item.id}".`,
                  );
                }
                return (await res.json()) as Instruction;
              }),
            );
            const byId = Object.fromEntries(
              updated.map((item) => [item.id, item]),
            );
            setItems((prev) => prev.map((item) => byId[item.id] ?? item));
            setBaseline((prev) => ({ ...prev, ...byId }));
          })(),
        );
      }

      await Promise.all(tasks);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Instructions
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Configure context, pathways and consultation types for the triage
            AI.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || loading || !dirty}
        >
          {saving ? "Saving…" : saved && !dirty ? "Saved" : "Save"}
        </Button>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-black/50">Loading instructions…</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-black/50">
              General information
            </h2>
            <div className="rounded-card bg-white p-5 shadow-card">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-black/45">
                  Instance context
                </span>
                <textarea
                  value={generalInfo}
                  onChange={(e) => {
                    setSaved(false);
                    setGeneralInfo(e.target.value);
                  }}
                  rows={6}
                  placeholder="Describe your hospital, service hours, local triage rules, languages, or anything else the AI should know…"
                  className="w-full resize-none rounded-lg border border-black/10 bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:bg-white"
                />
              </label>
            </div>
          </section>

          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black/50">
                Pathways
              </h2>
              <button
                type="button"
                onClick={() => void addItem("pathway")}
                className="text-xs font-semibold text-black/60 transition-colors hover:text-black"
              >
                + Add pathway
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {pathways.map((item) => (
                <InstructionAccordionItem
                  key={item.id}
                  item={item}
                  open={openPathwayId === item.id}
                  namePlaceholder="Pathway name"
                  descriptionPlaceholder="When should patients be routed to this pathway?"
                  onToggle={() =>
                    setOpenPathwayId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  onChange={(patch) => updateLocal(item.id, patch)}
                  onDelete={() => void deleteItem(item.id, "pathway")}
                />
              ))}
              {pathways.length === 0 && (
                <li className="rounded-card border border-dashed border-black/15 bg-white/40 px-4 py-8 text-center text-sm text-black/50">
                  No pathways yet.
                </li>
              )}
            </ul>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black/50">
                Consultation types
              </h2>
              <button
                type="button"
                onClick={() => void addItem("consultation")}
                className="text-xs font-semibold text-black/60 transition-colors hover:text-black"
              >
                + Add type
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {consultations.map((item) => (
                <InstructionAccordionItem
                  key={item.id}
                  item={item}
                  open={openConsultationId === item.id}
                  namePlaceholder="Consultation type"
                  descriptionPlaceholder="When should this consultation type be used?"
                  onToggle={() =>
                    setOpenConsultationId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  onChange={(patch) => updateLocal(item.id, patch)}
                  onDelete={() => void deleteItem(item.id, "consultation")}
                />
              ))}
              {consultations.length === 0 && (
                <li className="rounded-card border border-dashed border-black/15 bg-white/40 px-4 py-8 text-center text-sm text-black/50">
                  No consultation types yet.
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
