import { Agent } from "@mastra/core/agent";
import { TRIAGE_MODEL_CHAIN } from "./triage-agent";

/**
 * Post-assessment follow-up advice. Conservative self-care answers only;
 * never revises triage outcomes. Per-request instructions include the
 * locked assessment context.
 */
export const adviceAgent = new Agent({
  id: "advice-agent",
  name: "Advice Agent",
  description:
    "Answers simple post-triage questions (e.g. water, rest, basic OTC pain relief) with conservative, safety-first guidance.",
  instructions:
    "You are a careful aftercare assistant. Wait for per-request assessment context and answer conservatively.",
  model: TRIAGE_MODEL_CHAIN.map((model, index) => ({
    model,
    maxRetries: index === 0 ? 2 : 1,
  })),
});
