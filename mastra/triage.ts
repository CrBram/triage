import { mastra } from "./index";
import {
  buildTriageInstructions,
  resolveTriageInstanceId,
} from "./prompts/instance-instructions";
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
  options?: { instanceId?: string },
): Promise<TriageTurn> {
  const agent = mastra.getAgent("triageAgent");
  const instanceId = options?.instanceId ?? (await resolveTriageInstanceId());
  const instructions = await buildTriageInstructions(instanceId);

  const response = await agent.generate(messages, {
    instructions,
    structuredOutput: {
      schema: triageTurnOutputSchema,
      jsonPromptInjection: "auto",
    },
  });

  return toTriageTurn(triageTurnOutputSchema.parse(response.object));
}
