export interface Banner {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface CreateBannerPayload {
  title: string;
  image_url: string;
  link_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export type UpdateBannerPayload = Partial<CreateBannerPayload>;
