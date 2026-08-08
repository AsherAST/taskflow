import Link from "next/link";
import DeleteBoardButton from "@/components/DeleteBoardButton";

export default function BoardCard({
  board,
}: {
  board: { id: string; title: string; taskCount: number };
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/boards/${board.id}`}
          className="block text-xl font-semibold text-zinc-950 transition hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
        >
          {board.title}
        </Link>
        <DeleteBoardButton boardId={board.id} boardTitle={board.title} />
      </div>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        {board.taskCount} {board.taskCount === 1 ? "tarea" : "tareas"}
      </p>
    </div>
  );
}
