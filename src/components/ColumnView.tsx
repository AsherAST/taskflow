"use client";

import { useState } from "react";
import TaskCard from "@/components/TaskCard";
import AddTaskForm from "@/components/AddTaskForm";
import type { BoardColumn } from "@/components/KanbanBoard";

export interface DropIndicator {
  taskId: string;
  position: "top" | "bottom";
}

export default function ColumnView({
  column,
  index,
  dragTaskId,
  dragOverColumnId,
  dropIndicator,
  dragColumnId,
  onDragStart,
  onDragEnd,
  onDragOverTask,
  onDragOverColumn,
  onDropTask,
  onColumnDragStart,
  onColumnDragEnd,
  onColumnDragOver,
  onColumnDrop,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateColumn,
  onDeleteColumn,
}: {
  column: BoardColumn;
  index: number;
  dragTaskId: string | null;
  dragOverColumnId: string | null;
  dropIndicator: DropIndicator | null;
  dragColumnId: string | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOverTask: (taskId: string, position: "top" | "bottom") => void;
  onDragOverColumn: (columnId: string) => void;
  onDropTask: (columnId: string, index: number) => void;
  onColumnDragStart: (columnId: string) => void;
  onColumnDragEnd: () => void;
  onColumnDragOver: (columnId: string) => void;
  onColumnDrop: (columnId: string, index: number) => void;
  onAddTask: (columnId: string, title: string) => void;
  onUpdateTask: (taskId: string, title: string, description?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  const isDragOver =
    dragTaskId !== null && dragOverColumnId === column.id;
  const isColumnDragOver =
    dragColumnId !== null &&
    dragColumnId !== column.id &&
    dragOverColumnId === column.id;
  const isDraggingColumn = dragColumnId === column.id;

  function handleColumnDragOver(event: React.DragEvent) {
    if (dragColumnId) {
      if (dragColumnId === column.id) return;
      event.preventDefault();
      onColumnDragOver(column.id);
      return;
    }
    if (!dragTaskId) return;
    event.preventDefault();
    onDragOverColumn(column.id);
  }

  function handleColumnDrop(event: React.DragEvent) {
    if (dragColumnId) {
      if (dragColumnId === column.id) return;
      event.preventDefault();
      onColumnDrop(column.id, index);
      return;
    }
    if (!dragTaskId) return;
    event.preventDefault();
    onDropTask(column.id, column.tasks.length);
  }

  function handleColumnDragStart(event: React.DragEvent) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", column.id);
    onColumnDragStart(column.id);
  }

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setConfirmingDelete(false);
    onDeleteColumn(column.id);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(column.title);
      setEditingTitle(false);
      return;
    }
    if (trimmed !== column.title) {
      onUpdateColumn(column.id, trimmed);
    }
    setEditingTitle(false);
  }

  return (
    <section
      data-testid="column"
      className={`w-72 shrink-0 rounded-2xl border p-3 transition-colors ${
        isColumnDragOver
          ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-400/20 dark:bg-indigo-950/20"
          : isDragOver
            ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-400/20 dark:bg-indigo-950/20"
            : "border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/60"
      } ${isDraggingColumn ? "opacity-50" : ""}`}
      onDragOver={handleColumnDragOver}
      onDrop={handleColumnDrop}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          draggable
          onDragStart={handleColumnDragStart}
          onDragEnd={onColumnDragEnd}
          aria-label={`Mover columna ${column.title}`}
          title="Arrastra para reordenar"
          className="cursor-grab text-zinc-400 transition hover:text-zinc-600 active:cursor-grabbing dark:hover:text-zinc-300"
        >
          ⠿
        </span>
        {editingTitle ? (
          <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-1">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={60}
              aria-label="Nombre de la columna"
              autoFocus
              className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm font-semibold text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
            <button
              type="submit"
              aria-label={`Guardar columna ${title}`}
              className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              ✓
            </button>
          </form>
        ) : (
          <h2 className="flex-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {column.title}
          </h2>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {!editingTitle && (
            <button
              type="button"
              onClick={() => {
                setTitle(column.title);
                setEditingTitle(true);
              }}
              aria-label={`Editar columna ${column.title}`}
              className="rounded-full px-2 py-0.5 text-xs font-medium text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              ✎
            </button>
          )}
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {column.tasks.length}
          </span>
          <button
            type="button"
            onClick={handleDeleteClick}
            onMouseLeave={() => setConfirmingDelete(false)}
            aria-label={`Eliminar columna ${column.title}`}
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
              confirmingDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            }`}
          >
            {confirmingDelete ? "¿Seguro?" : "✕"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {column.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            columnId={column.id}
            dragTaskId={dragTaskId}
            dropIndicator={dropIndicator}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverTask={onDragOverTask}
            onDropTask={onDropTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}

        {column.tasks.length === 0 && (
          <p className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-600">
            Arrastra tareas aquí
          </p>
        )}
      </div>

      <AddTaskForm columnId={column.id} onAddTask={onAddTask} />
    </section>
  );
}
