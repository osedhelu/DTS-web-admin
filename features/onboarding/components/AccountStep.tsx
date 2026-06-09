"use client";

import type { FormEvent } from "react";

import {
  onboardingAlertErrorClass,
  onboardingInputClass,
  onboardingLabelClass,
  onboardingPrimaryBtnClass,
} from "@/features/onboarding/lib/form-styles";
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
        <label className={onboardingLabelClass}>
          Nombre
          <input
            data-testid="onboarding-first-name"
            type="text"
            required
            value={form.firstName}
            onChange={(event) => updateForm({ firstName: event.target.value })}
            className={onboardingInputClass}
          />
        </label>
        <label className={onboardingLabelClass}>
          Apellido
          <input
            data-testid="onboarding-last-name"
            type="text"
            required
            value={form.lastName}
            onChange={(event) => updateForm({ lastName: event.target.value })}
            className={onboardingInputClass}
          />
        </label>
      </div>

      <label className={onboardingLabelClass}>
        Email
        <input
          data-testid="onboarding-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => updateForm({ email: event.target.value })}
          className={onboardingInputClass}
        />
      </label>

      <label className={onboardingLabelClass}>
        Contraseña
        <input
          data-testid="onboarding-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={(event) => updateForm({ password: event.target.value })}
          className={onboardingInputClass}
        />
      </label>

      <label className={onboardingLabelClass}>
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
          className={onboardingInputClass}
        />
      </label>

      {passwordsMismatch ? (
        <p role="alert" className={onboardingAlertErrorClass}>
          Las contraseñas no coinciden.
        </p>
      ) : null}

      <button
        type="submit"
        data-testid="onboarding-step1-next"
        disabled={passwordsMismatch}
        className={`mt-2 ${onboardingPrimaryBtnClass}`}
      >
        Continuar
      </button>
    </form>
  );
}
