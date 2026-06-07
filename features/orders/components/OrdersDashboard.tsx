"use client";

import { useEffect, useState } from "react";

import { OrdersTable } from "@/features/orders/components/OrdersTable";
import { ORDERS_POLL_INTERVAL_MS } from "@/features/orders/constants";
import {
  DELIVERY_STATUS_FILTERS,
  DELIVERY_STATUS_LABELS,
  type DeliveryOrder,
  type DeliveryOrderStatus,
} from "@/features/orders/types";
import type { PaginatedResponse } from "@/lib/api/types";

export function OrdersDashboard() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | DeliveryOrderStatus>(
    "all",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders(options?: { silent?: boolean }) {
      try {
        const response = await fetch("/api/merchant/orders?order_type=delivery");
        const data = (await response.json()) as PaginatedResponse<DeliveryOrder> & {
          detail?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          if (!options?.silent) {
            setError(data.detail ?? "No se pudieron cargar los pedidos");
            setOrders([]);
          }
          return;
        }

        setOrders(
          data.results.filter((order) => order.order_type === "delivery"),
        );
        setRefreshCount((current) => current + 1);
      } catch {
        if (!cancelled && !options?.silent) {
          setError("Error de conexión al cargar pedidos.");
          setOrders([]);
        }
      } finally {
        if (!cancelled && !options?.silent) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    const intervalId = window.setInterval(() => {
      void fetchOrders({ silent: true });
    }, ORDERS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleTransition(orderId: number, targetStatus: string) {
    setUpdatingOrderId(orderId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/merchant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = (await response.json()) as DeliveryOrder & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo actualizar el pedido");
        return;
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? data : order)),
      );
      setSuccessMessage(
        `Pedido #${orderId} actualizado a "${DELIVERY_STATUS_LABELS[data.status]}".`,
      );
    } catch {
      setError("Error de conexión al actualizar el pedido.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

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

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          data-testid="orders-success-message"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando pedidos…</p>
      ) : (
        <OrdersTable
          orders={filteredOrders}
          onTransition={handleTransition}
          updatingOrderId={updatingOrderId}
        />
      )}
    </div>
  );
}
