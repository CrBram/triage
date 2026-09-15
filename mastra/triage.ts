import { mastra } from "./index";
import {
  toTriageTurn,
  triageTurnOutputSchema,
  type TriageTurn,
} from "./schemas/triage";

export type TriageMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string };

export async function runTriageTurn(
  messages: TriageMessage[],
): Promise<TriageTurn> {
  const agent = mastra.getAgent("triageAgent");

  const response = await agent.generate(messages, {
    structuredOutput: {
      schema: triageTurnOutputSchema,
      jsonPromptInjection: "auto",
    },
  });

  return toTriageTurn(triageTurnOutputSchema.parse(response.object));
}
