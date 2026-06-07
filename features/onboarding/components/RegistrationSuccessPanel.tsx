"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div
      data-testid="registration-success"
      className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        ✓
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
        Revisa tu correo
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enviamos un enlace de confirmación
        {email ? (
          <>
            {" "}
            a <strong className="text-zinc-900">{email}</strong>
          </>
        ) : (
          " a tu email"
        )}
        . Haz clic en el enlace para activar tu cuenta de comercio.
      </p>
      <a
        href="/login"
        className="mt-6 inline-flex text-sm font-medium text-zinc-900 underline"
      >
        Ir a iniciar sesión
      </a>
    </div>
  );
}

export function RegistrationSuccessPanel() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-zinc-500">Cargando…</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
