"use client";

import { useState } from "react";

export default function NewColumnForm({
  onAddColumn,
}: {
  onAddColumn: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim() === "") return;
    onAddColumn(title.trim());
    setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="+ Añadir columna"
        maxLength={60}
        className="w-full rounded-lg px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-zinc-50 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
      />
    </form>
  );
}
