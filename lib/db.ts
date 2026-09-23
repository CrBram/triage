import { createClient } from "@libsql/client";
import { SEED_INSTANCES } from "@/lib/instance";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
} from "@/lib/pathways";

export const db = createClient({
  url: process.env.DATABASE_URL ?? "file:./triage.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

let ready: Promise<void> | null = null;

/** Ensure schema exists and default instances are seeded. */
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS instances (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          general_info TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        )
      `);

      await ensureInstanceColumns();

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

      await db.execute(`PRAGMA foreign_keys = ON`);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS triage_sessions (
          id TEXT PRIMARY KEY,
          instance_id TEXT,
          created_at TEXT NOT NULL,
          data TEXT NOT NULL
        )
      `);

      await ensureSessionColumns();

      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_triage_sessions_instance
        ON triage_sessions(instance_id, created_at)
      `);

      await seedInstances();
    })();
  }
  return ready;
}

async function ensureInstanceColumns() {
  const cols = await db.execute(`PRAGMA table_info(instances)`);
  const names = new Set(cols.rows.map((row) => String(row.name)));
  if (!names.has("general_info")) {
    await db.execute(
      `ALTER TABLE instances ADD COLUMN general_info TEXT NOT NULL DEFAULT ''`,
    );
  }
}

async function ensureSessionColumns() {
  const cols = await db.execute(`PRAGMA table_info(triage_sessions)`);
  const names = new Set(cols.rows.map((row) => String(row.name)));
  if (!names.has("instance_id")) {
    await db.execute(`ALTER TABLE triage_sessions ADD COLUMN instance_id TEXT`);
  }
  await db.execute({
    sql: `UPDATE triage_sessions
          SET instance_id = ?
          WHERE instance_id IS NULL OR instance_id = ''`,
    args: [SEED_INSTANCES[0].id],
  });
}

async function seedInstances() {
  const now = new Date().toISOString();

  for (const instance of SEED_INSTANCES) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO instances (id, name, general_info, created_at)
            VALUES (?, ?, ?, ?)`,
      args: [instance.id, instance.name, instance.generalInfo, now],
    });

    // Keep seeded general_info fresh for demo instances that already exist
    // with an empty general_info from older seeds.
    await db.execute({
      sql: `UPDATE instances
            SET general_info = ?
            WHERE id = ? AND (general_info IS NULL OR general_info = '')`,
      args: [instance.generalInfo, instance.id],
    });

    const existing = await db.execute({
      sql: `SELECT COUNT(*) AS count FROM instructions WHERE instance_id = ?`,
      args: [instance.id],
    });
    if (Number(existing.rows[0]?.count ?? 0) > 0) continue;

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
          `${instance.id}-${item.id}`,
          instance.id,
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
}
