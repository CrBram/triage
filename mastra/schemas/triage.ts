import { z } from "zod";

/**
 * Domain vocabulary for the triage flow.
 *
 * These enums are the contract between the AI layer, the UI and the hospital
 * integration payload. Keep them small and stable: the model is only allowed
 * to pick from these values.
 */

export const URGENCIES = ["emergency", "urgent", "routine"] as const;
export const urgencySchema = z.enum(URGENCIES);
export type Urgency = z.infer<typeof urgencySchema>;

export const PATHWAYS = [
  "Emergency Care",
  "Cardiology",
  "Pulmonology",
  "Gastroenterology",
  "General Practice",
] as const;
/** @deprecated Prefer instance instruction names; kept as default seed/fallback catalog. */
export const pathwaySchema = z.string().min(1);
export type Pathway = z.infer<typeof pathwaySchema>;

/** What should happen next, from the hospital's point of view. */
export const NEXT_STEPS = ["emergency", "schedule", "self-care"] as const;
export const nextStepSchema = z.enum(NEXT_STEPS);
export type NextStep = z.infer<typeof nextStepSchema>;

/** Consultation types the hospital's scheduling system supports by default. */
export const CONSULTATION_TYPES = [
  "emergency-assessment",
  "first-appointment",
  "check-up",
  "cardiography",
  "lung-function-test",
  "gastroscopy",
] as const;
/** @deprecated Prefer instance instruction names; kept as default seed/fallback catalog. */
export const consultationTypeSchema = z.string().min(1);
export type ConsultationType = z.infer<typeof consultationTypeSchema>;

/**
 * The clinical outcome of a triage, as produced by the agent.
 */
export const triageResultSchema = z.object({
  urgency: urgencySchema,
  pathway: pathwaySchema.describe(
    "The single most likely care pathway for the patient. Must match a pathway name from the active care instance.",
  ),
  next: nextStepSchema,
  consultationType: consultationTypeSchema.describe(
    "The consultation type to schedule or hand off. Must match a consultation type from the active care instance.",
  ),
  summary: z
    .string()
    .describe(
      "One or two sentences summarising the patient's reported symptoms, in clinical but plain language.",
    ),
  patientMessage: z
    .string()
    .describe(
      "What to tell the patient: an empathetic explanation of the outcome and concrete next steps. Never a diagnosis.",
    ),
  redFlags: z
    .array(z.string())
    .describe(
      "Warning signs the patient reported that drove the urgency decision. Empty if none.",
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("How confident the assessment is, from 0 to 1."),
});
export type TriageResult = z.infer<typeof triageResultSchema>;

/**
 * One turn of the triage conversation, as the MODEL produces it.
 *
 * Deliberately flat: not every provider honours `oneOf`/discriminated unions
 * in structured output (Gemini, for one, silently drops the discriminator).
 * A single object with nullable branches works everywhere. Use
 * `toTriageTurn()` to narrow it into the typed union below.
 */
export const triageTurnOutputSchema = z.object({
  type: z
    .enum(["question", "result"])
    .describe(
      '"question" when you need one more piece of information, "result" when you can decide.',
    ),
  question: z
    .string()
    .nullable()
    .describe(
      'When type is "question": a single, clear follow-up question for the patient. Otherwise null.',
    ),
  rationale: z
    .string()
    .nullable()
    .describe(
      'When type is "question": why this question matters for the triage decision (for logging, not shown to the patient). Otherwise null.',
    ),
  result: triageResultSchema
    .nullable()
    .describe('When type is "result": the triage outcome. Otherwise null.'),
});
export type TriageTurnOutput = z.infer<typeof triageTurnOutputSchema>;

/** One turn of the triage conversation, narrowed for application code. */
export type TriageTurn =
  | { type: "question"; question: string; rationale: string }
  | { type: "result"; result: TriageResult };

/**
 * Narrows the model's flat output into a TriageTurn, rejecting inconsistent
 * combinations (e.g. type "question" without a question).
 */
export function toTriageTurn(output: TriageTurnOutput): TriageTurn {
  if (output.type === "question") {
    if (!output.question?.trim()) {
      throw new Error('Triage turn of type "question" has no question.');
    }
    return {
      type: "question",
      question: output.question.trim(),
      rationale: output.rationale ?? "",
    };
  }
  if (!output.result) {
    throw new Error('Triage turn of type "result" has no result.');
  }
  return { type: "result", result: output.result };
}

/**
 * The payload a hospital system (scheduling / contact center / EHR) consumes.
 * This is the persisted, referenceable version of a TriageResult.
 */
export const triageOutputSchema = triageResultSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
});
export type TriageOutput = z.infer<typeof triageOutputSchema>;
