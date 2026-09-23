import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, updateSession } from "@/lib/sessions";

type Context = { params: Promise<{ id: string }> };

const updateSchema = z
  .object({
    phoneNumber: z.string().trim().min(6).max(40).nullable().optional(),
    resolved: z.boolean().optional(),
  })
  .refine(
    (body) => body.phoneNumber !== undefined || body.resolved !== undefined,
    { message: "Provide at least one field to update." },
  );

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function PATCH(req: Request, { params }: Context) {
  const { id } = await params;

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

  const session = await updateSession(id, parsed.data);
  if (!session) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(session);
}
