"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo restablecer la contraseña");
        return;
      }

      router.replace("/login?reset=1");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="reset-password-form"
      className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Nueva contraseña
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Elige una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
        Nueva contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 font-normal text-white placeholder:text-zinc-600 outline-none ring-emerald-500/40 transition focus:border-emerald-500/50 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
        Confirmar contraseña
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="••••••••"
          className="rounded-xl border border-white/10 bg-zinc-900/60 px-4 py-2.5 font-normal text-white placeholder:text-zinc-600 outline-none ring-emerald-500/40 transition focus:border-emerald-500/50 focus:ring-2"
        />
      </label>

      {error ? (
        <p
          role="alert"
          data-testid="reset-password-error"
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
        {isSubmitting ? "Guardando…" : "Restablecer contraseña"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        ¿Necesitas otro enlace?{" "}
        <Link
          href="/recuperar-contrasena"
          className="font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          Solicitar de nuevo
        </Link>
      </p>
    </form>
  );
}
