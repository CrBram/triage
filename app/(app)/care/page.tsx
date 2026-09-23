import Link from "next/link";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { decodeTriagePayload } from "@/lib/triage-payload";
import { getInstance } from "@/lib/instances";

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
  const instanceId = String(data.instanceId ?? "");
  const instance = instanceId ? await getInstance(instanceId) : null;
  const instanceName =
    instance?.name ?? (instanceId || "your care provider");

  const title =
    next === "emergency"
      ? "Emergency handoff"
      : next === "schedule"
        ? "Appointment request"
        : "Self-care guidance";

  const sentLine = `Information has been sent to ${instanceName}.`;

  return (
    <Content title="nimblecare · next step">
      <div className="flex w-full max-w-xl flex-col gap-6 rounded-card bg-white p-6 shadow-card">
        <h1 className="text-3xl">{title}</h1>
        <p className="text-lg text-black/70">
          {next === "emergency"
            ? `Call emergency services now. ${sentLine}`
            : next === "schedule"
              ? `${sentLine} They will follow up about your ${pathway} appointment.`
              : `${sentLine} Follow the self-care guidance for ${pathway}, and seek urgent care if symptoms worsen.`}
        </p>

        {next === "emergency" && (
          <a
            href="tel:112"
            className={`${buttonClass} bg-error text-white hover:bg-error/90`}
          >
            Call emergency services (112)
          </a>
        )}

        <Link href="/">
          <Button variant="secondary">Back to triage</Button>
        </Link>
      </div>
    </Content>
  );
}
