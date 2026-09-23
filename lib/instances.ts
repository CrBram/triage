import { db, ensureSchema } from "@/lib/db";

export type Instance = {
  id: string;
  name: string;
  generalInfo: string;
  createdAt: string;
};

type InstanceRow = {
  id: string;
  name: string;
  general_info: string | null;
  created_at: string;
};

function mapRow(row: InstanceRow): Instance {
  return {
    id: String(row.id),
    name: String(row.name),
    generalInfo: String(row.general_info ?? ""),
    createdAt: String(row.created_at),
  };
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
    sql: `SELECT id, name, general_info, created_at FROM instances WHERE id = ?`,
    args: [instanceId],
  });
  const row = rs.rows[0];
  if (!row) return null;
  return mapRow(row as unknown as InstanceRow);
}

export async function updateInstanceGeneralInfo(
  instanceId: string,
  generalInfo: string,
): Promise<Instance | null> {
  await ensureSchema();
  const existing = await getInstance(instanceId);
  if (!existing) return null;

  await db.execute({
    sql: `UPDATE instances SET general_info = ? WHERE id = ?`,
    args: [generalInfo, instanceId],
  });

  return { ...existing, generalInfo };
}
