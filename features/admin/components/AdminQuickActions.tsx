import Link from "next/link";

import { adminQuickActions } from "@/features/admin/config/admin-nav";

export function AdminQuickActions() {
  return (
    <section data-testid="admin-quick-actions" className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Acciones rápidas
        </h3>
        <p className="text-sm text-zinc-600">
          Accede directamente a las áreas que gestionas como administrador.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminQuickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            data-testid={action.testId}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <h4 className="font-semibold text-zinc-900 group-hover:text-emerald-800">
              {action.title}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{action.description}</p>
            <span className="mt-4 inline-flex text-xs font-semibold text-emerald-700">
              Ir →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
