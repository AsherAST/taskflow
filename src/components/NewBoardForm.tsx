"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBoard } from "@/actions/boards";

export default function NewBoardForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createBoard({ title });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setTitle("");
    router.push(`/boards/${result.boardId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <label htmlFor="board-title" className="sr-only">
        Título del tablero
      </label>
      <input
        id="board-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Nuevo tablero…"
        required
        maxLength={60}
        className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
      />
      <button
        type="submit"
        disabled={loading || title.trim() === ""}
        className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creando…" : "Crear"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
