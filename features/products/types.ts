export type ProductType = "physical" | "service";

export interface Product {
  id: number;
  name: string;
  price: string;
  store_id: number;
  product_type: ProductType;
  category_id: number | null;
  subcategory_id: number | null;
  stock: number;
  description: string;
  is_active: boolean;
  requires_on_site_visit: boolean;
  duration_minutes: number | null;
  tracks_stock: boolean;
}

export interface CreatePhysicalProductInput {
  product_type: "physical";
  name: string;
  price: string;
  stock?: number;
  description?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
}

export interface CreateServiceInput {
  product_type: "service";
  name: string;
  price: string;
  duration_minutes?: number | null;
  description?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
}

export type CreateProductInput = CreatePhysicalProductInput | CreateServiceInput;
