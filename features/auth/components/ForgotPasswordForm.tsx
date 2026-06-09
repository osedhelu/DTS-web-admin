"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = (await response.json()) as { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo procesar la solicitud");
        return;
      }

      setSuccessMessage(
        data.detail ??
          "Si el email está registrado, recibirás un enlace para restablecer tu contraseña.",
      );
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="forgot-password-form"
      className="flex w-full flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Te enviaremos un enlace seguro a tu correo registrado.
        </p>
      </div>

      {successMessage ? (
        <div
          data-testid="forgot-password-success"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
        >
          {successMessage}
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
        Correo electrónico
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@empresa.com"
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
        disabled={isSubmitting || Boolean(successMessage)}
        className="mt-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Enviar enlace de recuperación"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        ¿Recordaste tu contraseña?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
