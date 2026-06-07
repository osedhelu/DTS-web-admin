export type OrderType = "delivery" | "service";

export type ServiceOrderStatus =
  | "created"
  | "accepted_by_merchant"
  | "scheduled"
  | "provider_en_route"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface ServiceOrder {
  id: number;
  customer_id: number;
  store_id: number;
  driver_id: number | null;
  status: ServiceOrderStatus;
  order_type: OrderType;
  total: string;
  item_count: number;
  items: OrderItem[];
  service_address: string | null;
  customer_notes: string | null;
  scheduled_at: string | null;
  service_latitude: number | null;
  service_longitude: number | null;
  duration_minutes: number | null;
}

export interface ServiceOrderAction {
  label: string;
  targetStatus: ServiceOrderStatus;
}

export const SERVICE_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  created: "Nuevo",
  accepted_by_merchant: "Aceptado",
  scheduled: "Agendado",
  provider_en_route: "Proveedor en camino",
  in_progress: "En curso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export function getPrimaryServiceAction(
  status: ServiceOrderStatus,
): ServiceOrderAction | null {
  switch (status) {
    case "created":
      return { label: "Aceptar", targetStatus: "accepted_by_merchant" };
    case "accepted_by_merchant":
      return { label: "Agendar", targetStatus: "scheduled" };
    case "scheduled":
      return { label: "Marcar en camino", targetStatus: "provider_en_route" };
    case "provider_en_route":
      return { label: "Iniciar servicio", targetStatus: "in_progress" };
    case "in_progress":
      return { label: "Completar", targetStatus: "completed" };
    default:
      return null;
  }
}

export function canCancelServiceOrder(status: ServiceOrderStatus): boolean {
  return (
    status === "created" ||
    status === "accepted_by_merchant" ||
    status === "scheduled" ||
    status === "provider_en_route"
  );
}
