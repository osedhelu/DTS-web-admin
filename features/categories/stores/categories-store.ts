import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  CategoryTreeNode,
  Subcategory,
} from "@/features/categories/types";

interface CategoriesState {
  categories: CategoryTreeNode[];
  isLoading: boolean;
  loadCategories: (storeId: number) => Promise<void>;
  addCategory: (category: CategoryTreeNode) => void;
  addSubcategory: (parentId: number, subcategory: Subcategory) => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  isLoading: false,

  loadCategories: async (storeId) => {
    set({ isLoading: true });
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories`,
      );
      const data = (await response.json()) as CategoryTreeNode[] & {
        detail?: string;
      };

      if (!response.ok) {
        const detail = (data as { detail?: string }).detail;
        useUiStore.getState().setError(
          detail ?? "No se pudieron cargar las categorías",
        );
        set({ categories: [], isLoading: false });
        return;
      }

      set({ categories: data, isLoading: false });
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar categorías.");
      set({ categories: [], isLoading: false });
    }
  },

  addCategory: (category) => {
    set({ categories: [...get().categories, category] });
    useUiStore.getState().setSuccess(
      `Categoría "${category.name}" creada correctamente.`,
    );
  },

  addSubcategory: (parentId, subcategory) => {
    set({
      categories: get().categories.map((category) =>
        category.id === parentId
          ? {
              ...category,
              subcategories: [...category.subcategories, subcategory],
            }
          : category,
      ),
    });
    useUiStore.getState().setSuccess(
      `Subcategoría "${subcategory.name}" creada correctamente.`,
    );
  },
}));
