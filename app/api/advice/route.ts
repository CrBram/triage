import { NextResponse } from "next/server";
import { z } from "zod";
import { runAdviceTurn } from "@/mastra/advice";
import { triageResultSchema } from "@/mastra/schemas/triage";

const requestSchema = z.object({
  assessment: triageResultSchema.pick({
    urgency: true,
    pathway: true,
    next: true,
    summary: true,
    patientMessage: true,
    redFlags: true,
  }),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const output = await runAdviceTurn(
      parsed.data.assessment,
      parsed.data.messages,
    );
    return NextResponse.json(output);
  } catch (error) {
    console.error("[api/advice] advice turn failed", error);

    if (isUpstreamOverloaded(error)) {
      return NextResponse.json(
        {
          error:
            "The assistant is busy right now. Please wait a moment and try again.",
        },
        { status: 503, headers: { "Retry-After": "10" } },
      );
    }

    return NextResponse.json(
      {
        error: "We couldn't answer that right now. Please try again.",
      },
      { status: 502 },
    );
  }
}

function isUpstreamOverloaded(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const status = (error as { statusCode?: unknown }).statusCode;
  return status === 429 || status === 503;
}
