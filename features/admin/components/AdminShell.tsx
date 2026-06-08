"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavGroups } from "@/features/admin/config/admin-nav";

interface AdminShellProps {
  userEmail?: string;
  children: React.ReactNode;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
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
    case "Comisiones":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "Cupones":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
          <path d="M22 7h-4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h4V7z" />
          <path d="M2 7h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2V7z" />
          <path d="M12 7v10" />
        </svg>
      );
    case "Banners":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case "Comercios":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
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

export function AdminShell({ userEmail, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <aside
        data-testid="admin-sidebar"
        className="flex w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100"
      >
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            DTS Platform
          </p>
          <h1 className="mt-1 text-lg font-bold text-white">Super Admin</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Gestión central de comercios, finanzas y contenido
          </p>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {adminNavGroups.map((group) => (
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
        <header className="border-b border-zinc-200 bg-white px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Consola de administración
              </p>
              <p className="text-sm text-zinc-500">
                Supervisa la operación de la plataforma DTS Delivery
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
              Super Admin
            </span>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
