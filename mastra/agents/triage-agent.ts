import { Agent } from "@mastra/core/agent";
import {
  buildBaseInstructions,
  MAX_FOLLOW_UP_QUESTIONS,
} from "../prompts/base-instructions";

export { MAX_FOLLOW_UP_QUESTIONS };

/**
 * Primary model in Mastra's `provider/model` router format. Credentials are
 * read from the provider's env var (GOOGLE_API_KEY, OPENAI_API_KEY, ...).
 */
export const TRIAGE_MODEL =
  process.env.TRIAGE_MODEL ?? "google/gemini-3.1-flash-lite";

/**
 * Ordered fallbacks, tried when the primary model returns a 5xx, a rate limit
 * or times out. Comma-separated in TRIAGE_FALLBACK_MODELS. Each Gemini model
 * has its own free-tier quota bucket, so spreading across models also helps
 * with quota.
 */
export const TRIAGE_FALLBACK_MODELS = (
  process.env.TRIAGE_FALLBACK_MODELS ??
  "google/gemini-3.5-flash-lite,google/gemini-3-flash-preview"
)
  .split(",")
  .map((m) => m.trim())
  .filter((m) => m.length > 0 && m !== TRIAGE_MODEL);

/** Full chain: primary first, then fallbacks. Used by the agent and for logging. */
export const TRIAGE_MODEL_CHAIN = [TRIAGE_MODEL, ...TRIAGE_FALLBACK_MODELS];

/**
 * Static base instructions used when no per-request override is supplied.
 * Runtime triage turns inject the active instance overlay via
 * `buildTriageInstructions()`.
 */
export const triageAgent = new Agent({
  id: "triage-agent",
  name: "Triage Agent",
  description:
    "Guides a patient from a free-text symptom description to an urgency level, care pathway and consultation type, asking one follow-up question at a time.",
  instructions: buildBaseInstructions(),
  model: TRIAGE_MODEL_CHAIN.map((model, index) => ({
    model,
    maxRetries: index === 0 ? 2 : 1,
  })),
});
