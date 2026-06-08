import Link from "next/link";

import { merchantQuickActions } from "@/features/stores/config/merchant-nav";

export function MerchantQuickActions() {
  return (
    <section data-testid="merchant-quick-actions" className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Acciones rápidas
        </h3>
        <p className="text-sm text-zinc-600">
          Atajos para las tareas que más usas en el día a día.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {merchantQuickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            data-testid={action.testId}
            className="group rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:border-emerald-300 hover:shadow-md"
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
