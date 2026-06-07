"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { ServiceOrderCard } from "@/features/service-orders/components/ServiceOrderCard";
import { useServiceOrdersStore } from "@/features/service-orders/stores/service-orders-store";
import type { ServiceOrderStatus } from "@/features/service-orders/types";

const STATUS_FILTERS: Array<{ value: "all" | ServiceOrderStatus; label: string }> =
  [
    { value: "all", label: "Todos" },
    { value: "created", label: "Nuevos" },
    { value: "accepted_by_merchant", label: "Aceptados" },
    { value: "scheduled", label: "Agendados" },
    { value: "provider_en_route", label: "En camino" },
    { value: "in_progress", label: "En curso" },
    { value: "completed", label: "Completados" },
  ];

export function ServiceOrdersDashboard() {
  const orders = useServiceOrdersStore((state) => state.orders);
  const statusFilter = useServiceOrdersStore((state) => state.statusFilter);
  const isLoading = useServiceOrdersStore((state) => state.isLoading);
  const updatingOrderId = useServiceOrdersStore((state) => state.updatingOrderId);
  const loadOrders = useServiceOrdersStore((state) => state.loadOrders);
  const setStatusFilter = useServiceOrdersStore((state) => state.setStatusFilter);
  const transitionOrder = useServiceOrdersStore((state) => state.transitionOrder);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            data-testid={`service-orders-filter-${filter.value}`}
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

      <UiFeedback successTestId="service-orders-success-message" />

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando pedidos de servicio…</p>
      ) : filteredOrders.length === 0 ? (
        <p data-testid="service-orders-empty" className="text-sm text-zinc-500">
          No hay pedidos de servicio en este filtro.
        </p>
      ) : (
        <div
          data-testid="service-orders-list"
          className="grid gap-4 xl:grid-cols-2"
        >
          {filteredOrders.map((order) => (
            <ServiceOrderCard
              key={order.id}
              order={order}
              onTransition={transitionOrder}
              isUpdating={updatingOrderId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
