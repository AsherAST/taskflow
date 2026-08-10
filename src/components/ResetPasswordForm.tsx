"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore, useState } from "react";

function subscribe() {
  return () => {};
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const changeToken = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem("changeToken") ?? "",
    () => "",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const token = sessionStorage.getItem("changeToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        changeToken: token,
        password: formData.get("password"),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Ocurrió un error. Intenta de nuevo.");
      return;
    }

    sessionStorage.removeItem("changeToken");
    setDone(true);
    router.push("/login");
    router.refresh();
  }

  if (done) {
    return (
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950/40 dark:text-green-400">
        Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
        Nueva contraseña
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Escribe tu nueva contraseña para tu cuenta.
      </p>

      {!changeToken ? (
        <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
          No hay un código verificado. Solicita un nuevo código de
          recuperación.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nueva contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </div>
  );
}
