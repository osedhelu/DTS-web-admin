"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { OrderChatModal } from "@/features/orders/components/OrderChatPanel";
import { ServiceOrderCard } from "@/features/service-orders/components/ServiceOrderCard";
import { useServiceOrdersStore } from "@/features/service-orders/stores/service-orders-store";
import { useOrderChatStore } from "@/features/orders/stores/order-chat-store";
import { useUiStore } from "@/lib/stores/ui-store";
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

const CHAT_SCAN_MS = 8_000;

export function ServiceOrdersDashboard() {
  const orders = useServiceOrdersStore((state) => state.orders);
  const statusFilter = useServiceOrdersStore((state) => state.statusFilter);
  const isLoading = useServiceOrdersStore((state) => state.isLoading);
  const updatingOrderId = useServiceOrdersStore((state) => state.updatingOrderId);
  const startPolling = useServiceOrdersStore((state) => state.startPolling);
  const stopPolling = useServiceOrdersStore((state) => state.stopPolling);
  const setStatusFilter = useServiceOrdersStore((state) => state.setStatusFilter);
  const transitionOrder = useServiceOrdersStore((state) => state.transitionOrder);
  const scanOrdersForNewMessages = useOrderChatStore(
    (s) => s.scanOrdersForNewMessages,
  );
  const unreadChat = useOrderChatStore((s) => s.unreadCount);
  const clearUnread = useOrderChatStore((s) => s.clearUnread);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const ids = orders.map((o) => o.id);
    if (ids.length === 0) return;
    void scanOrdersForNewMessages(ids);
    const timer = window.setInterval(() => {
      void scanOrdersForNewMessages(ids);
    }, CHAT_SCAN_MS);
    return () => window.clearInterval(timer);
  }, [orders, scanOrdersForNewMessages]);

  useEffect(() => {
    if (unreadChat > 0) {
      useUiStore
        .getState()
        .setSuccess(`Nuevo mensaje en chat (${unreadChat}).`);
      clearUnread();
    }
  }, [unreadChat, clearUnread]);

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div className="space-y-6">
      <OrderChatModal />
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
