import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Product } from "@/features/products/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  loadProducts: (storeId: number) => Promise<void>;
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  deactivateProduct: (storeId: number, productId: number) => Promise<boolean>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: false,

  loadProducts: async (storeId) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products`,
      );
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

  addProduct: (product) => {
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
}));
