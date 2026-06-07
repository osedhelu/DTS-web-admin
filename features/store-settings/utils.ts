import type { StoreVertical } from "@/features/stores/types";

export function formatStoreVertical(vertical: StoreVertical): string {
  switch (vertical) {
    case "FOOD":
      return "Comida";
    case "SERVICES":
      return "Servicios";
    case "RETAIL":
      return "Retail";
    default:
      return vertical;
  }
}
