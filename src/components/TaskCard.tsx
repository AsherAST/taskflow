"use client";

import { useState } from "react";
import type { BoardTask } from "@/components/KanbanBoard";
import type { DropIndicator } from "@/components/ColumnView";

export default function TaskCard({
  task,
  index,
  columnId,
  dragTaskId,
  dropIndicator,
  onDragStart,
  onDragEnd,
  onDragOverTask,
  onDropTask,
  onUpdateTask,
  onDeleteTask,
}: {
  task: BoardTask;
  index: number;
  columnId: string;
  dragTaskId: string | null;
  dropIndicator: DropIndicator | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOverTask: (taskId: string, position: "top" | "bottom") => void;
  onDropTask: (columnId: string, index: number) => void;
  onUpdateTask: (taskId: string, title: string, description?: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  const isTopDrop =
    dropIndicator?.taskId === task.id && dropIndicator.position === "top";
  const isBottomDrop =
    dropIndicator?.taskId === task.id && dropIndicator.position === "bottom";
  const isDragging = dragTaskId === task.id;

  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
    onDragStart(task.id);
  }

  function handleDragOver(event: React.DragEvent) {
    if (!dragTaskId) return;
    event.preventDefault();
    if (dragTaskId === task.id) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
    onDragOverTask(task.id, position);
  }

  function handleDrop(event: React.DragEvent) {
    if (!dragTaskId) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const position =
      event.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
    onDropTask(columnId, index + (position === "bottom" ? 1 : 0));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUpdateTask(task.id, title, description);
    setEditing(false);
  }

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setConfirmingDelete(false);
    onDeleteTask(task.id);
  }

  return (
    <div>
      {isTopDrop && <DropLine />}
      <div
        data-testid="task"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`rounded-xl border bg-white p-3 shadow-sm transition dark:bg-zinc-950 ${
          isDragging
            ? "border-indigo-400 opacity-50"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={120}
              className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Descripción (opcional)"
              className="w-full resize-none rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="group">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {task.description}
              </p>
            )}
            <div className="mt-2 flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setTitle(task.title);
                  setDescription(task.description ?? "");
                }}
                className="rounded px-2 py-0.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                onMouseLeave={() => setConfirmingDelete(false)}
                className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                  confirmingDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/40"
                }`}
              >
                {confirmingDelete ? "¿Seguro?" : "Eliminar"}
              </button>
            </div>
          </div>
        )}
      </div>
      {isBottomDrop && <DropLine />}
    </div>
  );
}

function DropLine() {
  return <div className="my-1 h-0.5 rounded-full bg-indigo-500" />;
}
