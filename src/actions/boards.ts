"use server";

import { revalidatePath } from "next/cache";
import { boardSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { boardIfOwnedBy } from "@/lib/board-access";

export type ActionResult =
  | {
      ok: true;
      boardId?: string;
      column?: { id: string; title: string };
      task?: { id: string; title: string; description: string | null };
    }
  | { ok: false; error: string };

export async function createBoard(input: {
  title: string;
}): Promise<ActionResult> {
  const parsed = boardSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const board = await db.board.create({
    data: { title: parsed.data.title, ownerId: userId },
  });

  revalidatePath("/boards");
  return { ok: true, boardId: board.id };
}

export async function deleteBoard(input: {
  boardId: string;
}): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const board = await boardIfOwnedBy(input.boardId, userId);
  if (!board) return { ok: false, error: "Tablero no encontrado" };

  await db.board.delete({ where: { id: board.id } });
  revalidatePath("/boards");
  return { ok: true };
}
