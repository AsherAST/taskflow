"use server";

import { revalidatePath } from "next/cache";
import { columnSchema } from "@/lib/validators";
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
