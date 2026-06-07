export type PromotionDiscountType = "PERCENTAGE" | "FIXED";

export interface StorePromotion {
  id: number;
  store_id: number;
  name: string;
  discount_type: PromotionDiscountType;
  discount_value: string;
  product_id: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface CreatePromotionPayload {
  name: string;
  discount_type: PromotionDiscountType;
  discount_value: string;
  product_id?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export interface UpdatePromotionPayload {
  name?: string;
  discount_type?: PromotionDiscountType;
  discount_value?: string;
  product_id?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}
