"use client";

import {
  canCancelServiceOrder,
  getPrimaryServiceAction,
  SERVICE_STATUS_LABELS,
  type ServiceOrder,
} from "@/features/service-orders/types";

interface ServiceOrderCardProps {
  order: ServiceOrder;
  onTransition: (orderId: number, targetStatus: string) => Promise<void>;
  isUpdating: boolean;
}

function formatScheduledAt(value: string | null): string {
  if (!value) {
    return "Sin fecha programada";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ServiceOrderCard({
  order,
  onTransition,
  isUpdating,
}: ServiceOrderCardProps) {
  const primaryAction = getPrimaryServiceAction(order.status);
  const canCancel = canCancelServiceOrder(order.status);

  return (
    <article
      data-testid={`service-order-${order.id}`}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">
            Pedido #{order.id}
          </h3>
          <p className="text-sm text-zinc-600">
            {order.items[0]?.product_name ?? "Servicio"} · ${order.total}
          </p>
        </div>
        <span
          data-testid={`service-order-status-${order.id}`}
          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
        >
          {SERVICE_STATUS_LABELS[order.status]}
        </span>
      </div>

      <dl className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
        <div>
          <dt className="font-medium text-zinc-700">Dirección</dt>
          <dd>{order.service_address ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-700">Duración estimada</dt>
          <dd>
            {order.duration_minutes
              ? `${order.duration_minutes} min`
              : "No indicada"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-zinc-700">Notas del cliente</dt>
          <dd>{order.customer_notes?.trim() ? order.customer_notes : "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-700">Agendado para</dt>
          <dd data-testid={`service-order-scheduled-${order.id}`}>
            {formatScheduledAt(order.scheduled_at)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        {primaryAction ? (
          <button
            type="button"
            data-testid={`service-order-action-${order.id}`}
            disabled={isUpdating}
            onClick={() => onTransition(order.id, primaryAction.targetStatus)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {primaryAction.label}
          </button>
        ) : null}

        {canCancel ? (
          <button
            type="button"
            data-testid={`service-order-cancel-${order.id}`}
            disabled={isUpdating}
            onClick={() => onTransition(order.id, "cancelled")}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </article>
  );
}
