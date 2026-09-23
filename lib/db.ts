import { createClient } from "@libsql/client";
import { CURRENT_INSTANCE } from "@/lib/instance";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
} from "@/lib/pathways";

export const db = createClient({
  url: process.env.DATABASE_URL ?? "file:./triage.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

let ready: Promise<void> | null = null;

/** Ensure schema exists and the default instance is seeded. */
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS instances (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS instructions (
          id TEXT PRIMARY KEY,
          instance_id TEXT NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('pathway', 'consultation')),
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `);

      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_instructions_instance_type
        ON instructions(instance_id, type, sort_order)
      `);

      // SQLite/libsql: FK enforcement is off unless enabled per connection.
      await db.execute(`PRAGMA foreign_keys = ON`);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS triage_sessions (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          data TEXT NOT NULL
        )
      `);

      await seedDefaultInstance();
    })();
  }
  return ready;
}

async function seedDefaultInstance() {
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT OR IGNORE INTO instances (id, name, created_at) VALUES (?, ?, ?)`,
    args: [CURRENT_INSTANCE.id, CURRENT_INSTANCE.name, now],
  });

  const existing = await db.execute({
    sql: `SELECT COUNT(*) AS count FROM instructions WHERE instance_id = ?`,
    args: [CURRENT_INSTANCE.id],
  });
  const count = Number(existing.rows[0]?.count ?? 0);
  if (count > 0) return;

  const defaults = [
    ...DEFAULT_PATHWAY_INSTRUCTIONS.map((item, index) => ({
      ...item,
      type: "pathway" as const,
      sortOrder: index,
    })),
    ...DEFAULT_CONSULTATION_INSTRUCTIONS.map((item, index) => ({
      ...item,
      type: "consultation" as const,
      sortOrder: index,
    })),
  ];

  for (const item of defaults) {
    await db.execute({
      sql: `INSERT INTO instructions
        (id, instance_id, type, name, description, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `${CURRENT_INSTANCE.id}-${item.id}`,
        CURRENT_INSTANCE.id,
        item.type,
        item.name,
        item.description,
        item.sortOrder,
        now,
        now,
      ],
    });
  }
}
