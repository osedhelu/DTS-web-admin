import Link from "next/link";
import { Suspense } from "react";

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
    <div className="relative flex min-h-screen bg-zinc-950 text-zinc-100">
      <Link
        href="/"
        data-testid="login-back-home"
        aria-label="Volver al inicio"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:left-6 sm:top-6"
      >
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Volver al inicio</span>
      </Link>

      <aside className="relative hidden w-[45%] overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/50 via-zinc-950 to-zinc-950" />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative px-12 pt-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            DTS Platform
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight text-white">
            Gestiona tu negocio con una sola cuenta
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-zinc-400">
            Accede al panel de comercio o a la consola de administración para
            operar pedidos, catálogo y métricas en tiempo real.
          </p>
        </div>

        <div className="relative space-y-4 px-12 pb-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">Panel comercio</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Productos, inventario, pedidos y promociones de tu tienda.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white">Super Admin</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Moderación, mapa operativo, comisiones y contenido de plataforma.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-950/30 via-zinc-950 to-zinc-950 lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              DTS Platform
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Iniciar sesión</h2>
          </div>

          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
