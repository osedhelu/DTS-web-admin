"use client";

import { FormEvent, useEffect, useState } from "react";

import { MediaImageGallery } from "@/components/ui/MediaImageGallery";
import { Modal } from "@/components/ui/Modal";
import { CategoryFieldConfigEditor } from "@/features/categories/components/CategoryFieldConfigEditor";
import { CategoryTemplatePicker } from "@/features/categories/components/CategoryTemplatePicker";
import {
  fieldConfigToRows,
  rowsToFieldConfig,
} from "@/features/categories/lib/field-config";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useCategoryImagesStore } from "@/features/categories/stores/category-images-store";
import type {
  CategoryFieldConfig,
  CategoryFieldConfigRow,
  CategoryImage,
  CategoryRecord,
  CategoryTreeNode,
  Subcategory,
} from "@/features/categories/types";
import { useUiStore } from "@/lib/stores/ui-store";

export type CategoryModalState =
  | { mode: "choose-root" }
  | { mode: "create-category" }
  | { mode: "create-subcategory"; parentId: number; parentName: string }
  | {
      mode: "edit";
      categoryId: number;
      parentId: number | null;
      parentName?: string;
      initialName: string;
      initialFieldConfig?: CategoryFieldConfig;
    };

interface CategoryModalProps {
  open: boolean;
  state: CategoryModalState | null;
  storeId: number;
  onClose: () => void;
  onSwitchToCreateCategory: () => void;
  onTemplateImported: (templateName: string) => void;
}

function getCategoryModalKey(state: CategoryModalState): string {
  if (state.mode === "choose-root") {
    return "choose-root";
  }
  if (state.mode === "edit") {
    return `edit-${state.categoryId}`;
  }
  if (state.mode === "create-subcategory") {
    return `create-sub-${state.parentId}`;
  }
  return "create-category";
}

export function CategoryModal({
  open,
  state,
  storeId,
  onClose,
  onSwitchToCreateCategory,
  onTemplateImported,
}: CategoryModalProps) {
  if (!open || !state) {
    return null;
  }

  if (state.mode === "choose-root") {
    return (
      <Modal
        open
        title="Nueva categoría"
        description="Importa una plantilla del catálogo DTS o crea una categoría personalizada."
        onClose={onClose}
        testId="category-modal"
        panelClassName="max-w-lg"
      >
        <CategoryTemplatePicker
          storeId={storeId}
          onImportSuccess={onTemplateImported}
          onCreateManual={onSwitchToCreateCategory}
        />
      </Modal>
    );
  }

  return (
    <CategoryModalForm
      key={getCategoryModalKey(state)}
      state={state}
      storeId={storeId}
      onClose={onClose}
    />
  );
}

interface CategoryModalFormProps {
  state: CategoryModalState;
  storeId: number;
  onClose: () => void;
}

