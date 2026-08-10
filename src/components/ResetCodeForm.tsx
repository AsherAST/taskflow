"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetCodeForm({ email }: { email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        code: formData.get("code"),
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      changeToken?: string;
    };
    setLoading(false);

    if (!res.ok || !data.changeToken) {
      setError(data.error ?? "El código es inválido o ya expiró.");
      return;
    }

    sessionStorage.setItem("changeToken", data.changeToken);
    router.push("/reset-password");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
        Código de recuperación
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Escribe el código de 6 dígitos que enviamos a tu correo.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Código
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            required
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
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
          {loading ? "Verificando…" : "Verificar código"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/forgot-password"
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Solicitar otro código
        </Link>
      </p>
    </div>
  );
}
