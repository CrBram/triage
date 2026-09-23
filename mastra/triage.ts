import { mastra } from "./index";
import {
  buildTriageInstructions,
  resolveChosenInstanceId,
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
): Promise<TriageTurn> {
  const agent = mastra.getAgent("triageAgent");
  const instructions = await buildTriageInstructions();

  const response = await agent.generate(messages, {
    instructions,
    structuredOutput: {
      schema: triageTurnOutputSchema,
      jsonPromptInjection: "auto",
    },
  });

  const turn = toTriageTurn(triageTurnOutputSchema.parse(response.object));

  if (turn.type === "result") {
    const instanceId = await resolveChosenInstanceId(turn.result.instanceId);
    return {
      type: "result",
      result: { ...turn.result, instanceId },
    };
  }

  return turn;
}
