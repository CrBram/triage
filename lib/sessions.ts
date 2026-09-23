import { randomUUID } from "node:crypto";
import type { TriageResult } from "@/mastra/schemas/triage";
import { db, ensureSchema } from "@/lib/db";
import { DEFAULT_INSTANCE_ID } from "@/lib/instance";

export type TriageSession = {
  id: string;
  createdAt: string;
  instanceId: string;
} & TriageResult;

/** Save a finished triage result. Returns the session id. */
export async function saveSession(result: TriageResult): Promise<string> {
  await ensureSchema();
  const id = `trg-${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const instanceId = result.instanceId || DEFAULT_INSTANCE_ID;
  await db.execute({
    sql: `INSERT INTO triage_sessions (id, instance_id, created_at, data)
          VALUES (?, ?, ?, ?)`,
    args: [
      id,
      instanceId,
      createdAt,
      JSON.stringify({ ...result, id, createdAt, instanceId }),
    ],
  });
  return id;
}

/** Load a saved triage session by id. */
export async function getSession(id: string): Promise<TriageSession | null> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT instance_id, data FROM triage_sessions WHERE id = ?`,
    args: [id],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return parseSession(row as unknown as SessionRow);
}

/** List saved triage sessions, newest first. Optionally filter by instance. */
export async function listSessions(
  instanceId?: string,
): Promise<TriageSession[]> {
  await ensureSchema();
  const rs = instanceId
    ? await db.execute({
        sql: `SELECT instance_id, data FROM triage_sessions
              WHERE instance_id = ?
              ORDER BY created_at DESC`,
        args: [instanceId],
      })
    : await db.execute(
        `SELECT instance_id, data FROM triage_sessions ORDER BY created_at DESC`,
      );
  return rs.rows.map((row) => parseSession(row as unknown as SessionRow));
}

type SessionRow = {
  instance_id?: unknown;
  data: unknown;
};

function parseSession(row: SessionRow): TriageSession {
  const parsed = JSON.parse(String(row.data)) as TriageSession;
  const instanceId =
    parsed.instanceId ||
    (row.instance_id ? String(row.instance_id) : DEFAULT_INSTANCE_ID);
  return { ...parsed, instanceId };
}
