"use client";

import { useState } from "react";
import Button from "@/components/Button";
import {
  DEFAULT_PATHWAY_INSTRUCTIONS,
  type PathwayInstruction,
} from "@/lib/pathways";

export default function InstructionsPage() {
  const [pathways, setPathways] = useState<PathwayInstruction[]>(
    DEFAULT_PATHWAY_INSTRUCTIONS,
  );
  const [saved, setSaved] = useState(false);

  function updateDescription(index: number, description: string) {
    setSaved(false);
    setPathways((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item)),
    );
  }

  function handleSave() {
    // Persistence comes later — UI only for now.
    setSaved(true);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="mb-4 flex shrink-0 items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Instructions
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Describe each care pathway so the triage AI knows when to use it.
          </p>
        </div>
        <Button type="button" onClick={handleSave}>
          {saved ? "Saved" : "Save"}
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-4">
          {pathways.map((item, index) => (
            <li
              key={item.pathway}
              className="rounded-card bg-white p-5 shadow-card"
            >
              <label className="flex flex-col gap-2">
                <span className="text-base font-semibold">{item.pathway}</span>
                <textarea
                  value={item.description}
                  onChange={(e) => updateDescription(index, e.target.value)}
                  rows={3}
                  className="w-full resize-y rounded-lg border border-black/10 bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:bg-white"
                  placeholder={`When should patients be routed to ${item.pathway}?`}
                />
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
