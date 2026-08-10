"use server";

import { revalidatePath } from "next/cache";
import {
  columnSchema,
  updateColumnSchema,
  moveColumnSchema,
} from "@/lib/validators";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { boardIfOwnedBy } from "@/lib/board-access";
import type { ActionResult } from "@/actions/boards";

export async function createColumn(input: {
  title: string;
  boardId: string;
}): Promise<ActionResult> {
  const parsed = columnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const board = await boardIfOwnedBy(parsed.data.boardId, userId);
  if (!board) return { ok: false, error: "Tablero no encontrado" };

  const count = await db.column.count({ where: { boardId: board.id } });
  const column = await db.column.create({
    data: { title: parsed.data.title, boardId: board.id, position: count },
  });

  revalidatePath(`/boards/${board.id}`);
  return { ok: true, column: { id: column.id, title: column.title } };
}

export async function updateColumn(input: {
  columnId: string;
  title: string;
}): Promise<ActionResult> {
  const parsed = updateColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const column = await db.column.findUnique({
    where: { id: parsed.data.columnId },
    include: { board: { select: { ownerId: true } } },
  });
  if (!column || column.board.ownerId !== userId) {
    return { ok: false, error: "Columna no encontrada" };
  }

  const updated = await db.column.update({
    where: { id: column.id },
    data: { title: parsed.data.title },
  });

  revalidatePath(`/boards/${column.boardId}`);
  return { ok: true, column: { id: updated.id, title: updated.title } };
}

export async function deleteColumn(input: {
  columnId: string;
}): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const column = await db.column.findUnique({
    where: { id: input.columnId },
    include: { board: { select: { ownerId: true } } },
  });
  if (!column || column.board.ownerId !== userId) {
    return { ok: false, error: "Columna no encontrada" };
  }

  await db.column.delete({ where: { id: column.id } });
  revalidatePath(`/boards/${column.boardId}`);
  return { ok: true };
}

export async function moveColumn(input: {
  columnId: string;
  boardId: string;
  position: number;
}): Promise<ActionResult> {
  const parsed = moveColumnSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const { columnId, boardId, position } = parsed.data;

  const board = await boardIfOwnedBy(boardId, userId);
  if (!board) return { ok: false, error: "Tablero no encontrado" };

  const column = await db.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  if (!column || column.boardId !== boardId) {
    return { ok: false, error: "Columna inválida" };
  }

  const boardColumns = await db.column.findMany({
    where: { boardId },
    orderBy: { position: "asc" },
  });
  const pos = Math.max(0, Math.min(position, boardColumns.length - 1));

  await db.$transaction(async (tx) => {
    const order = boardColumns.map((c) => c.id).filter((id) => id !== columnId);
    order.splice(pos, 0, columnId);
    for (let i = 0; i < order.length; i++) {
      if (order[i] !== boardColumns[i]?.id) {
        await tx.column.update({
          where: { id: order[i] },
          data: { position: i },
        });
      }
    }
  });

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
