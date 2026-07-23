"use client";

import { Fragment, useState } from "react";

import {
  DELIVERY_STATUS_LABELS,
  formatCustomerLabel,
  formatDriverLabel,
  formatDriverRelation,
  formatOrderItemsSummary,
  getDeliveryOrderAction,
  type DeliveryOrder,
} from "@/features/orders/types";
import {
  formatPaymentStatus,
  paymentStatusBadgeClass,
} from "@/features/orders/payment-status";

interface OrdersTableProps {
  orders: DeliveryOrder[];
  onTransition: (orderId: number, targetStatus: string) => Promise<void>;
  updatingOrderId: number | null;
}

function formatCreatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function OrdersTable({
  orders,
  onTransition,
  updatingOrderId,
}: OrdersTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (orders.length === 0) {
    return (
      <p data-testid="orders-empty" className="text-sm text-zinc-500">
        No hay pedidos en este filtro.
      </p>
    );
  }

  return (
    <div
      data-testid="orders-table"
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-600">
          <tr>
            <th className="px-4 py-3 font-medium">Pedido</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Pago</th>
            <th className="px-4 py-3 font-medium">Ítems</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Conductor</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((order) => {
            const action = getDeliveryOrderAction(order.status);
            const expanded = expandedId === order.id;
            const deliveryAddress =
              order.delivery_address?.trim() ||
              order.service_address?.trim() ||
              null;

            return (
              <Fragment key={order.id}>
                <tr
                  data-testid={`order-row-${order.id}`}
                  className="align-top"
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    <button
                      type="button"
                      data-testid={`order-expand-${order.id}`}
                      onClick={() =>
                        setExpandedId(expanded ? null : order.id)
                      }
                      className="text-left hover:underline"
                    >
                      #{order.id}
                    </button>
                  </td>
                  <td
                    className="px-4 py-3 text-zinc-700"
                    data-testid={`order-customer-${order.id}`}
                  >
                    <p className="font-medium text-zinc-900">
                      {formatCustomerLabel(order)}
                    </p>
                    {order.customer_phone ? (
                      <p className="text-xs text-zinc-500">
                        {order.customer_phone}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <span data-testid={`order-status-${order.id}`}>
                      {DELIVERY_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      data-testid={`order-payment-status-${order.id}`}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusBadgeClass(order.payment_status)}`}
                    >
                      {formatPaymentStatus(order.payment_status)}
                    </span>
                    {order.payment_status === "paid" &&
                    order.payment_reference ? (
                      <p
                        data-testid={`order-payment-reference-${order.id}`}
                        className="mt-1 text-xs text-zinc-500"
                      >
                        Ref: {order.payment_reference}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatOrderItemsSummary(order.items)}
                  </td>
                  <td className="px-4 py-3">${order.total}</td>
                  <td
                    className="px-4 py-3 text-zinc-700"
                    data-testid={`order-driver-${order.id}`}
                  >
                    <p className="font-medium text-zinc-900">
                      {formatDriverLabel(order)}
                    </p>
                    {order.driver_phone ? (
                      <p className="text-xs text-zinc-500">
                        {order.driver_phone}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-2">
                      {action ? (
                        <button
                          type="button"
                          data-testid={`order-action-${order.id}`}
                          disabled={updatingOrderId === order.id}
                          onClick={() =>
                            onTransition(order.id, action.targetStatus)
                          }
                          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
                        >
                          {updatingOrderId === order.id
                            ? "Guardando…"
                            : action.label}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                      <button
                        type="button"
                        data-testid={`order-detail-toggle-${order.id}`}
                        onClick={() =>
                          setExpandedId(expanded ? null : order.id)
                        }
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                      >
                        {expanded ? "Ocultar detalle" : "Detalle"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded ? (
                  <tr
                    data-testid={`order-detail-${order.id}`}
                    className="bg-zinc-50"
                  >
                    <td colSpan={8} className="px-4 py-4">
                      <div className="grid gap-4 text-sm text-zinc-600 md:grid-cols-2">
                        <div>
                          <p className="font-medium text-zinc-800">
                            Relación conductor
                          </p>
                          <p>{formatDriverRelation(order)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-800">Creado</p>
                          <p>{formatCreatedAt(order.created_at)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-medium text-zinc-800">
                            Dirección de entrega
                          </p>
                          <p>{deliveryAddress ?? "—"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-medium text-zinc-800">
                            Notas del cliente
                          </p>
                          <p>
                            {order.customer_notes?.trim()
                              ? order.customer_notes
                              : "—"}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-medium text-zinc-800">Ítems</p>
                          <ul className="mt-1 list-inside list-disc">
                            {order.items.length === 0 ? (
                              <li>Sin ítems</li>
                            ) : (
                              order.items.map((item) => (
                                <li key={item.id}>
                                  {item.quantity}× {item.product_name} — $
                                  {item.subtotal}
                                </li>
                              ))
                            )}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
