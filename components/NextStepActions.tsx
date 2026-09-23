"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { careHref } from "@/lib/triage-payload";
import type { TriageResult } from "@/mastra/schemas/triage";
import Button from "@/components/Button";

type NextStepActionsProps = {
  result: TriageResult;
  id: string;
};

const buttonClass =
  "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function continueLabel(result: TriageResult) {
  if (result.next === "emergency") return "Continue to emergency help";
  if (result.next === "schedule") {
    return `Request ${result.pathway} appointment`;
  }
  return "View self-care guidance";
}

function continueButtonClass(result: TriageResult) {
  if (result.next === "emergency") {
    return `${buttonClass} w-full bg-error text-white hover:bg-error/90`;
  }
  if (result.next === "schedule") {
    return `${buttonClass} w-full bg-accent text-black hover:bg-accent/80`;
  }
  return `${buttonClass} w-full border border-black/15 text-black hover:bg-black/5`;
}

export default function NextStepActions({ result, id }: NextStepActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleContinue(event: FormEvent) {
    event.preventDefault();
    const trimmed = phone.trim();
    if (trimmed.replace(/\D/g, "").length < 8) {
      setError("Enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/triage/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: trimmed }),
      });
      if (!res.ok) {
        throw new Error("Could not save your phone number. Please try again.");
      }

      router.push(
        careHref({
          id,
          ...result,
          phoneNumber: trimmed,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={continueButtonClass(result)}
        >
          {continueLabel(result)}
        </button>
        {result.next === "emergency" && (
          <p className="text-sm text-black/60">
            Do not drive yourself. Ask someone nearby for help if you can.
          </p>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close"
            onClick={() => !submitting && setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-card bg-background p-5 shadow-card">
            <h2
              id="phone-modal-title"
              className="text-lg font-semibold tracking-tight"
            >
              Your phone number
            </h2>
            <p className="mt-1 text-sm text-black/60">
              So {result.next === "emergency" ? "care services" : "the hospital"}{" "}
              can reach you about this request.
            </p>

            <form onSubmit={handleContinue} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-black/45">
                  Phone number
                </span>
                <input
                  type="tel"
                  autoComplete="tel"
                  autoFocus
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError(null);
                  }}
                  placeholder="+32 4xx xx xx xx"
                  disabled={submitting}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-accent"
                />
              </label>

              {error && (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-1 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !phone.trim()}>
                  {submitting ? "Saving…" : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
