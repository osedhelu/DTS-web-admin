"use client";

import Link from "next/link";

import { AccountStep } from "@/features/onboarding/components/AccountStep";
import { BusinessStep } from "@/features/onboarding/components/BusinessStep";
import { ReviewStep } from "@/features/onboarding/components/ReviewStep";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

const STEP_LABELS = ["Cuenta", "Negocio", "Confirmación"];

export function RegistrationWizard() {
  const step = useOnboardingStore((state) => state.step);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8">
        <Link
          href="/vender"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Volver a /vender
        </Link>
        <h1
          data-testid="registration-wizard-title"
          className="mt-4 text-2xl font-semibold text-zinc-900"
        >
          Registro de comercio
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Paso {step} de 3 — {STEP_LABELS[step - 1]}
        </p>
        <ol
          className="mt-4 flex gap-2"
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
                className={`h-2 flex-1 rounded-full ${
                  isActive || isDone ? "bg-zinc-900" : "bg-zinc-200"
                }`}
                title={label}
              />
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {step === 1 ? <AccountStep /> : null}
        {step === 2 ? <BusinessStep /> : null}
        {step === 3 ? <ReviewStep /> : null}
      </div>
    </div>
  );
}
