import Link from "next/link";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { decodeTriagePayload } from "@/lib/triage-payload";

type CarePageProps = {
  searchParams: Promise<{ payload?: string }>;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default async function CarePage({ searchParams }: CarePageProps) {
  const { payload } = await searchParams;
  const data = payload ? decodeTriagePayload(payload) : null;

  if (!data) {
    return (
      <Content title="nimblecare · next step">
        <div className="flex w-full max-w-xl flex-col gap-6 rounded-card bg-white p-6 shadow-card">
          <h1 className="text-3xl">No triage data</h1>
          <Link href="/">
            <Button variant="secondary">Back to triage</Button>
          </Link>
        </div>
      </Content>
    );
  }

  const next = String(data.next ?? "");
  const pathway = String(data.pathway ?? "");
  const consultationType = String(data.consultationType ?? "");

  const title =
    next === "emergency"
      ? "Emergency handoff"
      : next === "schedule"
        ? "Appointment request"
        : "Self-care guidance";

  return (
    <Content title="nimblecare · next step">
      <div className="flex w-full max-w-xl flex-col gap-6 rounded-card bg-white p-6 shadow-card">
        <h1 className="text-3xl">{title}</h1>
        <p className="text-lg text-black/70">
          {next === "emergency"
            ? "Call emergency services now. This payload would be sent to dispatch / the ED."
            : next === "schedule"
              ? `This payload would be sent to scheduling for ${pathway} (${consultationType}).`
              : `Self-care guidance for ${pathway}. Seek urgent care if symptoms worsen.`}
        </p>

        {next === "emergency" && (
          <a
            href="tel:1122"
            className={`${buttonClass} bg-error text-white hover:bg-error/90`}
          >
            Call emergency services (112)
          </a>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-black/60">
            Saved triage payload
          </p>
          <pre className="overflow-x-auto rounded-lg bg-black/5 p-4 text-xs leading-relaxed text-black/70">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        <Link href="/">
          <Button variant="secondary">Back to triage</Button>
        </Link>
      </div>
    </Content>
  );
}