function CategoryModalForm({ state, storeId, onClose }: CategoryModalFormProps) {
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const addSubcategory = useCategoriesStore((s) => s.addSubcategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const loadCategories = useCategoriesStore((s) => s.loadCategories);
  const loadCategoryImages = useCategoryImagesStore((s) => s.loadCategoryImages);
  const uploadCategoryImage = useCategoryImagesStore((s) => s.uploadCategoryImage);
  const deleteCategoryImage = useCategoryImagesStore((s) => s.deleteCategoryImage);
  const setPrimaryCategoryImage = useCategoryImagesStore((s) => s.setPrimaryCategoryImage);
  const replaceCategoryImage = useCategoryImagesStore((s) => s.replaceCategoryImage);
  const setSuccess = useUiStore((s) => s.setSuccess);

  const [name, setName] = useState(() =>
    state.mode === "edit" ? state.initialName : "",
  );
  const [fieldRows, setFieldRows] = useState<CategoryFieldConfigRow[]>(() =>
    state.mode === "edit"
      ? fieldConfigToRows(state.initialFieldConfig ?? {})
      : [],
  );
  const [images, setImages] = useState<CategoryImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(
    () => state.mode === "edit",
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editCategoryId = state.mode === "edit" ? state.categoryId : null;

  useEffect(() => {
    if (editCategoryId == null) {
      return;
    }

    let active = true;

    void loadCategoryImages(storeId, editCategoryId).then((loaded) => {
      if (!active) {
        return;
      }
      setImages(loaded);
      setIsLoadingImages(false);
    });

    return () => {
      active = false;
    };
  }, [editCategoryId, storeId, loadCategoryImages]);

  async function refreshCategoryTree() {
    await loadCategories(storeId);
  }

  const isEdit = state.mode === "edit";
  const isSubcategoryCreate = state.mode === "create-subcategory";
  const isSubcategoryEdit = isEdit && state.parentId !== null;

  const title =
    state.mode === "create-category"
      ? "Nueva categoría"
      : state.mode === "create-subcategory"
        ? "Nueva subcategoría"
        : "Editar categoría";

  const description =
    state.mode === "create-category"
      ? "Agrupa productos o servicios de tu catálogo."
      : state.mode === "create-subcategory"
        ? `Dentro de «${state.parentName}»`
        : isSubcategoryEdit
          ? `Subcategoría de «${state.parentName ?? "categoría padre"}»`
          : "Categoría raíz del catálogo";

  async function handleCreateCategory() {
    const response = await fetch(`/api/merchant/stores/${storeId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = (await response.json()) as CategoryRecord & { detail?: string };

    if (!response.ok) {
      setError(data.detail ?? "No se pudo crear la categoría");
      return false;
    }

    const created: CategoryTreeNode = {
      id: data.id,
      name: data.name,
      subcategories: [],
    };
    addCategory(created);
    setSuccess(`Categoría "${data.name}" creada correctamente.`);
    return true;
  }

  async function handleCreateSubcategory() {
    if (!state || state.mode !== "create-subcategory") {
      return false;
    }

    const response = await fetch(`/api/merchant/stores/${storeId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), parent_id: state.parentId }),
    });
    const data = (await response.json()) as CategoryRecord & { detail?: string };

    if (!response.ok) {
      setError(data.detail ?? "No se pudo crear la subcategoría");
      return false;
    }

    const created: Subcategory = {
      id: data.id,
      name: data.name,
      parent_id: data.parent_id ?? state.parentId,
    };
    addSubcategory(state.parentId, created);
    setSuccess(`Subcategoría "${data.name}" creada correctamente.`);
    return true;
  }

  async function handleEdit() {
    if (!state || state.mode !== "edit") {
      return false;
    }

    const saved = await updateCategory(
      storeId,
      state.categoryId,
      name.trim(),
      state.parentId,
      rowsToFieldConfig(fieldRows),
    );

    if (saved) {
      setSuccess(`Categoría "${name.trim()}" actualizada correctamente.`);
      return true;
    }

    setError("No se pudo actualizar la categoría");
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    let ok = false;
    if (!state) {
      setIsSubmitting(false);
      return;
    }
    if (state.mode === "create-category") {
      ok = await handleCreateCategory();
    } else if (state.mode === "create-subcategory") {
      ok = await handleCreateSubcategory();
    } else {
      ok = await handleEdit();
    }

    setIsSubmitting(false);
    if (ok) {
      onClose();
    }
  }

  async function handleUploadImage(file: File) {
    if (!state || state.mode !== "edit") {
      return null;
    }

    setIsUploadingImage(true);
    const isPrimary = images.length === 0;
    const image = await uploadCategoryImage(
      storeId,
      state.categoryId,
      file,
      isPrimary,
    );
    setIsUploadingImage(false);

    if (image) {
      setImages(
        isPrimary
          ? [image]
          : [...images, image],
      );
      await refreshCategoryTree();
    }

    return image;
  }

  async function handleDeleteImage(imageId: number) {
    if (!state || state.mode !== "edit") {
      return false;
    }

    setBusyImageId(imageId);
    const deleted = await deleteCategoryImage(storeId, state.categoryId, imageId);
    setBusyImageId(null);

    if (deleted) {
      const remaining = images.filter((item) => item.id !== imageId);
      const hasPrimary = remaining.some((item) => item.is_primary);
      setImages(
        hasPrimary
          ? remaining
          : remaining.map((item, index) => ({
              ...item,
              is_primary: index === 0,
            })),
      );
      await refreshCategoryTree();
    }

    return deleted;
  }

  async function handleSetPrimaryImage(imageId: number) {
    if (!state || state.mode !== "edit") {
      return null;
    }

    setBusyImageId(imageId);
    const updated = await setPrimaryCategoryImage(storeId, state.categoryId, imageId);
    setBusyImageId(null);

    if (updated) {
      setImages(
        images.map((item) => ({
          ...item,
          is_primary: item.id === imageId,
        })),
      );
      await refreshCategoryTree();
    }

    return updated;
  }

  async function handleReplaceImage(imageId: number, file: File) {
    if (!state || state.mode !== "edit") {
      return null;
    }

    setBusyImageId(imageId);
    const updated = await replaceCategoryImage(storeId, state.categoryId, imageId, file);
    setBusyImageId(null);

    if (updated) {
      setImages(images.map((item) => (item.id === imageId ? updated : item)));
      await refreshCategoryTree();
    }

    return updated;
  }

  async function handleDelete() {
    if (!state || state.mode !== "edit") {
      return;
    }

    const label = isSubcategoryEdit ? "esta subcategoría" : "esta categoría";
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    const deleted = await deleteCategory(storeId, state.categoryId, state.parentId);
    setIsDeleting(false);

    if (deleted) {
      setSuccess("Categoría eliminada correctamente.");
      onClose();
    } else {
      setError("No se pudo eliminar la categoría");
    }
  }

  const formTestId = isEdit
    ? "category-edit-form"
    : isSubcategoryCreate
      ? "create-subcategory-form"
      : "create-category-form";

  const nameTestId = isEdit
    ? `category-edit-input-${state.mode === "edit" ? state.categoryId : ""}`
    : isSubcategoryCreate
      ? "subcategory-name"
      : "category-name";

  const submitTestId = isEdit
    ? `category-save-${state.mode === "edit" ? state.categoryId : ""}`
    : isSubcategoryCreate
      ? "subcategory-submit"
      : "category-submit";

  return (
    <Modal
      open
      title={title}
      description={description}
      onClose={onClose}
      testId="category-modal"
      panelClassName={isEdit ? "max-w-2xl" : "max-w-lg"}
    >
      <form
        onSubmit={handleSubmit}
        data-testid={formTestId}
        className="flex min-h-0 flex-col gap-4"
      >
        <div className="min-w-0 space-y-4">
        {isSubcategoryCreate ? (
          <input
            type="hidden"
            data-testid="subcategory-parent"
            value={String(state.parentId)}
            readOnly
          />
        ) : null}

        <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid={nameTestId}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={
              isSubcategoryCreate || isSubcategoryEdit
                ? "Ej. Hamburguesas, Pizzas"
                : "Ej. Comida, Bebidas, Limpieza"
            }
            className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        {isEdit ? (
          <CategoryFieldConfigEditor rows={fieldRows} onChange={setFieldRows} />
        ) : null}

        {isEdit ? (
          isLoadingImages ? (
            <p className="text-sm text-zinc-500">Cargando imágenes…</p>
          ) : (
            <MediaImageGallery
              title="Icono de la categoría"
              description="Sube un icono SVG o imagen (PNG, JPG, WebP). Marca uno como principal."
              images={images}
              onUpload={handleUploadImage}
              onDelete={handleDeleteImage}
              onSetPrimary={handleSetPrimaryImage}
              onReplace={handleReplaceImage}
              isUploading={isUploadingImage}
              busyImageId={busyImageId}
              testIdPrefix="category-image"
              accept="image/svg+xml,.svg,image/png,image/jpeg,image/webp"
              uploadLabel="Subir icono"
              emptyLabel="Sin icono"
            />
          )
        ) : null}

        {error ? (
          <p role="alert" className="break-words text-sm text-red-600">
            {error}
          </p>
        ) : null}
        </div>

        <div className="sticky bottom-0 -mx-5 flex shrink-0 flex-wrap items-center gap-2 border-t border-zinc-100 bg-white px-5 py-3 sm:-mx-6 sm:px-6">
          <button
            type="submit"
            data-testid={submitTestId}
            disabled={isSubmitting}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {isSubmitting
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : isSubcategoryCreate
                  ? "Crear subcategoría"
                  : "Crear categoría"}
          </button>

          {isEdit ? (
            <button
              type="button"
              data-testid={`category-delete-${state.categoryId}`}
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              {isDeleting ? "Eliminando…" : "Eliminar"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
