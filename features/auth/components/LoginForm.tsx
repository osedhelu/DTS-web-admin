"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface LoginSuccess {
  ok: boolean;
  redirectTo: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as LoginSuccess & {
        detail?: string;
      };

      if (!response.ok) {
        setError(payload.detail ?? "No se pudo iniciar sesión");
        return;
      }

      const nextPath = searchParams.get("next");
      const destination =
        nextPath && nextPath.startsWith("/") ? nextPath : payload.redirectTo;

      router.replace(destination);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
    >
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Acceso para comercios y administradores DTS.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Usuario
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
