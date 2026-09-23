import { listSessions } from "@/lib/sessions";
import RequestCard from "@/components/RequestCard";

export default async function RequestsPage() {
  const sessions = await listSessions();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="mt-1 text-sm text-black/60">
          Triage assessments submitted for this instance.
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-card border border-dashed border-black/15 bg-white/40 px-6 py-16 text-center">
          <p className="text-sm text-black/55">
            No triage requests yet. Completed assessments will show up here.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <RequestCard session={session} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
