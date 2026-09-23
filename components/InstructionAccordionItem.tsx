"use client";

type InstructionFields = {
  id: string;
  name: string;
  description: string;
};

type InstructionAccordionItemProps = {
  item: InstructionFields;
  open: boolean;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  onToggle: () => void;
  onChange: (
    patch: Partial<Pick<InstructionFields, "name" | "description">>,
  ) => void;
  onDelete: () => void;
};

export default function InstructionAccordionItem({
  item,
  open,
  namePlaceholder,
  descriptionPlaceholder,
  onToggle,
  onChange,
  onDelete,
}: InstructionAccordionItemProps) {
  return (
    <li className="rounded-card bg-white shadow-card">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={`shrink-0 text-black/40 transition-transform ${open ? "rotate-90" : ""}`}
            aria-hidden
          >
            ▸
          </span>
          <span className="truncate text-sm font-semibold text-black">
            {item.name || namePlaceholder}
          </span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-error/80 transition-colors hover:bg-error/10 hover:text-error"
        >
          Delete
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-black/8 px-4 py-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-black/45">Name</span>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={namePlaceholder}
              className="w-full rounded-lg border border-black/10 bg-background/40 px-3 py-2 text-sm font-semibold text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:bg-white"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-black/45">
              Description
            </span>
            <textarea
              value={item.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              placeholder={descriptionPlaceholder}
              className="w-full resize-none rounded-lg border border-black/10 bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent focus:bg-white"
            />
          </label>
        </div>
      )}
    </li>
  );
}
