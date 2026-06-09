"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div
        data-testid="reset-password-invalid-link"
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl"
      >
        <p className="text-sm text-red-200">El enlace de recuperación no es válido.</p>
        <Link
          href="/recuperar-contrasena"
          className="mt-4 inline-flex text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export function ResetPasswordPanel() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-zinc-400">Cargando…</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
