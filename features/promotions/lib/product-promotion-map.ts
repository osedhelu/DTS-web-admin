import { formatPromotionSummary } from "@/features/promotions/components/PromotionForm";
import type { StorePromotion } from "@/features/promotions/types";

export interface ProductPromotionMaps {
  byOption: Record<string, Record<string, StorePromotion>>;
  productWide: StorePromotion[];
}

export function isPromotionActiveForDisplay(promotion: StorePromotion): boolean {
  return promotion.is_active;
}

export function buildProductPromotionMaps(
  promotions: StorePromotion[],
  productId: number,
): ProductPromotionMaps {
  const byOption: Record<string, Record<string, StorePromotion>> = {};
  const productWide: StorePromotion[] = [];

  for (const promotion of promotions) {
    if (!isPromotionActiveForDisplay(promotion)) {
      continue;
    }

    if (promotion.product_id !== productId) {
      continue;
    }

    if (promotion.param_key && promotion.param_value) {
      if (!byOption[promotion.param_key]) {
        byOption[promotion.param_key] = {};
      }
      byOption[promotion.param_key][promotion.param_value] = promotion;
      continue;
    }

    productWide.push(promotion);
  }

  return { byOption, productWide };
}

export function formatOptionPromotionLabel(promotion: StorePromotion): string {
  return formatPromotionSummary(promotion);
}

/** Etiqueta corta para badge superpuesto (ej. 10%, $5) */
export function formatOverlayPromotionLabel(promotion: StorePromotion): string {
  const value = Number(promotion.discount_value);
  if (promotion.discount_type === "PERCENTAGE") {
    if (Number.isNaN(value)) {
      return `${promotion.discount_value}%`;
    }
    const normalized = Number.isInteger(value) ? value : parseFloat(value.toFixed(1));
    return `${normalized}%`;
  }

  if (Number.isNaN(value)) {
    return `$${promotion.discount_value}`;
  }

  const normalized = Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
  return `$${normalized}`;
}

export function promotionEditHref(promotionId: number): string {
  return `/merchant/promotions?promotionId=${promotionId}`;
}
