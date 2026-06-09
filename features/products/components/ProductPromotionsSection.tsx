"use client";

import Link from "next/link";

import {
  formatPromotionScope,
  formatPromotionSummary,
} from "@/features/promotions/components/PromotionForm";
import { promotionEditHref } from "@/features/promotions/lib/product-promotion-map";
import type { StorePromotion } from "@/features/promotions/types";

interface ProductPromotionsSectionProps {
  productWidePromotions: StorePromotion[];
}

export function ProductPromotionsSection({
  productWidePromotions,
}: ProductPromotionsSectionProps) {
  if (productWidePromotions.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="product-promotions-section"
      className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
    >
      <div>
        <h4 className="text-sm font-semibold text-emerald-900">
          Promociones de este producto
        </h4>
        <p className="text-xs text-emerald-800/80">
          Descuentos que aplican a todo el producto (no a una opción específica).
        </p>
      </div>

      <ul className="space-y-2">
        {productWidePromotions.map((promotion) => (
          <li
            key={promotion.id}
            data-testid={`product-promotion-${promotion.id}`}
            className="flex flex-col gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-zinc-900">{promotion.name}</p>
              <p className="text-xs text-zinc-500">
                {formatPromotionSummary(promotion)} · {formatPromotionScope(promotion)}
              </p>
            </div>
            <Link
              href={promotionEditHref(promotion.id)}
              data-testid={`product-promotion-link-${promotion.id}`}
              className="shrink-0 text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
            >
              Ver promoción
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
