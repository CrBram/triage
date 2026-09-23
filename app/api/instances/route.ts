import { NextResponse } from "next/server";
import { listInstances } from "@/lib/instances";

export async function GET() {
  const instances = await listInstances();
  return NextResponse.json(instances);
}
