"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MerchantStoreSelector } from "@/features/stores/components/MerchantStoreSelector";
import { merchantNavGroups } from "@/features/stores/config/merchant-nav";

interface MerchantShellProps {
  userEmail?: string;
  children: React.ReactNode;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/merchant") {
    return pathname === "/merchant";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name }: { name: string }) {
  const className = "h-4 w-4 shrink-0 opacity-80";

  switch (name) {
    case "Dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "Productos":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M3.3 7l8.7 5 8.7-5M12 22V12" />
        </svg>
      );
    case "Categorías":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case "Inventario":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7h-9M14 17H5" />
          <circle cx="17" cy="17" r="3" />
          <circle cx="7" cy="7" r="3" />
        </svg>
      );
    case "Pedidos":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case "Pedidos servicio":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "Promociones":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M22 7h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4V7z" />
          <path d="M2 7h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V7z" />
          <path d="M12 7v10" />
        </svg>
      );
    case "Configuración":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    default:
      return null;
  }
}

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login";
}

export function MerchantShell({ userEmail, children }: MerchantShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <aside
        data-testid="merchant-sidebar"
        className="flex w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100"
      >
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            DTS Platform
          </p>
          <h1 className="mt-1 text-lg font-bold text-white">Panel comercio</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Gestiona productos, inventario y pedidos desde este panel.
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {merchantNavGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          active
                            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <NavIcon name={item.label} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-zinc-500">{item.description}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          {userEmail ? (
            <p className="truncate text-xs text-zinc-400">{userEmail}</p>
          ) : null}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Portal del comercio
              </p>
              <p className="text-sm text-zinc-500">
                Administra catálogo, operaciones y promociones de tu negocio
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MerchantStoreSelector compact />
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                Comercio
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
