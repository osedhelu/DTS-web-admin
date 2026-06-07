"use client";

import {
  DELIVERY_STATUS_LABELS,
  formatOrderItemsSummary,
  getDeliveryOrderAction,
  type DeliveryOrder,
} from "@/features/orders/types";

interface OrdersTableProps {
  orders: DeliveryOrder[];
  onTransition: (orderId: number, targetStatus: string) => Promise<void>;
  updatingOrderId: number | null;
}

export function OrdersTable({
  orders,
  onTransition,
  updatingOrderId,
}: OrdersTableProps) {
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
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Ítems</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Conductor</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((order) => {
            const action = getDeliveryOrderAction(order.status);

            return (
              <tr key={order.id} data-testid={`order-row-${order.id}`}>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  #{order.id}
                </td>
                <td className="px-4 py-3">
                  <span data-testid={`order-status-${order.id}`}>
                    {DELIVERY_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {formatOrderItemsSummary(order.items)}
                </td>
                <td className="px-4 py-3">${order.total}</td>
                <td className="px-4 py-3 text-zinc-600">
                  {order.driver_id ? `#${order.driver_id}` : "Sin asignar"}
                </td>
                <td className="px-4 py-3">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
