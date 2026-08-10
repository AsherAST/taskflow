import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "TaskFlow — Gestor de tareas Kanban" };

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/boards");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-base font-bold text-white">
              T
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              TaskFlow
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            Organiza tu trabajo con tableros Kanban
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-950 sm:text-6xl dark:text-white">
            Tus tareas, tus proyectos, en un solo{" "}
            <span className="text-indigo-600 dark:text-indigo-400">tablero</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            TaskFlow te ayuda a visualizar el progreso de tu equipo con columnas,
            tareas y drag &amp; drop. Crea tu cuenta gratis y empieza a organizar
            tu día en minutos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
              Todo lo que necesitas para fluir
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                emoji="🗂️"
                title="Tableros y columnas"
                description="Crea tableros por proyecto y organízalos en columnas: por hacer, en curso, hecho."
              />
              <FeatureCard
                emoji="🖱️"
                title="Drag & drop nativo"
                description="Mueve tareas entre columnas y reordena todo con solo arrastrar y soltar."
              />
              <FeatureCard
                emoji="🔒"
                title="Privado por defecto"
                description="Cada tablero pertenece a su dueño. Solo tú puedes ver y editar tus proyectos."
              />
              <FeatureCard
                emoji="✏️"
                title="Edición rápida"
                description="Renombra tableros, columnas y tareas inline, sin perder el ritmo de trabajo."
              />
              <FeatureCard
                emoji="📝"
                title="Descripciones"
                description="Añade contexto a cada tarea con descripciones detalladas y al límite de 500 caracteres."
              />
              <FeatureCard
                emoji="⚡"
                title="Actualización optimista"
                description="La interfaz responde al instante y sincroniza en segundo plano con tu base de datos."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
            ¿Listo para dejar de perder el hilo?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Crea tu primer tablero hoy. Es gratis, rápido y tu información está
            protegida.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Iniciar sesión
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500 sm:px-6 dark:text-zinc-400">
          © {new Date().getFullYear()} TaskFlow · Gestor de tareas Kanban
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-950/50">
        {emoji}
      </div>
      <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
