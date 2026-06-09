"use client";

import Link from "next/link";

import { AccountStep } from "@/features/onboarding/components/AccountStep";
import { BusinessStep } from "@/features/onboarding/components/BusinessStep";
import { ReviewStep } from "@/features/onboarding/components/ReviewStep";
import { onboardingCardClass } from "@/features/onboarding/lib/form-styles";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

const STEP_LABELS = ["Cuenta", "Negocio", "Confirmación"];

export function RegistrationWizard() {
  const step = useOnboardingStore((state) => state.step);

  return (
    <div className="w-full">
      <div className="mb-6 hidden lg:block">
        <h1
          data-testid="registration-wizard-title"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Registro de comercio
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Paso {step} de 3 — {STEP_LABELS[step - 1]}
        </p>
      </div>

      <div className="mb-6 lg:hidden">
        <p className="text-sm text-zinc-400">
          Paso {step} de 3 — {STEP_LABELS[step - 1]}
        </p>
      </div>

      <ol
        className="mb-6 flex gap-2"
        aria-label="Progreso del registro"
        data-testid="registration-wizard-steps"
      >
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isDone = step > stepNumber;

          return (
            <li
              key={label}
              data-testid={`wizard-step-indicator-${stepNumber}`}
              className={`h-2 flex-1 rounded-full transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                  : isDone
                    ? "bg-emerald-600/60"
                    : "bg-white/10"
              }`}
              title={label}
            />
          );
        })}
      </ol>

      <div className={onboardingCardClass}>
        {step === 1 ? <AccountStep /> : null}
        {step === 2 ? <BusinessStep /> : null}
        {step === 3 ? <ReviewStep /> : null}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
