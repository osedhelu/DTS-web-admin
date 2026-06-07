import type { StoreVertical } from "@/features/onboarding/types";

export const VERTICAL_OPTIONS: {
  value: StoreVertical;
  label: string;
  description: string;
}[] = [
  {
    value: "FOOD",
    label: "Comida",
    description: "Restaurantes, comida rápida, repostería",
  },
  {
    value: "SERVICES",
    label: "Servicios",
    description: "Limpieza, plomería, belleza a domicilio",
  },
  {
    value: "RETAIL",
    label: "Retail",
    description: "Productos hogar, ferretería, miscelánea",
  },
];

/** Espejo de backend category_templates.py */
export const CATEGORY_TEMPLATES: Record<StoreVertical, string[]> = {
  FOOD: ["Comida rápida", "Restaurante"],
  SERVICES: ["Servicios del hogar", "Servicios personales"],
  RETAIL: ["Productos hogar", "Electrónica"],
};

export function getDefaultTemplate(vertical: StoreVertical): string {
  return CATEGORY_TEMPLATES[vertical][0] ?? "";
}
