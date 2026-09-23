import { NextResponse } from "next/server";
import { z } from "zod";
import { createInstance, listInstances } from "@/lib/instances";

const createSchema = z.object({
  name: z.string().trim().min(1).max(200),
});

export async function GET(req: Request) {
  const includeInactive =
    new URL(req.url).searchParams.get("includeInactive") === "1";
  const instances = await listInstances({ includeInactive });
  return NextResponse.json(instances);
}

export async function POST(req: Request) {
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

  try {
    const instance = await createInstance(parsed.data.name);
    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create instance.",
      },
      { status: 400 },
    );
  }
}
