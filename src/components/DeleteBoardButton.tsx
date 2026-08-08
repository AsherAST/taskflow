"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBoard } from "@/actions/boards";

export default function DeleteBoardButton({
  boardId,
  boardTitle,
}: {
  boardId: string;
  boardTitle: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    const result = await deleteBoard({ boardId });
    if (!result.ok) {
      setError(result.error);
      setConfirming(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Eliminar ${boardTitle}`}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          confirming
            ? "bg-red-600 text-white hover:bg-red-700"
            : "text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
        }`}
        onMouseLeave={() => setConfirming(false)}
      >
        {confirming ? "¿Seguro?" : "Eliminar"}
      </button>
    </div>
  );
}
