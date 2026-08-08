"use server";

import { revalidatePath } from "next/cache";
import { taskSchema, updateTaskSchema, moveTaskSchema } from "@/lib/validators";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import type { ActionResult } from "@/actions/boards";

export async function createTask(input: {
  title: string;
  description?: string;
  columnId: string;
}): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input);
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

  const count = await db.task.count({ where: { columnId: column.id } });
  const task = await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      columnId: column.id,
      position: count,
    },
  });

  revalidatePath(`/boards/${column.boardId}`);
  return {
    ok: true,
    task: {
      id: task.id,
      title: task.title,
      description: task.description,
    },
  };
}

export async function updateTask(input: {
  taskId: string;
  title: string;
  description?: string;
}): Promise<ActionResult> {
  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const task = await db.task.findUnique({
    where: { id: parsed.data.taskId },
    include: { column: { select: { boardId: true, board: { select: { ownerId: true } } } } },
  });
  if (!task || task.column.board.ownerId !== userId) {
    return { ok: false, error: "Tarea no encontrada" };
  }

  await db.task.update({
    where: { id: task.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
    },
  });

  revalidatePath(`/boards/${task.column.boardId}`);
  return { ok: true };
}

export async function deleteTask(input: {
  taskId: string;
}): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const task = await db.task.findUnique({
    where: { id: input.taskId },
    include: { column: { select: { boardId: true, board: { select: { ownerId: true } } } } },
  });
  if (!task || task.column.board.ownerId !== userId) {
    return { ok: false, error: "Tarea no encontrada" };
  }

  await db.task.delete({ where: { id: task.id } });
  revalidatePath(`/boards/${task.column.boardId}`);
  return { ok: true };
}

export async function moveTask(input: {
  taskId: string;
  columnId: string;
  position: number;
}): Promise<ActionResult> {
  const parsed = moveTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const userId = await getSessionUserId();
  if (!userId) return { ok: false, error: "No autorizado" };

  const { taskId, columnId, position } = parsed.data;

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      columnId: true,
      column: {
        select: { boardId: true, board: { select: { ownerId: true } } },
      },
    },
  });
  if (!task || task.column.board.ownerId !== userId) {
    return { ok: false, error: "Tarea no encontrada" };
  }
  const boardId = task.column.boardId;

  const target = await db.column.findUnique({ where: { id: columnId } });
  if (!target || target.boardId !== boardId) {
    return { ok: false, error: "Columna inválida" };
  }

  const targetTasks = await db.task.findMany({
    where: { columnId },
    orderBy: { position: "asc" },
  });
  const pos = Math.max(0, Math.min(position, targetTasks.length));

  await db.$transaction(async (tx) => {
    if (task.columnId === columnId) {
      const order = targetTasks.map((t) => t.id).filter((id) => id !== taskId);
      order.splice(pos, 0, taskId);
      for (let i = 0; i < order.length; i++) {
        await tx.task.update({
          where: { id: order[i] },
          data: { position: i },
        });
      }
    } else {
      const oldColumnTasks = await tx.task.findMany({
        where: { columnId: task.columnId },
        orderBy: { position: "asc" },
      });
      const remaining = oldColumnTasks.filter((t) => t.id !== taskId);
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].position !== i) {
          await tx.task.update({
            where: { id: remaining[i].id },
            data: { position: i },
          });
        }
      }

      const shifted = targetTasks.filter((t) => t.id !== taskId);
      for (let i = pos; i < shifted.length; i++) {
        await tx.task.update({
          where: { id: shifted[i].id },
          data: { position: i + 1 },
        });
      }

      await tx.task.update({
        where: { id: taskId },
        data: { columnId, position: pos },
      });
    }
  });

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
