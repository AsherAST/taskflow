"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ColumnView from "@/components/ColumnView";
import NewColumnForm from "@/components/NewColumnForm";
import {
  createColumn,
  deleteColumn,
  updateColumn,
  moveColumn,
} from "@/actions/columns";
import {
  createTask,
  deleteTask,
  moveTask,
  updateTask,
} from "@/actions/tasks";

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
}

export interface BoardColumn {
  id: string;
  title: string;
  tasks: BoardTask[];
}

export default function KanbanBoard({
  boardId,
  initialColumns,
}: {
  boardId: string;
  initialColumns: BoardColumn[];
}) {
  const router = useRouter();
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    taskId: string;
    position: "top" | "bottom";
  } | null>(null);
  const [dragColumnId, setDragColumnId] = useState<string | null>(null);

  function clearDragState() {
    setDragTaskId(null);
    setDragOverColumnId(null);
    setDropIndicator(null);
  }

  function clearColumnDragState() {
    setDragColumnId(null);
    setDragOverColumnId(null);
  }

  function handleAddTask(columnId: string, title: string) {
    void createTask({ title, columnId }).then((result) => {
      if (result.ok && result.task) {
        setColumns((prev) =>
          prev.map((column) =>
            column.id === columnId
              ? { ...column, tasks: [...column.tasks, result.task!] }
              : column,
          ),
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleUpdateTask(
    taskId: string,
    title: string,
    description?: string,
  ) {
    void updateTask({ taskId, title, description }).then((result) => {
      if (result.ok) {
        setColumns((prev) =>
          prev.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === taskId ? { ...task, title, description: description ?? null } : task,
            ),
          })),
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleDeleteTask(taskId: string) {
    void deleteTask({ taskId }).then((result) => {
      if (result.ok) {
        setColumns((prev) =>
          prev.map((column) => ({
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          })),
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleAddColumn(title: string) {
    void createColumn({ title, boardId }).then((result) => {
      if (result.ok && result.column) {
        setColumns((prev) => [...prev, { ...result.column!, tasks: [] }]);
      } else {
        router.refresh();
      }
    });
  }

  function handleDeleteColumn(columnId: string) {
    void deleteColumn({ columnId }).then((result) => {
      if (result.ok) {
        setColumns((prev) => prev.filter((column) => column.id !== columnId));
      } else {
        router.refresh();
      }
    });
  }

  function handleUpdateColumn(columnId: string, title: string) {
    void updateColumn({ columnId, title }).then((result) => {
      if (result.ok) {
        setColumns((prev) =>
          prev.map((column) =>
            column.id === columnId ? { ...column, title } : column,
          ),
        );
      } else {
        router.refresh();
      }
    });
  }

  function handleColumnDragStart(columnId: string) {
    setDragColumnId(columnId);
  }

  function handleColumnDragOver(columnId: string) {
    if (!dragColumnId || dragColumnId === columnId) return;
    setDragOverColumnId(columnId);
  }

  function handleColumnDrop(columnId: string, index: number) {
    const draggedId = dragColumnId;
    clearColumnDragState();
    if (!draggedId || draggedId === columnId) return;

    const currentIndex = columns.findIndex(
      (column) => column.id === draggedId,
    );
    if (currentIndex === -1) return;

    setColumns((prev) => {
      const next = prev.filter((column) => column.id !== draggedId);
      next.splice(Math.max(0, Math.min(index, next.length)), 0, prev[currentIndex]);
      return next;
    });

    void moveColumn({
      columnId: draggedId,
      boardId,
      position: index,
    }).then((result) => {
      if (!result.ok) router.refresh();
    });
  }

  function handleDropTask(columnId: string, index: number) {
    const taskId = dragTaskId;
    clearDragState();
    if (!taskId) return;

    const sourceColumn = columns.find((column) =>
      column.tasks.some((task) => task.id === taskId),
    );
    if (!sourceColumn) return;

    const task = sourceColumn.tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (sourceColumn.id === columnId) {
      const currentIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId);
      const adjusted =
        index > currentIndex ? index - 1 : index;
      setColumns((prev) =>
        prev.map((column) =>
          column.id === columnId
            ? {
                ...column,
                tasks: (() => {
                  const tasks = column.tasks.filter((t) => t.id !== taskId);
                  tasks.splice(Math.max(0, adjusted), 0, task);
                  return tasks;
                })(),
              }
            : column,
        ),
      );
      void moveTask({ taskId, columnId, position: adjusted });
      return;
    }

    setColumns((prev) =>
      prev.map((column) => {
        if (column.id === sourceColumn.id) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId),
          };
        }
        if (column.id === columnId) {
          const tasks = [...column.tasks];
          tasks.splice(Math.max(0, index), 0, task);
          return { ...column, tasks };
        }
        return column;
      }),
    );
    void moveTask({ taskId, columnId, position: index }).then((result) => {
      if (!result.ok) router.refresh();
    });
  }

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-4">
      {columns.map((column, index) => (
        <ColumnView
          key={column.id}
          column={column}
          index={index}
          dragTaskId={dragTaskId}
          dragOverColumnId={dragOverColumnId}
          dropIndicator={dropIndicator}
          dragColumnId={dragColumnId}
          onDragStart={(taskId) => setDragTaskId(taskId)}
          onDragEnd={clearDragState}
          onDragOverTask={(taskId, position) =>
            setDropIndicator({ taskId, position })
          }
          onDragOverColumn={(columnId) => setDragOverColumnId(columnId)}
          onDropTask={handleDropTask}
          onColumnDragStart={handleColumnDragStart}
          onColumnDragEnd={clearColumnDragState}
          onColumnDragOver={handleColumnDragOver}
          onColumnDrop={handleColumnDrop}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onUpdateColumn={handleUpdateColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      ))}

      <div className="w-72 shrink-0">
        <NewColumnForm onAddColumn={handleAddColumn} />
      </div>
    </div>
  );
}
