import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import KanbanBoard from "@/components/KanbanBoard";
import BoardTitle from "@/components/BoardTitle";

export const metadata = { title: "Tablero — TaskFlow" };

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const board = await db.board.findUnique({
    where: { id },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: { tasks: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!board || board.ownerId !== user.id) {
    notFound();
  }

  const columns = board.columns.map((column) => ({
    id: column.id,
    title: column.title,
    tasks: column.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
    })),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <BoardTitle boardId={board.id} initialTitle={board.title} />
        <Link
          href="/boards"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Mis tableros
        </Link>
      </div>

      <KanbanBoard boardId={board.id} initialColumns={columns} />
    </div>
  );
}
