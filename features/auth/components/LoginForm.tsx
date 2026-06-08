"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

interface LoginSuccess {
  ok: boolean;
  redirectTo: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "1";
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
      data-testid="login-form"
      className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight text-white">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Acceso para comercios y administradores DTS.
        </p>
      </div>

      {verified ? (
        <p
          data-testid="login-verified-banner"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          Tu correo fue confirmado. Inicia sesión con el usuario generado a partir
          de tu email.
        </p>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
        Usuario
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="nombre@empresa.com"
          className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 font-normal text-white placeholder:text-zinc-600 outline-none ring-emerald-500/40 transition focus:border-emerald-500/50 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 font-normal text-white placeholder:text-zinc-600 outline-none ring-emerald-500/40 transition focus:border-emerald-500/50 focus:ring-2"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        ¿Aún no tienes comercio?{" "}
        <Link
          href="/registro-comercio"
          className="font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          Regístrate aquí
        </Link>
      </p>
    </form>
  );
}
