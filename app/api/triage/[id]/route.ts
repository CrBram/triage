import { NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params;
  const session = await getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json(session);
}
