import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  Product,
  ProductDetail,
  ProductImage,
  UpdateProductInput,
} from "@/features/products/types";
import type { PaginatedResponse } from "@/lib/api/types";

export interface ProductListFilters {
  search?: string;
  type?: "physical" | "service";
}

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  loadProducts: (storeId: number, filters?: ProductListFilters) => Promise<void>;
  loadProductDetail: (storeId: number, productId: number) => Promise<ProductDetail | null>;
  addProduct: (product: Product) => void;
  upsertProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  deactivateProduct: (storeId: number, productId: number) => Promise<boolean>;
  updateProduct: (
    storeId: number,
    productId: number,
    payload: UpdateProductInput,
  ) => Promise<ProductDetail | null>;
  uploadProductImage: (
    storeId: number,
    productId: number,
    file: File,
    isPrimary?: boolean,
  ) => Promise<ProductImage | null>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: false,

  loadProducts: async (storeId, filters = {}) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    const params = new URLSearchParams();
    if (filters.search?.trim()) {
      params.set("search", filters.search.trim());
    }
    if (filters.type) {
      params.set("type", filters.type);
    }

    const query = params.toString();
    const url = query
      ? `/api/merchant/stores/${storeId}/products?${query}`
      : `/api/merchant/stores/${storeId}/products`;

    try {
      const response = await fetch(url);
      const data = (await response.json()) as PaginatedResponse<Product> & {
        detail?: string;
      };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo cargar el catálogo");
        set({ products: [], isLoading: false });
        return;
      }

      set({ products: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar productos.");
      set({ products: [], isLoading: false });
    }
  },

  loadProductDetail: async (storeId, productId) => {
    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products/${productId}`,
      );
      const data = (await response.json()) as ProductDetail & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo cargar el producto");
        return null;
      }

      get().upsertProduct(data);
      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar el producto.");
      return null;
    }
  },

  addProduct: (product) => {
    set({ products: [product, ...get().products] });
  },

  upsertProduct: (product) => {
    const exists = get().products.some((item) => item.id === product.id);
    if (exists) {
      set({
        products: get().products.map((item) =>
          item.id === product.id ? { ...item, ...product } : item,
        ),
      });
      return;
    }

    set({ products: [product, ...get().products] });
  },

  removeProduct: (productId) => {
    set({
      products: get().products.filter((product) => product.id !== productId),
    });
  },

  deactivateProduct: async (storeId, productId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: false }),
        },
      );

      if (!response.ok) {
        useUiStore.getState().setError("No se pudo desactivar el ítem.");
        return false;
      }

      get().removeProduct(productId);
      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al desactivar el ítem.");
      return false;
    }
  },

  updateProduct: async (storeId, productId, payload) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products/${productId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as ProductDetail & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo actualizar el producto");
        return null;
      }

      get().upsertProduct(data);
      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al actualizar el producto.");
      return null;
    }
  },

  uploadProductImage: async (storeId, productId, file, isPrimary = false) => {
    useUiStore.getState().clearMessages();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("is_primary", String(isPrimary));

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products/${productId}/images`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await response.json()) as ProductImage & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo subir la imagen");
        return null;
      }

      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al subir la imagen.");
      return null;
    }
  },
}));
