"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { OrdersTable } from "@/features/orders/components/OrdersTable";
import {
  OrderChatModal,
} from "@/features/orders/components/OrderChatPanel";
import { DELIVERY_STATUS_FILTERS } from "@/features/orders/types";
import { useOrdersStore } from "@/features/orders/stores/orders-store";
import { useOrderChatStore } from "@/features/orders/stores/order-chat-store";
import { useUiStore } from "@/lib/stores/ui-store";

const CHAT_SCAN_MS = 8_000;

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
  const unreadChat = useOrderChatStore((state) => state.unreadCount);
  const scanOrdersForNewMessages = useOrderChatStore(
    (state) => state.scanOrdersForNewMessages,
  );
  const clearUnread = useOrderChatStore((state) => state.clearUnread);

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
        .setSuccess(
          `Nuevo mensaje en chat (${unreadChat}). Abre el botón Chat del pedido.`,
        );
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
      <p data-testid="orders-auto-refresh" className="text-xs text-zinc-500">
        Actualización automática · sonido al llegar pedidos o mensajes
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
