"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateBoard } from "@/actions/boards";

export default function BoardTitle({
  boardId,
  initialTitle,
}: {
  boardId: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(initialTitle);
      setEditing(false);
      return;
    }
    if (trimmed !== initialTitle) {
      void updateBoard({ boardId, title: trimmed }).then((result) => {
        if (!result.ok) router.refresh();
      });
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={60}
          aria-label="Título del tablero"
          autoFocus
          className="w-72 rounded-lg border border-zinc-300 px-2 py-1 text-3xl font-bold text-zinc-950 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
        />
        <button
          type="submit"
          aria-label={`Guardar tablero ${title}`}
          className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          ✓
        </button>
      </form>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
        {initialTitle}
      </h1>
      <button
        type="button"
        onClick={() => {
          setTitle(initialTitle);
          setEditing(true);
        }}
        aria-label={`Editar tablero ${initialTitle}`}
        className="rounded-full px-2 py-1 text-sm font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        ✎
      </button>
    </div>
  );
}
