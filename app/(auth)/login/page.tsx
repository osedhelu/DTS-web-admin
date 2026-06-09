import { Suspense } from "react";

import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { LoginForm } from "@/features/auth/components/LoginForm";

function LoginFallback() {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
      <p className="text-sm text-zinc-400">Cargando…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Iniciar sesión"
      subtitle="Acceso para comercios y administradores DTS."
    >
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
