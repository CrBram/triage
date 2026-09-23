import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteInstruction,
  getInstruction,
  instanceExists,
  updateInstruction,
} from "@/lib/instructions";

type Context = {
  params: Promise<{ instanceId: string; id: string }>;
};

const updateSchema = z
  .object({
    name: z.string().max(200).optional(),
    description: z.string().max(4000).optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .refine(
    (body) =>
      body.name !== undefined ||
      body.description !== undefined ||
      body.sortOrder !== undefined,
    { message: "Provide at least one field to update." },
  );

export async function GET(_req: Request, { params }: Context) {
  const { instanceId, id } = await params;

  if (!(await instanceExists(instanceId))) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }

  const instruction = await getInstruction(id, instanceId);
  if (!instruction) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(instruction);
}

export async function PATCH(req: Request, { params }: Context) {
  const { instanceId, id } = await params;

  if (!(await instanceExists(instanceId))) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const instruction = await updateInstruction(id, {
    instanceId,
    ...parsed.data,
  });
  if (!instruction) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(instruction);
}

export async function DELETE(_req: Request, { params }: Context) {
  const { instanceId, id } = await params;

  if (!(await instanceExists(instanceId))) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }

  const deleted = await deleteInstruction(id, instanceId);
  if (!deleted) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
