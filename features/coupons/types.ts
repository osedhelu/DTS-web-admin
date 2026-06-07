export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_total: string;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponPayload {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  min_order_total: string;
  max_uses: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export type UpdateCouponPayload = Partial<CreateCouponPayload>;
