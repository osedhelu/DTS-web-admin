"use client";

import type { FormEvent } from "react";

import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

export function AccountStep() {
  const form = useOnboardingStore((state) => state.form);
  const updateForm = useOnboardingStore((state) => state.updateForm);
  const setStep = useOnboardingStore((state) => state.setStep);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.password.length < 8) {
      return;
    }

    if (form.password !== form.confirmPassword) {
      return;
    }

    setStep(2);
  }

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid="onboarding-first-name"
            type="text"
            required
            value={form.firstName}
            onChange={(event) => updateForm({ firstName: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Apellido
          <input
            data-testid="onboarding-last-name"
            type="text"
            required
            value={form.lastName}
            onChange={(event) => updateForm({ lastName: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Email
        <input
          data-testid="onboarding-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => updateForm({ email: event.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Contraseña
        <input
          data-testid="onboarding-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={(event) => updateForm({ password: event.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Confirmar contraseña
        <input
          data-testid="onboarding-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.confirmPassword}
          onChange={(event) =>
            updateForm({ confirmPassword: event.target.value })
          }
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      {passwordsMismatch ? (
        <p role="alert" className="text-sm text-red-600">
          Las contraseñas no coinciden.
        </p>
      ) : null}

      <button
        type="submit"
        data-testid="onboarding-step1-next"
        disabled={passwordsMismatch}
        className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Continuar
      </button>
    </form>
  );
}
