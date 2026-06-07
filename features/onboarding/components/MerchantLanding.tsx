"use client";

import Link from "next/link";

export function MerchantLanding() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-zinc-900">DTS Delivery</span>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </header>

      <main>
        <section
          data-testid="merchant-landing-hero"
          className="mx-auto max-w-5xl px-4 py-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
            Portal comercios
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Vende en DTS y llega a más clientes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Registra tu comercio en minutos: comida, servicios a domicilio o
            productos retail. Recibe pedidos, gestiona tu catálogo y haz crecer
            tu negocio.
          </p>
          <Link
            href="/registro-comercio"
            data-testid="merchant-landing-cta"
            className="mt-8 inline-flex rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Registrar mi comercio
          </Link>
        </section>

        <section className="border-t border-zinc-200 bg-white py-16">
          <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Registro guiado
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Wizard de 3 pasos con plantillas de categorías según tu vertical.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Panel merchant
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Productos, pedidos, inventario y métricas en un solo lugar.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900">
                Verificación segura
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Confirmamos tu correo antes de activar tu cuenta de comercio.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
