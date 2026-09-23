import { z } from "zod";
import type { TriageResult } from "./schemas/triage";
import { mastra } from "./index";
import { buildAdviceInstructions } from "./prompts/advice-instructions";

export type AdviceMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export const adviceOutputSchema = z.object({
  reply: z
    .string()
    .min(1)
    .describe(
      "Short, cautious answer for the patient. Does not change the triage assessment.",
    ),
});

export type AdviceOutput = z.infer<typeof adviceOutputSchema>;

export async function runAdviceTurn(
  assessment: Pick<
    TriageResult,
    | "urgency"
    | "pathway"
    | "next"
    | "summary"
    | "patientMessage"
    | "redFlags"
  >,
  messages: AdviceMessage[],
): Promise<AdviceOutput> {
  const agent = mastra.getAgent("adviceAgent");
  const instructions = buildAdviceInstructions(assessment);

  const response = await agent.generate(messages, {
    instructions,
    structuredOutput: {
      schema: adviceOutputSchema,
      jsonPromptInjection: "auto",
    },
  });

  return adviceOutputSchema.parse(response.object);
}
