"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { onboardingCardClass, onboardingPrimaryBtnClass } from "@/features/onboarding/lib/form-styles";

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div
      data-testid="registration-success"
      className={`${onboardingCardClass} text-center`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-300 ring-1 ring-emerald-500/30">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-bold text-white">Revisa tu correo</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Enviamos un enlace de confirmación
        {email ? (
          <>
            {" "}
            a <strong className="text-white">{email}</strong>
          </>
        ) : (
          " a tu email"
        )}
        . Haz clic en el enlace para activar tu cuenta de comercio.
      </p>
      <Link
        href="/login"
        className={`mt-6 inline-flex ${onboardingPrimaryBtnClass}`}
      >
        Ir a iniciar sesión
      </Link>
    </div>
  );
}

export function RegistrationSuccessPanel() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-zinc-400">Cargando…</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
