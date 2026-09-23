import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInstruction,
  instanceExists,
  listInstructions,
} from "@/lib/instructions";

type Context = { params: Promise<{ instanceId: string }> };

const createSchema = z.object({
  type: z.enum(["pathway", "consultation"]),
  name: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
});

export async function GET(req: Request, { params }: Context) {
  const { instanceId } = await params;

  if (!(await instanceExists(instanceId))) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }

  const typeParam = new URL(req.url).searchParams.get("type");
  const type =
    typeParam === "pathway" || typeParam === "consultation"
      ? typeParam
      : undefined;

  if (typeParam && !type) {
    return NextResponse.json(
      { error: 'Invalid type. Use "pathway" or "consultation".' },
      { status: 400 },
    );
  }

  const instructions = await listInstructions(instanceId, type);
  return NextResponse.json(instructions);
}

export async function POST(req: Request, { params }: Context) {
  const { instanceId } = await params;

  if (!(await instanceExists(instanceId))) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const instruction = await createInstruction({
    instanceId,
    ...parsed.data,
  });
  return NextResponse.json(instruction, { status: 201 });
}
