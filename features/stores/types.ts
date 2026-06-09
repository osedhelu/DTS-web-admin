export type StoreVertical = "FOOD" | "SERVICES" | "RETAIL";

export interface Store {
  id: number;
  name: string;
  owner_id: number;
  status: string;
  vertical: StoreVertical;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  phone: string;
  logo_url: string;
  is_open: boolean;
}

export interface UpdateStoreProfilePayload {
  name?: string;
  description?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  logo?: File | null;
}
