import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import NewBoardForm from "@/components/NewBoardForm";
import BoardCard from "@/components/BoardCard";

export const metadata = { title: "Mis tableros — TaskFlow" };

export default async function BoardsPage() {
  const user = await requireUser();

  const boards = await db.board.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      columns: { select: { _count: { select: { tasks: true } } } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">
            Mis tableros
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Organiza tus proyectos con tableros Kanban.
          </p>
        </div>
        <NewBoardForm />
      </div>

      {boards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-16 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            Aún no tienes tableros. Crea el primero para empezar.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const taskCount = board.columns.reduce(
              (acc, column) => acc + column._count.tasks,
              0,
            );
            return (
              <BoardCard
                key={board.id}
                board={{ id: board.id, title: board.title, taskCount }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
