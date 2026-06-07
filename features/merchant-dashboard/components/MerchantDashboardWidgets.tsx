import type { MerchantDashboardMetrics, SalesSeriesPoint } from "@/features/merchant-dashboard/types";

function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

function SalesChart({ series }: { series: SalesSeriesPoint[] }) {
  const maxTotal = Math.max(...series.map((point) => Number(point.total)), 1);

  return (
    <div
      data-testid="merchant-dashboard-sales-chart"
      className="mt-4 flex h-36 items-end gap-1 overflow-x-auto"
    >
      {series.slice(-14).map((point) => {
        const heightPercent = (Number(point.total) / maxTotal) * 100;

        return (
          <div
            key={point.date}
            className="flex min-w-[28px] flex-1 flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t bg-emerald-600"
              style={{ height: `${Math.max(heightPercent, 4)}%` }}
              title={`${point.date}: ${formatCurrency(point.total)}`}
            />
            <span className="text-[10px] text-zinc-500">
              {formatShortDate(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MerchantDashboardWidgets({
  metrics,
}: {
  metrics: MerchantDashboardMetrics;
}) {
  return (
    <div data-testid="merchant-dashboard-widgets" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          data-testid="merchant-kpi-sales"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">
            Ventas ({metrics.period_days} días)
          </p>
          <p
            data-testid="merchant-dashboard-total-sales"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {formatCurrency(metrics.total_sales)}
          </p>
        </article>

        <article
          data-testid="merchant-kpi-orders"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">Pedidos completados</p>
          <p
            data-testid="merchant-dashboard-order-count"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {metrics.order_count}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Hoy: {metrics.orders_today} · Semana: {metrics.orders_this_week}
          </p>
        </article>

        <article
          data-testid="merchant-kpi-ticket"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">Ticket promedio</p>
          <p
            data-testid="merchant-dashboard-average-ticket"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {formatCurrency(metrics.average_ticket)}
          </p>
        </article>

        <article
          data-testid="merchant-kpi-net"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <p className="text-sm text-zinc-600">Ganancia neta estimada</p>
          <p
            data-testid="merchant-dashboard-net-earnings"
            className="mt-2 text-2xl font-semibold text-zinc-900"
          >
            {formatCurrency(metrics.net_earnings)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Comisión plataforma: {formatCurrency(metrics.platform_commission)}
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-zinc-200 bg-white p-4 lg:col-span-2">
          <h4 className="text-sm font-medium text-zinc-900">
            Ventas diarias (últimos 14 días)
          </h4>
          <SalesChart series={metrics.sales_series} />
        </article>

        <article className="rounded-xl border border-zinc-200 bg-white p-4">
          <h4 className="text-sm font-medium text-zinc-900">Productos activos</h4>
          <p
            data-testid="merchant-dashboard-active-products"
            className="mt-2 text-3xl font-semibold text-zinc-900"
          >
            {metrics.active_products}
          </p>

          <h4 className="mt-6 text-sm font-medium text-zinc-900">Top productos</h4>
          {metrics.top_products.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Sin ventas en el período.</p>
          ) : (
            <ul
              data-testid="merchant-dashboard-top-products"
              className="mt-2 space-y-2 text-sm"
            >
              {metrics.top_products.map((product) => (
                <li
                  key={`${product.product_id}-${product.product_name}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-zinc-700">{product.product_name}</span>
                  <span className="shrink-0 font-medium text-zinc-900">
                    {formatCurrency(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </div>
  );
}
