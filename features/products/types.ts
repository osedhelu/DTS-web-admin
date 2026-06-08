export type ProductType = "physical" | "service";

export interface ProductVariant {
  id?: number;
  name: string;
  price: string;
  sort_order: number;
}

export interface ProductIngredient {
  id?: number;
  name: string;
  is_allergen: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  is_primary: boolean;
}

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
  dynamic_values?: Record<string, string | string[]>;
  primary_image_url?: string | null;
}

export interface ProductDetail extends Product {
  variants: ProductVariant[];
  ingredients: ProductIngredient[];
  images: ProductImage[];
}

export interface CreatePhysicalProductInput {
  product_type: "physical";
  name: string;
  price: string;
  stock?: number;
  description?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  dynamic_values?: Record<string, string | string[]>;
}

export interface CreateServiceInput {
  product_type: "service";
  name: string;
  price: string;
  duration_minutes?: number | null;
  description?: string;
  category_id?: number | null;
  subcategory_id?: number | null;
  dynamic_values?: Record<string, string | string[]>;
}

export type CreateProductInput = CreatePhysicalProductInput | CreateServiceInput;

export interface UpdateProductInput {
  name?: string;
  price?: string;
  description?: string;
  stock?: number;
  category_id?: number | null;
  subcategory_id?: number | null;
  duration_minutes?: number | null;
  dynamic_values?: Record<string, string | string[]>;
}
