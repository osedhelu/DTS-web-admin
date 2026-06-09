import { create } from "@/lib/stores/create-store";
import { useUiStore } from "@/lib/stores/ui-store";
import type { CategoryImage } from "@/features/categories/types";

interface CategoryImagesState {
  uploadCategoryImage: (
    storeId: number,
    categoryId: number,
    file: File,
    isPrimary?: boolean,
  ) => Promise<CategoryImage | null>;
  deleteCategoryImage: (
    storeId: number,
    categoryId: number,
    imageId: number,
  ) => Promise<boolean>;
  setPrimaryCategoryImage: (
    storeId: number,
    categoryId: number,
    imageId: number,
  ) => Promise<CategoryImage | null>;
  replaceCategoryImage: (
    storeId: number,
    categoryId: number,
    imageId: number,
    file: File,
  ) => Promise<CategoryImage | null>;
  loadCategoryImages: (
    storeId: number,
    categoryId: number,
  ) => Promise<CategoryImage[]>;
}

export const useCategoryImagesStore = create<CategoryImagesState>(() => ({
  loadCategoryImages: async (storeId, categoryId) => {
    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}/images`,
      );
      const data = (await response.json()) as CategoryImage[] & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudieron cargar las imágenes");
        return [];
      }

      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al cargar imágenes.");
      return [];
    }
  },

  uploadCategoryImage: async (storeId, categoryId, file, isPrimary = false) => {
    useUiStore.getState().clearMessages();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("is_primary", String(isPrimary));

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}/images`,
        { method: "POST", body: formData },
      );
      const data = (await response.json()) as CategoryImage & { detail?: string };

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

  deleteCategoryImage: async (storeId, categoryId, imageId) => {
    useUiStore.getState().clearMessages();

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}/images/${imageId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const data = (await response.json()) as { detail?: string };
        useUiStore.getState().setError(data.detail ?? "No se pudo eliminar la imagen");
        return false;
      }

      return true;
    } catch {
      useUiStore.getState().setError("Error de conexión al eliminar la imagen.");
      return false;
    }
  },

  setPrimaryCategoryImage: async (storeId, categoryId, imageId) => {
    useUiStore.getState().clearMessages();

    const formData = new FormData();
    formData.append("is_primary", "true");

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}/images/${imageId}`,
        { method: "PATCH", body: formData },
      );
      const data = (await response.json()) as CategoryImage & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo marcar la imagen principal");
        return null;
      }

      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al actualizar la imagen.");
      return null;
    }
  },

  replaceCategoryImage: async (storeId, categoryId, imageId, file) => {
    useUiStore.getState().clearMessages();

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/${categoryId}/images/${imageId}`,
        { method: "PATCH", body: formData },
      );
      const data = (await response.json()) as CategoryImage & { detail?: string };

      if (!response.ok) {
        useUiStore.getState().setError(data.detail ?? "No se pudo reemplazar la imagen");
        return null;
      }

      return data;
    } catch {
      useUiStore.getState().setError("Error de conexión al reemplazar la imagen.");
      return null;
    }
  },
}));
