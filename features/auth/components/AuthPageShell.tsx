import Link from "next/link";

interface AuthPageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  asideTitle?: string;
  asideDescription?: string;
  contentClassName?: string;
  asideFooter?: React.ReactNode;
}

export function AuthPageShell({
  children,
  title,
  subtitle,
  asideTitle = "Gestiona tu negocio con una sola cuenta",
  asideDescription = "Accede al panel de comercio o a la consola de administración para operar pedidos, catálogo y métricas en tiempo real.",
  contentClassName = "max-w-md",
  asideFooter,
}: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen bg-zinc-950 text-zinc-100">
      <Link
        href="/"
        data-testid="auth-back-home"
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
            {asideTitle}
          </h1>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-zinc-400">
            {asideDescription}
          </p>
        </div>

        <div className="relative space-y-4 px-12 pb-16">
          {asideFooter ?? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-sm font-semibold text-white">Acceso seguro</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Protegemos tu cuenta con verificación por correo y enlaces de un solo uso.
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-950/30 via-zinc-950 to-zinc-950 lg:hidden" />

        <div className={`relative w-full ${contentClassName}`}>
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
              DTS Platform
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
