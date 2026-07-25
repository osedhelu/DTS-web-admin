import { create } from "@/lib/stores/create-store";
import type { ServiceOrder, ServiceOrderStatus } from "@/features/service-orders/types";
import { SERVICE_STATUS_LABELS } from "@/features/service-orders/types";
import { useUiStore } from "@/lib/stores/ui-store";
import type { PaginatedResponse } from "@/lib/api/types";
import { ORDERS_POLL_INTERVAL_MS } from "@/features/orders/constants";

interface ServiceOrdersState {
  orders: ServiceOrder[];
  statusFilter: "all" | ServiceOrderStatus;
  isLoading: boolean;
  updatingOrderId: number | null;
  pollIntervalId: number | null;
  loadOrders: (options?: { silent?: boolean }) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  setStatusFilter: (filter: "all" | ServiceOrderStatus) => void;
  transitionOrder: (orderId: number, targetStatus: string) => Promise<void>;
}

export const useServiceOrdersStore = create<ServiceOrdersState>((set, get) => ({
  orders: [],
  statusFilter: "all",
  isLoading: true,
  updatingOrderId: null,
  pollIntervalId: null,

  loadOrders: async (options) => {
    if (!options?.silent) {
      useUiStore.getState().clearMessages();
    }

    try {
      const response = await fetch("/api/merchant/orders?order_type=service");
      const data = (await response.json()) as PaginatedResponse<ServiceOrder> & {
        detail?: string;
      };

      if (!response.ok) {
        if (!options?.silent) {
          useUiStore.getState().setError(
            data.detail ?? "No se pudieron cargar los pedidos de servicio",
          );
          set({ orders: [], isLoading: false });
        }
        return;
      }

      set({ orders: data.results, isLoading: false });
    } catch {
      if (!options?.silent) {
        useUiStore.getState().setError("Error de conexión al cargar pedidos.");
        set({ orders: [], isLoading: false });
      }
    }
  },

  startPolling: () => {
    get().stopPolling();
    void get().loadOrders();
    const pollIntervalId = window.setInterval(() => {
      void get().loadOrders({ silent: true });
    }, ORDERS_POLL_INTERVAL_MS);
    set({ pollIntervalId });
  },

  stopPolling: () => {
    const { pollIntervalId } = get();
    if (pollIntervalId !== null) {
      window.clearInterval(pollIntervalId);
      set({ pollIntervalId: null });
    }
  },

  setStatusFilter: (filter) => set({ statusFilter: filter }),

  transitionOrder: async (orderId, targetStatus) => {
    set({ updatingOrderId: orderId });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(`/api/merchant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = (await response.json()) as ServiceOrder & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo actualizar el pedido");
        return;
      }

      set({
        orders: get().orders.map((order) =>
          order.id === orderId ? data : order,
        ),
      });
      useUiStore.getState().setSuccess(
        `Pedido #${orderId} actualizado a "${SERVICE_STATUS_LABELS[data.status]}".`,
      );
      void get().loadOrders({ silent: true });
    } catch {
      useUiStore.getState().setError("Error de conexión al actualizar el pedido.");
    } finally {
      set({ updatingOrderId: null });
    }
  },
}));
