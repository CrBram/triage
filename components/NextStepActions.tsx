import type { TriageResult } from "@/mastra/schemas/triage";
import { careHref } from "@/lib/triage-payload";

type NextStepActionsProps = {
  result: TriageResult;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * One primary action derived from the triage outcome.
 * Always hands the full triage result off to /care as a mock hospital payload.
 */
export default function NextStepActions({ result }: NextStepActionsProps) {
  const href = careHref(result);

  if (result.next === "emergency") {
    return (
      <div className="flex flex-col gap-2">
        <a
          href={href}
          className={`${buttonClass} bg-error text-white hover:bg-error/90`}
        >
          Continue to emergency help
        </a>
        <p className="text-sm text-black/60">
          Do not drive yourself. Ask someone nearby for help if you can.
        </p>
      </div>
    );
  }

  if (result.next === "schedule") {
    return (
      <a
        href={href}
        className={`${buttonClass} bg-accent text-black hover:bg-accent/80`}
      >
        Request {result.pathway} appointment
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`${buttonClass} border border-black/15 text-black hover:bg-black/5`}
    >
      View self-care guidance
    </a>
  );
}
