import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type {
  CategoryRecord,
  CategoryTreeNode,
  Subcategory,
} from "@/features/categories/types";

interface CategoriesState {
  categories: CategoryTreeNode[];
  isLoading: boolean;
  loadCategories: (storeId: number) => Promise<void>;
  addCategory: (category: CategoryTreeNode) => void;
  addSubcategory: (parentId: number, subcategory: Subcategory) => void;
  updateCategory: (
    storeId: number,
    categoryId: number,
    name: string,
    parentId: number | null,
  ) => Promise<boolean>;
  deleteCategory: (
    storeId: number,
    categoryId: number,
    parentId: number | null,
  ) => Promise<boolean>;
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
  },

  updateCategory: async (storeId, categoryId, name, parentId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        },
      );
      const data = (await response.json()) as CategoryRecord & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(
          data.detail ?? "No se pudo actualizar la categoría",
        );
        return false;
      }

      if (parentId === null) {
        set({
          categories: get().categories.map((category) =>
            category.id === categoryId ? { ...category, name: data.name } : category,
          ),
        });
      } else {
        set({
          categories: get().categories.map((category) =>
            category.id === parentId
              ? {
                  ...category,
                  subcategories: category.subcategories.map((subcategory) =>
                    subcategory.id === categoryId
                      ? { ...subcategory, name: data.name }
                      : subcategory,
                  ),
                }
              : category,
          ),
        });
      }

      return true;
    } catch {
      useUiStore.getState().setError(
        "Error de conexión al actualizar la categoría.",
      );
      return false;
    }
  },

  deleteCategory: async (storeId, categoryId, parentId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        useUiStore.getState().setError(
          data.detail ?? "No se pudo eliminar la categoría",
        );
        return false;
      }

      if (parentId === null) {
        set({
          categories: get().categories.filter(
            (category) => category.id !== categoryId,
          ),
        });
      } else {
        set({
          categories: get().categories.map((category) =>
            category.id === parentId
              ? {
                  ...category,
                  subcategories: category.subcategories.filter(
                    (subcategory) => subcategory.id !== categoryId,
                  ),
                }
              : category,
          ),
        });
      }

      return true;
    } catch {
      useUiStore.getState().setError(
        "Error de conexión al eliminar la categoría.",
      );
      return false;
    }
  },
}));
