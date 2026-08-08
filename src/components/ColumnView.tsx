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
  dragTaskId,
  dragOverColumnId,
  dropIndicator,
  onDragStart,
  onDragEnd,
  onDragOverTask,
  onDragOverColumn,
  onDropTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteColumn,
}: {
  column: BoardColumn;
  dragTaskId: string | null;
  dragOverColumnId: string | null;
  dropIndicator: DropIndicator | null;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onDragOverTask: (taskId: string, position: "top" | "bottom") => void;
  onDragOverColumn: (columnId: string) => void;
  onDropTask: (columnId: string, index: number) => void;
  onAddTask: (columnId: string, title: string) => void;
  onUpdateTask: (taskId: string, title: string, description?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isDragOver =
    dragTaskId !== null && dragOverColumnId === column.id;

  function handleColumnDragOver(event: React.DragEvent) {
    if (!dragTaskId) return;
    event.preventDefault();
    onDragOverColumn(column.id);
  }

  function handleColumnDrop(event: React.DragEvent) {
    if (!dragTaskId) return;
    event.preventDefault();
    onDropTask(column.id, column.tasks.length);
  }

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setConfirmingDelete(false);
    onDeleteColumn(column.id);
  }

  return (
    <section
      data-testid="column"
      className={`w-72 shrink-0 rounded-2xl border p-3 transition-colors ${
        isDragOver
          ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-400/20 dark:bg-indigo-950/20"
          : "border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/60"
      }`}
      onDragOver={handleColumnDragOver}
      onDrop={handleColumnDrop}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="truncate text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {column.title}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
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
