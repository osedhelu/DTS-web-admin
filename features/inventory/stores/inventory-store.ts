import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { Product } from "@/features/products/types";
import type { PaginatedResponse } from "@/lib/api/types";

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  loadInventory: (storeId: number) => Promise<void>;
  updateProductStock: (product: Product) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoading: false,

  loadInventory: async (storeId) => {
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
        useUiStore.getState().setError(data.detail ?? "No se pudo cargar el inventario");
        set({ products: [], isLoading: false });
        return;
      }

      set({ products: data.results, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar inventario.");
      set({ products: [], isLoading: false });
    }
  },

  updateProductStock: (product) => {
    set({
      products: get().products.map((item) =>
        item.id === product.id ? product : item,
      ),
    });
    useUiStore.getState().setSuccess(
      `Stock de "${product.name}" actualizado a ${product.stock} unidades.`,
    );
  },
}));
