import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getInstance,
  updateInstanceGeneralInfo,
} from "@/lib/instances";

type Context = { params: Promise<{ instanceId: string }> };

const updateSchema = z.object({
  generalInfo: z.string().max(20000),
});

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

  const instance = await updateInstanceGeneralInfo(
    instanceId,
    parsed.data.generalInfo,
  );
  if (!instance) {
    return NextResponse.json({ error: "Instance not found." }, { status: 404 });
  }
  return NextResponse.json(instance);
}
