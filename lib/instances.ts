import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "@/lib/db";
import {
  DEFAULT_CONSULTATION_INSTRUCTIONS,
  DEFAULT_PATHWAY_INSTRUCTIONS,
} from "@/lib/pathways";

export type Instance = {
  id: string;
  name: string;
  generalInfo: string;
  active: boolean;
  createdAt: string;
};

type InstanceRow = {
  id: string;
  name: string;
  general_info: string | null;
  is_active: number | null;
  created_at: string;
};

function mapRow(row: InstanceRow): Instance {
  return {
    id: String(row.id),
    name: String(row.name),
    generalInfo: String(row.general_info ?? ""),
    active: Number(row.is_active ?? 1) === 1,
    createdAt: String(row.created_at),
  };
}

export type ListInstancesOptions = {
  /** When true, include deactivated instances (admin). Default: active only. */
  includeInactive?: boolean;
};

export async function listInstances(
  options: ListInstancesOptions = {},
): Promise<Instance[]> {
  await ensureSchema();
  const rs = options.includeInactive
    ? await db.execute(
        `SELECT id, name, general_info, is_active, created_at
         FROM instances ORDER BY name ASC`,
      )
    : await db.execute(
        `SELECT id, name, general_info, is_active, created_at
         FROM instances WHERE is_active = 1 ORDER BY name ASC`,
      );
  return rs.rows.map((row) => mapRow(row as unknown as InstanceRow));
}

export async function instanceExists(instanceId: string): Promise<boolean> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT id FROM instances WHERE id = ?`,
    args: [instanceId],
  });
  return rs.rows.length > 0;
}

export async function getInstance(instanceId: string): Promise<Instance | null> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `SELECT id, name, general_info, is_active, created_at FROM instances WHERE id = ?`,
    args: [instanceId],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return mapRow(row as unknown as InstanceRow);
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `instance-${randomUUID().slice(0, 6)}`;
}

async function seedDefaultInstructions(instanceId: string) {
  const now = new Date().toISOString();
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
      sql: `INSERT OR IGNORE INTO instructions
        (id, instance_id, type, name, description, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `${instanceId}-${item.id}`,
        instanceId,
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

export async function createInstance(name: string): Promise<Instance> {
  await ensureSchema();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Instance name is required.");

  let id = slugify(trimmed);
  const existing = await getInstance(id);
  if (existing) id = `${id}-${randomUUID().slice(0, 4)}`;

  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO instances (id, name, general_info, is_active, created_at)
          VALUES (?, ?, '', 1, ?)`,
    args: [id, trimmed, now],
  });
  await seedDefaultInstructions(id);

  return {
    id,
    name: trimmed,
    generalInfo: "",
    active: true,
    createdAt: now,
  };
}

export async function updateInstance(
  instanceId: string,
  patch: { name?: string; generalInfo?: string; active?: boolean },
): Promise<Instance | null> {
  await ensureSchema();
  const existing = await getInstance(instanceId);
  if (!existing) return null;

  const name =
    patch.name !== undefined ? patch.name.trim() : existing.name;
  if (!name) throw new Error("Instance name is required.");

  const generalInfo =
    patch.generalInfo !== undefined ? patch.generalInfo : existing.generalInfo;
  const active = patch.active !== undefined ? patch.active : existing.active;

  await db.execute({
    sql: `UPDATE instances
          SET name = ?, general_info = ?, is_active = ?
          WHERE id = ?`,
    args: [name, generalInfo, active ? 1 : 0, instanceId],
  });

  return { ...existing, name, generalInfo, active };
}

export async function updateInstanceGeneralInfo(
  instanceId: string,
  generalInfo: string,
): Promise<Instance | null> {
  return updateInstance(instanceId, { generalInfo });
}
