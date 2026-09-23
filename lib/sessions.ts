import { randomUUID } from "node:crypto";
import type { TriageResult } from "@/mastra/schemas/triage";
import { db, ensureSchema } from "@/lib/db";

/** Save a finished triage result. Returns the session id. */
export async function saveSession(result: TriageResult): Promise<string> {
  await ensureSchema();
  const id = `trg-${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO triage_sessions (id, created_at, data) VALUES (?, ?, ?)`,
    args: [id, createdAt, JSON.stringify({ id, createdAt, ...result })],
  });
  return id;
}

export type TriageSession = { id: string; createdAt: string } & TriageResult;

/** Load a saved triage session by id. */
export async function getSession(id: string): Promise<TriageSession | null> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT data FROM triage_sessions WHERE id = ?`,
    args: [id],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return JSON.parse(String(row.data)) as TriageSession;
}

/** List all saved triage sessions, newest first. */
export async function listSessions(): Promise<TriageSession[]> {
  await ensureSchema();
  const rs = await db.execute(
    `SELECT data FROM triage_sessions ORDER BY created_at DESC`,
  );
  return rs.rows.map((row) => JSON.parse(String(row.data)) as TriageSession);
}
