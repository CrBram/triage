import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";
import type { TriageResult } from "@/mastra/schemas/triage";

const db = createClient({
  url: process.env.DATABASE_URL ?? "file:./triage.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

let ready: Promise<void> | null = null;

function ensureTable() {
  if (!ready) {
    ready = db
      .execute(
        `CREATE TABLE IF NOT EXISTS triage_sessions (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          data TEXT NOT NULL
        )`,
      )
      .then(() => undefined);
  }
  return ready;
}

/** Save a finished triage result. Returns the session id. */
export async function saveSession(result: TriageResult): Promise<string> {
  await ensureTable();
  const id = `trg-${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO triage_sessions (id, created_at, data) VALUES (?, ?, ?)`,
    args: [id, createdAt, JSON.stringify({ id, createdAt, ...result })],
  });
  return id;
}

/** Load a saved triage session by id. */
export async function getSession(id: string) {
  await ensureTable();
  const rs = await db.execute({
    sql: `SELECT data FROM triage_sessions WHERE id = ?`,
    args: [id],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return JSON.parse(String(row.data)) as { id: string; createdAt: string } & TriageResult;
}
