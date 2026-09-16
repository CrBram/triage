import Link from "next/link";
import Content from "@/components/Content";
import Button from "@/components/Button";
import { decodeTriagePayload } from "@/lib/triage-payload";

type CarePageProps = {
  searchParams: Promise<{ payload?: string }>;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Mock hospital handoff: shows the action (call / schedule / self-care)
 * and the triage payload that would be sent to scheduling / contact center / EHR.
 */
export default async function CarePage({ searchParams }: CarePageProps) {
  const { payload } = await searchParams;
  const result = payload ? decodeTriagePayload(payload) : null;

  if (!result) {
    return (
      <Content title="Wecare · next step">
        <div className="flex w-full max-w-xl flex-col gap-6 rounded-card bg-white p-6 shadow-card">
          <h1 className="text-3xl">No triage data</h1>
          <p className="text-lg text-black/70">
            Open this page from an assessment CTA so the triage payload can be
            attached.
          </p>
          <Link href="/">
            <Button variant="secondary">Back to triage</Button>
          </Link>
        </div>
      </Content>
    );
  }

  const title =
    result.next === "emergency"
      ? "Emergency handoff"
      : result.next === "schedule"
        ? "Appointment request"
        : "Self-care guidance";

  const description =
    result.next === "emergency"
      ? "In a real integration this triage payload would be sent to emergency dispatch / the ED. Call now, and keep this summary ready."
      : result.next === "schedule"
        ? `This payload would be sent to the hospital scheduling system for ${result.pathway} (${result.consultationType}).`
        : `This payload would be filed for ${result.pathway} with self-care instructions. Seek urgent care if symptoms worsen.`;

  return (
    <Content title="Wecare · next step">
      <div className="flex w-full max-w-xl flex-col gap-6 rounded-card bg-white p-6 shadow-card">
        <h1 className="text-3xl">{title}</h1>
        <p className="text-lg text-black/70">{description}</p>

        {result.next === "emergency" && (
          <div className="flex flex-col gap-2">
            <a
              href="tel:112"
              className={`${buttonClass} bg-error text-white hover:bg-error/90`}
            >
              Call emergency services (112)
            </a>
            <p className="text-sm text-black/60">
              Do not drive yourself. Ask someone nearby for help if you can.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-black/60">
            Payload sent with this request
          </p>
          <pre className="overflow-x-auto rounded-lg bg-black/5 p-4 text-xs leading-relaxed text-black/70">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <Link href="/">
          <Button variant="secondary">Back to triage</Button>
        </Link>
      </div>
    </Content>
  );
}
