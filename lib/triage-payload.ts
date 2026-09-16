import { triageResultSchema, type TriageResult } from "@/mastra/schemas/triage";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(payload: string): Uint8Array {
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

export function encodeTriagePayload(result: TriageResult): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(result)));
}

export function decodeTriagePayload(payload: string): TriageResult | null {
  try {
    const json = new TextDecoder().decode(fromBase64Url(payload));
    return triageResultSchema.parse(JSON.parse(json));
  } catch {
    return null;
  }
}

export function careHref(result: TriageResult): string {
  return `/care?payload=${encodeTriagePayload(result)}`;
}
