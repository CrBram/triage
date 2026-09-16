type Payload = Record<string, unknown>;

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

export function encodeTriagePayload(data: Payload): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

export function decodeTriagePayload(payload: string): Payload | null {
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as Payload;
  } catch {
    return null;
  }
}

export function careHref(data: Payload): string {
  return `/care?payload=${encodeTriagePayload(data)}`;
}
