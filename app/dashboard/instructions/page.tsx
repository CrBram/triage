"use client";

import { useState } from "react";
import Button from "@/components/Button";
import InstructionAccordionItem from "@/components/InstructionAccordionItem";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
  type InstructionItem,
} from "@/lib/pathways";

export default function InstructionsPage() {
  const [pathways, setPathways] = useState<InstructionItem[]>(
    DEFAULT_PATHWAY_INSTRUCTIONS,
  );
  const [consultations, setConsultations] = useState<InstructionItem[]>(
    DEFAULT_CONSULTATION_INSTRUCTIONS,
  );
  const [openPathwayId, setOpenPathwayId] = useState<string | null>(null);
  const [openConsultationId, setOpenConsultationId] = useState<string | null>(
    null,
  );
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setSaved(false);
  }

  function updateItem(
    setter: React.Dispatch<React.SetStateAction<InstructionItem[]>>,
    id: string,
    patch: Partial<Pick<InstructionItem, "name" | "description">>,
  ) {
    markDirty();
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function deleteItem(
    setter: React.Dispatch<React.SetStateAction<InstructionItem[]>>,
    id: string,
    openId: string | null,
    setOpenId: (id: string | null) => void,
  ) {
    markDirty();
    setter((prev) => prev.filter((item) => item.id !== id));
    if (openId === id) setOpenId(null);
  }

  function addItem(
    setter: React.Dispatch<React.SetStateAction<InstructionItem[]>>,
    setOpenId: (id: string | null) => void,
  ) {
    markDirty();
    const id = `new-${crypto.randomUUID().slice(0, 8)}`;
    setter((prev) => [...prev, { id, name: "", description: "" }]);
    setOpenId(id);
  }

  function handleSave() {
    // Persistence comes later — UI only for now.
    setSaved(true);
  }

  return (
    <div className="pb-8">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Instructions
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Configure pathways and consultation types for the triage AI.
          </p>
        </div>
        <Button type="button" onClick={handleSave}>
          {saved ? "Saved" : "Save"}
        </Button>
      </header>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black/50">
            Pathways
          </h2>
          <button
            type="button"
            onClick={() => addItem(setPathways, setOpenPathwayId)}
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
              onChange={(patch) => updateItem(setPathways, item.id, patch)}
              onDelete={() =>
                deleteItem(
                  setPathways,
                  item.id,
                  openPathwayId,
                  setOpenPathwayId,
                )
              }
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
            onClick={() => addItem(setConsultations, setOpenConsultationId)}
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
              onChange={(patch) =>
                updateItem(setConsultations, item.id, patch)
              }
              onDelete={() =>
                deleteItem(
                  setConsultations,
                  item.id,
                  openConsultationId,
                  setOpenConsultationId,
                )
              }
            />
          ))}
          {consultations.length === 0 && (
            <li className="rounded-card border border-dashed border-black/15 bg-white/40 px-4 py-8 text-center text-sm text-black/50">
              No consultation types yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
