import { db } from "@/lib/db";

export async function boardIfOwnedBy(boardId: string, userId: string) {
  const board = await db.board.findUnique({ where: { id: boardId } });
  if (!board || board.ownerId !== userId) return null;
  return board;
}

export async function boardFromTaskId(taskId: string) {
  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { column: { select: { boardId: true } } },
  });
  return task?.column.boardId ?? null;
}
