export interface AdminMapStore {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  vertical: string;
  address: string;
}

export interface AdminMapDelivery {
  order_id: number;
  status: string;
  order_type: string;
  store_id: number;
  store_name: string;
  store_latitude: number;
  store_longitude: number;
  driver_id: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;
  destination_label: string;
  latest_latitude: number | null;
  latest_longitude: number | null;
  latest_recorded_at: string | null;
}

export interface AdminOperationsMapData {
  stores: AdminMapStore[];
  active_deliveries: AdminMapDelivery[];
}

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  accepted_by_merchant: "Aceptado",
  in_preparation: "En preparación",
  ready_for_pickup: "Listo para recoger",
  searching_driver: "Buscando conductor",
  driver_assigned: "Conductor asignado",
  picked_up: "Recogido",
  on_the_way: "En camino",
};
