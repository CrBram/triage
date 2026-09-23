import type { Urgency } from "@/mastra/schemas/triage";
import type { TriageSession } from "@/lib/sessions";

const urgencyStyles: Record<Urgency, string> = {
  emergency: "bg-error/15 text-error",
  urgent: "bg-warning/20 text-warning",
  routine: "bg-success/15 text-success",
};

type RequestCardProps = {
  session: TriageSession;
};

export default function RequestCard({ session }: RequestCardProps) {
  const confidencePct = Math.round(session.confidence * 100);
  const created = new Date(session.createdAt);

  return (
    <article className="flex h-full flex-col gap-3 rounded-card bg-white p-5 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-black/50">
            {session.id}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {session.pathway}
          </h2>
        </div>
        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${urgencyStyles[session.urgency]}`}
        >
          {session.urgency}
        </span>
      </header>

      <p className="line-clamp-3 text-sm leading-relaxed text-black/70">
        {session.summary}
      </p>

      <div className="mt-auto flex flex-col gap-3">
        <dl className="grid grid-cols-2 gap-3 border-t border-black/8 pt-3 text-xs">
          <div>
            <dt className="font-semibold text-black/45">Next step</dt>
            <dd className="mt-0.5 font-semibold capitalize text-black">
              {session.next}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-black/45">Confidence</dt>
            <dd className="mt-0.5 font-semibold text-black">{confidencePct}%</dd>
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
      </div>
    </article>
  );
}
