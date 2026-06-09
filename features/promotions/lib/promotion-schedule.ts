import type { StorePromotion } from "@/features/promotions/types";

export type PromotionScheduleStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "inactive";

export function isoToPromotionDateInput(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  return iso.slice(0, 10);
}

export function promotionDateToIsoStart(date: string | null | undefined): string | null {
  const value = date?.trim();
  if (!value) {
    return null;
  }

  return `${value}T00:00:00.000Z`;
}

export function promotionDateToIsoEnd(date: string | null | undefined): string | null {
  const value = date?.trim();
  if (!value) {
    return null;
  }

  return `${value}T23:59:59.999Z`;
}

export function getPromotionScheduleStatus(
  promotion: StorePromotion,
  now: Date = new Date(),
): PromotionScheduleStatus {
  if (!promotion.is_active) {
    return "inactive";
  }

  const from = promotion.valid_from ? new Date(promotion.valid_from) : null;
  const until = promotion.valid_until ? new Date(promotion.valid_until) : null;

  if (from && now < from) {
    return "scheduled";
  }

  if (until && now > until) {
    return "expired";
  }

  return "active";
}

export function isPromotionCurrentlyApplicable(
  promotion: StorePromotion,
  now: Date = new Date(),
): boolean {
  return getPromotionScheduleStatus(promotion, now) === "active";
}

export function formatPromotionScheduleStatus(status: PromotionScheduleStatus): string {
  switch (status) {
    case "active":
      return "Vigente";
    case "scheduled":
      return "Programada";
    case "expired":
      return "Expirada";
    case "inactive":
      return "Desactivada";
  }
}

export function formatPromotionValidity(promotion: StorePromotion): string {
  const from = isoToPromotionDateInput(promotion.valid_from);
  const until = isoToPromotionDateInput(promotion.valid_until);

  if (!from && !until) {
    return "Sin límite de fechas";
  }

  if (from && until) {
    return `${from} → ${until}`;
  }

  if (from) {
    return `Desde ${from}`;
  }

  return `Hasta ${until}`;
}
