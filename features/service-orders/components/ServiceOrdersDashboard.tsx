"use client";

import { useEffect, useState } from "react";

import { ServiceOrderCard } from "@/features/service-orders/components/ServiceOrderCard";
import {
  SERVICE_STATUS_LABELS,
  type ServiceOrder,
  type ServiceOrderStatus,
} from "@/features/service-orders/types";
import type { PaginatedResponse } from "@/lib/api/types";

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
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ServiceOrderStatus>(
    "all",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setError(null);

      try {
        const response = await fetch("/api/merchant/orders?order_type=service");
        const data = (await response.json()) as PaginatedResponse<ServiceOrder> & {
          detail?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(data.detail ?? "No se pudieron cargar los pedidos de servicio");
          setOrders([]);
          return;
        }

        setOrders(data.results);
      } catch {
        if (!cancelled) {
          setError("Error de conexión al cargar pedidos.");
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      cancelled = true;
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

      const data = (await response.json()) as ServiceOrder & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo actualizar el pedido");
        return;
      }

      setOrders((current) =>
        current.map((order) => (order.id === orderId ? data : order)),
      );
      setSuccessMessage(
        `Pedido #${orderId} actualizado a "${SERVICE_STATUS_LABELS[data.status]}".`,
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

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          data-testid="service-orders-success-message"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}

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
              onTransition={handleTransition}
              isUpdating={updatingOrderId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
