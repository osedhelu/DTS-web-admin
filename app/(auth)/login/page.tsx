import { Suspense } from "react";

import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Suspense fallback={<div className="text-sm text-zinc-500">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
