import { NextResponse } from "next/server";
import { z } from "zod";
import { getInstance, updateInstance } from "@/lib/instances";

type Context = { params: Promise<{ instanceId: string }> };

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    generalInfo: z.string().max(20000).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (body) =>
      body.name !== undefined ||
      body.generalInfo !== undefined ||
      body.active !== undefined,
    { message: "Provide at least one field to update." },
  );

export async function GET(_req: Request, { params }: Context) {
  const { instanceId } = await params;
  const instance = await getInstance(instanceId);
  if (!instance) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }
  return NextResponse.json(instance);
}

export async function PATCH(req: Request, { params }: Context) {
  const { instanceId } = await params;

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

  try {
    const instance = await updateInstance(instanceId, parsed.data);
    if (!instance) {
      return NextResponse.json(
        { error: "Instance not found." },
        { status: 404 },
      );
    }
    return NextResponse.json(instance);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update instance.",
      },
      { status: 400 },
    );
  }
}
