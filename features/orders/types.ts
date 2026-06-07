export type OrderType = "delivery" | "service";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export type DeliveryOrderStatus =
  | "created"
  | "accepted_by_merchant"
  | "in_preparation"
  | "ready_for_pickup"
  | "searching_driver"
  | "driver_assigned"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export interface DeliveryOrder {
  id: number;
  customer_id: number;
  store_id: number;
  driver_id: number | null;
  status: DeliveryOrderStatus;
  order_type: "delivery";
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

export const DELIVERY_STATUS_LABELS: Record<DeliveryOrderStatus, string> = {
  created: "Nuevo",
  accepted_by_merchant: "Aceptado",
  in_preparation: "En preparación",
  ready_for_pickup: "Listo para recoger",
  searching_driver: "Buscando conductor",
  driver_assigned: "Conductor asignado",
  picked_up: "Recogido",
  on_the_way: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const DELIVERY_STATUS_FILTERS: Array<{
  value: "all" | DeliveryOrderStatus;
  label: string;
}> = [
  { value: "all", label: "Todos" },
  { value: "created", label: "Nuevos" },
  { value: "accepted_by_merchant", label: "Aceptados" },
  { value: "in_preparation", label: "En preparación" },
  { value: "ready_for_pickup", label: "Listos" },
  { value: "searching_driver", label: "Buscando conductor" },
  { value: "driver_assigned", label: "Conductor asignado" },
  { value: "picked_up", label: "Recogidos" },
  { value: "on_the_way", label: "En camino" },
  { value: "delivered", label: "Entregados" },
  { value: "cancelled", label: "Cancelados" },
];

export function formatOrderItemsSummary(items: OrderItem[]): string {
  if (items.length === 0) {
    return "Sin ítems";
  }

  const preview = items
    .slice(0, 2)
    .map((item) => `${item.quantity}x ${item.product_name}`)
    .join(", ");

  if (items.length > 2) {
    return `${preview} +${items.length - 2} más`;
  }

  return preview;
}

export interface DeliveryOrderAction {
  label: string;
  targetStatus: DeliveryOrderStatus;
}

export function getDeliveryOrderAction(
  status: DeliveryOrderStatus,
): DeliveryOrderAction | null {
  switch (status) {
    case "created":
      return { label: "Aceptar", targetStatus: "accepted_by_merchant" };
    case "accepted_by_merchant":
      return { label: "En preparación", targetStatus: "in_preparation" };
    case "in_preparation":
      return { label: "Preparado", targetStatus: "ready_for_pickup" };
    default:
      return null;
  }
}
