"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { DELIVERY_STATUS_FILTERS } from "@/features/orders/types";
import { useOrdersStore } from "@/features/orders/stores/orders-store";

export function OrdersDashboard() {
  const orders = useOrdersStore((state) => state.orders);
  const statusFilter = useOrdersStore((state) => state.statusFilter);
  const isLoading = useOrdersStore((state) => state.isLoading);
  const updatingOrderId = useOrdersStore((state) => state.updatingOrderId);
  const refreshCount = useOrdersStore((state) => state.refreshCount);
  const startPolling = useOrdersStore((state) => state.startPolling);
  const stopPolling = useOrdersStore((state) => state.stopPolling);
  const setStatusFilter = useOrdersStore((state) => state.setStatusFilter);
  const transitionOrder = useOrdersStore((state) => state.transitionOrder);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="space-y-6">
      <p
        data-testid="orders-auto-refresh"
        className="text-xs text-zinc-500"
      >
        Actualización automática cada 10 segundos
      </p>
      <span data-testid="orders-refresh-count" className="sr-only">
        {refreshCount}
      </span>

      <div className="flex flex-wrap gap-2">
        {DELIVERY_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            data-testid={`orders-filter-${filter.value}`}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              statusFilter === filter.value
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <UiFeedback successTestId="orders-success-message" />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando pedidos…</p>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onTransition={transitionOrder}
          updatingOrderId={updatingOrderId}
        />
      )}
    </div>
  );
}
