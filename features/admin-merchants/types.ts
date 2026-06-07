export interface AdminMerchant {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  user_is_active: boolean;
  business_name: string;
  phone: string;
  store_id: number;
  store_name: string;
  store_vertical: string;
  store_is_active: boolean;
  registered_at: string;
}

export interface MerchantFilters {
  email_verified?: boolean;
  is_active?: boolean;
}
