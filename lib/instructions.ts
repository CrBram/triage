import { randomUUID } from "node:crypto";
import { db, ensureSchema } from "@/lib/db";
import { instanceExists } from "@/lib/instances";

export { instanceExists };
export type InstructionType = "pathway" | "consultation";

export type Instruction = {
  id: string;
  instanceId: string;
  type: InstructionType;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type InstructionRow = {
  id: string;
  instance_id: string;
  type: string;
  name: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function mapRow(row: InstructionRow): Instruction {
  return {
    id: String(row.id),
    instanceId: String(row.instance_id),
    type: row.type as InstructionType,
    name: String(row.name),
    description: String(row.description),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listInstructions(
  instanceId: string,
  type?: InstructionType,
): Promise<Instruction[]> {
  await ensureSchema();

  const rs = type
    ? await db.execute({
        sql: `SELECT * FROM instructions
              WHERE instance_id = ? AND type = ?
              ORDER BY sort_order ASC, created_at ASC`,
        args: [instanceId, type],
      })
    : await db.execute({
        sql: `SELECT * FROM instructions
              WHERE instance_id = ?
              ORDER BY type ASC, sort_order ASC, created_at ASC`,
        args: [instanceId],
      });

  return rs.rows.map((row) => mapRow(row as unknown as InstructionRow));
}

export async function getInstruction(
  id: string,
  instanceId?: string,
): Promise<Instruction | null> {
  await ensureSchema();

  const rs = instanceId
    ? await db.execute({
        sql: `SELECT * FROM instructions WHERE id = ? AND instance_id = ?`,
        args: [id, instanceId],
      })
    : await db.execute({
        sql: `SELECT * FROM instructions WHERE id = ?`,
        args: [id],
      });

  const row = rs.rows[0];
  if (!row) return null;
  return mapRow(row as unknown as InstructionRow);
}

export async function createInstruction(input: {
  instanceId: string;
  type: InstructionType;
  name?: string;
  description?: string;
}): Promise<Instruction> {
  await ensureSchema();

  const exists = await instanceExists(input.instanceId);
  if (!exists) {
    throw new Error(`Instance not found: ${input.instanceId}`);
  }

  const maxOrder = await db.execute({
    sql: `SELECT COALESCE(MAX(sort_order), -1) AS max_order
          FROM instructions WHERE instance_id = ? AND type = ?`,
    args: [input.instanceId, input.type],
  });
  const sortOrder = Number(maxOrder.rows[0]?.max_order ?? -1) + 1;

  const now = new Date().toISOString();
  const id = `ins-${randomUUID().slice(0, 8)}`;
  const name = input.name?.trim() ?? "";
  const description = input.description?.trim() ?? "";

  await db.execute({
    sql: `INSERT INTO instructions
      (id, instance_id, type, name, description, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.instanceId,
      input.type,
      name,
      description,
      sortOrder,
      now,
      now,
    ],
  });

  return {
    id,
    instanceId: input.instanceId,
    type: input.type,
    name,
    description,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateInstruction(
  id: string,
  input: {
    instanceId: string;
    name?: string;
    description?: string;
    sortOrder?: number;
  },
): Promise<Instruction | null> {
  await ensureSchema();

  const existing = await getInstruction(id, input.instanceId);
  if (!existing) return null;

  const name = input.name !== undefined ? input.name.trim() : existing.name;
  const description =
    input.description !== undefined
      ? input.description.trim()
      : existing.description;
  const sortOrder =
    input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder;
  const updatedAt = new Date().toISOString();

  await db.execute({
    sql: `UPDATE instructions
          SET name = ?, description = ?, sort_order = ?, updated_at = ?
          WHERE id = ? AND instance_id = ?`,
    args: [name, description, sortOrder, updatedAt, id, input.instanceId],
  });

  return {
    ...existing,
    name,
    description,
    sortOrder,
    updatedAt,
  };
}

export async function deleteInstruction(
  id: string,
  instanceId: string,
): Promise<boolean> {
  await ensureSchema();
  const rs = await db.execute({
    sql: `DELETE FROM instructions WHERE id = ? AND instance_id = ?`,
    args: [id, instanceId],
  });
  return (rs.rowsAffected ?? 0) > 0;
}
