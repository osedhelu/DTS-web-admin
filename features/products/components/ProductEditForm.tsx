"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CategorySelector } from "@/features/products/components/CategorySelector";
import { DynamicProductFields } from "@/features/products/components/DynamicProductFields";
import { ProductPromotionsSection } from "@/features/products/components/ProductPromotionsSection";
import {
  isMultiSelectRule,
  normalizeDynamicValueForForm,
  getSelectedOptions,
  resolveProductFieldConfig,
  syncDynamicValues,
  type DynamicValues,
} from "@/features/products/lib/dynamic-fields";
import { ProductFormScreen } from "@/features/products/components/ProductFormScreen";
import { ProductImageGallery } from "@/features/products/components/ProductImageGallery";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { resolvePrimaryImageUrl } from "@/features/products/lib/primary-image";
import { useProductsStore } from "@/features/products/stores/products-store";
import { buildProductPromotionMaps } from "@/features/promotions/lib/product-promotion-map";
import { usePromotionsStore } from "@/features/promotions/stores/promotions-store";
import type {
  ProductDetail,
  ProductImage,
  UpdateProductInput,
} from "@/features/products/types";
import { useUiStore } from "@/lib/stores/ui-store";
import {
  clearFormDraft,
  readFormDraft,
  useFormDraftPersistence,
} from "@/lib/hooks/use-form-draft";

interface ProductEditFormProps {
  storeId: number;
  productId: number;
}

interface ProductFormFields {
  name: string;
  price: string;
  stock: string;
  durationMinutes: string;
  description: string;
  categoryId: number | null;
  subcategoryId: number | null;
  images: ProductImage[];
}

type ProductEditDraftFields = Omit<ProductFormFields, "images">;

type ProductEditDraft = {
  fields: ProductEditDraftFields;
  dynamicValues: DynamicValues;
};

const emptyEditDraftFields = (): ProductEditDraftFields => ({
  name: "",
  price: "",
  stock: "0",
  durationMinutes: "",
  description: "",
  categoryId: null,
  subcategoryId: null,
});

function mapDetailToForm(detail: ProductDetail): ProductFormFields {
  return {
    name: detail.name,
    price: detail.price,
    stock: String(detail.stock),
    durationMinutes: detail.duration_minutes ? String(detail.duration_minutes) : "",
    description: detail.description,
    categoryId: detail.category_id,
    subcategoryId: detail.subcategory_id,
    images: detail.images,
  };
}

export function ProductEditForm({ storeId, productId }: ProductEditFormProps) {
  const loadProductDetail = useProductsStore((state) => state.loadProductDetail);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const uploadProductImage = useProductsStore((state) => state.uploadProductImage);
  const deleteProductImage = useProductsStore((state) => state.deleteProductImage);
  const setPrimaryProductImage = useProductsStore((state) => state.setPrimaryProductImage);
  const replaceProductImage = useProductsStore((state) => state.replaceProductImage);
  const upsertProduct = useProductsStore((state) => state.upsertProduct);
  const categories = useCategoriesStore((state) => state.categories);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const loadPromotions = usePromotionsStore((state) => state.loadPromotions);
  const promotions = usePromotionsStore((state) => state.promotions);
  const setSuccess = useUiStore((state) => state.setSuccess);

  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [fields, setFields] = useState<ProductFormFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dynamicValues, setDynamicValues] = useState<DynamicValues>({});
  const hydratedProductIdRef = useRef<number | null>(null);
  const lastCategoryKeyRef = useRef("");

  const categoryKey =
    fields === null ? "" : `${fields.categoryId ?? "null"}:${fields.subcategoryId ?? "null"}`;

  const draftScope = `product-edit:${storeId}:${productId}`;

  const editDraft = useMemo((): ProductEditDraft | null => {
    if (fields === null) {
      return null;
    }

    const { images: _images, ...fieldDraft } = fields;
    return {
      fields: fieldDraft,
      dynamicValues,
    };
  }, [dynamicValues, fields]);

  const { clearDraft } = useFormDraftPersistence(
    draftScope,
    editDraft ?? { fields: emptyEditDraftFields(), dynamicValues: {} },
    { enabled: !isLoading && editDraft !== null },
  );

  function syncListThumbnail(images: ProductImage[]) {
    if (!detail) {
      return;
    }

    upsertProduct({
      ...detail,
      primary_image_url: resolvePrimaryImageUrl(images, detail.primary_image_url),
    });
  }

  const activeFieldConfig = useMemo(() => {
    if (fields === null) {
      return {};
    }
    return resolveProductFieldConfig(
      categories,
      fields.categoryId,
      fields.subcategoryId,
    );
  }, [categories, fields]);

  useEffect(() => {
    void loadCategories(storeId);
    void loadPromotions(storeId);
  }, [loadCategories, loadPromotions, storeId]);

  const productPromotionMaps = useMemo(
    () => buildProductPromotionMaps(promotions, productId),
    [promotions, productId],
  );

  useEffect(() => {
    if (!detail || fields === null || !categoryKey) {
      return;
    }

    if (hydratedProductIdRef.current !== detail.id) {
      hydratedProductIdRef.current = detail.id;
      lastCategoryKeyRef.current = categoryKey;
      const initial: DynamicValues = {};
      for (const [key, rule] of Object.entries(activeFieldConfig)) {
        initial[key] = normalizeDynamicValueForForm(
          rule,
          detail.dynamic_values?.[key],
        );
      }
      setDynamicValues(initial);
      return;
    }

    if (lastCategoryKeyRef.current !== categoryKey) {
      lastCategoryKeyRef.current = categoryKey;
      setDynamicValues((current) => syncDynamicValues(activeFieldConfig, current));
    }
  }, [detail, categoryKey, activeFieldConfig, fields]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      const loaded = await loadProductDetail(storeId, productId);
      if (!active) {
        return;
      }

      if (loaded) {
        setDetail(loaded);
        const base = mapDetailToForm(loaded);
        const draft = readFormDraft<ProductEditDraft>(draftScope);

        if (draft?.fields) {
          setFields({
            ...base,
            ...draft.fields,
            images: base.images,
          });
          setDynamicValues(draft.dynamicValues ?? {});
          hydratedProductIdRef.current = loaded.id;
          lastCategoryKeyRef.current = `${draft.fields.categoryId ?? "null"}:${draft.fields.subcategoryId ?? "null"}`;
        } else {
          setFields(base);
        }

        const pendingSuccess = sessionStorage.getItem("product-create-success");
        if (pendingSuccess) {
          sessionStorage.removeItem("product-create-success");
          clearFormDraft(draftScope);
          setSuccess(pendingSuccess);
        }
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [loadProductDetail, productId, setSuccess, storeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fields || !detail) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: UpdateProductInput = {
      name: fields.name.trim(),
      price: fields.price,
      description: fields.description,
      category_id: fields.categoryId,
      subcategory_id: fields.subcategoryId,
    };

    if (Object.keys(activeFieldConfig).length > 0) {
      for (const [key, rule] of Object.entries(activeFieldConfig)) {
        if (isMultiSelectRule(rule)) {
          const selected = getSelectedOptions(dynamicValues[key]);
          if (selected.length === 0) {
            setError(`Selecciona al menos una opción para «${key}».`);
            setIsSubmitting(false);
            return;
          }
        }
      }
      payload.dynamic_values = dynamicValues;
    }

    if (detail.product_type === "physical") {
      payload.stock = Number(fields.stock) || 0;
    } else {
      payload.duration_minutes = fields.durationMinutes
        ? Number(fields.durationMinutes)
        : null;
    }

    const updated = await updateProduct(storeId, productId, payload);
    setIsSubmitting(false);

    if (updated) {
      clearDraft();
      setDetail(updated);
      setFields(mapDetailToForm(updated));
      setSuccess(`Producto "${updated.name}" actualizado correctamente.`);
    }
  }

  async function handleUpload(file: File): Promise<ProductImage | null> {
    if (!fields) {
      return null;
    }

    setIsUploading(true);
    const isPrimary = fields.images.length === 0;
    const image = await uploadProductImage(storeId, productId, file, isPrimary);
    setIsUploading(false);

    if (image) {
      const nextImages = isPrimary
        ? [image]
        : [...fields.images, image];
      setFields({
        ...fields,
        images: nextImages,
      });
      syncListThumbnail(nextImages);
    }

    return image;
  }

  async function handleDeleteImage(imageId: number): Promise<boolean> {
    if (!fields) {
      return false;
    }

    setBusyImageId(imageId);
    const deleted = await deleteProductImage(storeId, productId, imageId);
    setBusyImageId(null);

    if (deleted) {
      const remaining = fields.images.filter((item) => item.id !== imageId);
      const hasPrimary = remaining.some((item) => item.is_primary);
      const nextImages = hasPrimary
        ? remaining
        : remaining.map((item, index) => ({
            ...item,
            is_primary: index === 0,
          }));
      setFields({
        ...fields,
        images: nextImages,
      });
      syncListThumbnail(nextImages);
    }

    return deleted;
  }

  async function handleSetPrimary(imageId: number): Promise<ProductImage | null> {
    if (!fields) {
      return null;
    }

    setBusyImageId(imageId);
    const updated = await setPrimaryProductImage(storeId, productId, imageId);
    setBusyImageId(null);

    if (updated) {
      const nextImages = fields.images.map((item) => ({
        ...item,
        is_primary: item.id === imageId,
      }));
      setFields({
        ...fields,
        images: nextImages,
      });
      syncListThumbnail(nextImages);
    }

    return updated;
  }

  async function handleReplaceImage(
    imageId: number,
    file: File,
  ): Promise<ProductImage | null> {
    if (!fields) {
      return null;
    }

    setBusyImageId(imageId);
    const updated = await replaceProductImage(storeId, productId, imageId, file);
    setBusyImageId(null);

    if (updated) {
      const nextImages = fields.images.map((item) =>
        item.id === imageId ? updated : item,
      );
      setFields({
        ...fields,
        images: nextImages,
      });
      syncListThumbnail(nextImages);
    }

    return updated;
  }

  if (isLoading || !fields || !detail) {
    return <p className="text-sm text-zinc-500">Cargando producto…</p>;
  }

  const isPhysical = detail.product_type === "physical";

  return (
    <ProductFormScreen
      title={detail.name}
      subtitle={isPhysical ? "Producto físico" : "Servicio a domicilio"}
    >
      <UiFeedback successTestId="product-edit-success-message" />

      <form
        onSubmit={handleSubmit}
        data-testid="product-edit-form"
        className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Nombre
          <input
            data-testid="product-edit-name"
            required
            value={fields.name}
            onChange={(event) =>
              setFields((current) =>
                current ? { ...current, name: event.target.value } : current,
              )
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Precio base
          <input
            data-testid="product-edit-price"
            required
            type="number"
            min="0.01"
            step="0.01"
            value={fields.price}
            onChange={(event) =>
              setFields((current) =>
                current ? { ...current, price: event.target.value } : current,
              )
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <CategorySelector
          categories={categories}
          categoryId={fields.categoryId}
          subcategoryId={fields.subcategoryId}
          onCategoryChange={(categoryId) =>
            setFields((current) =>
              current
                ? { ...current, categoryId, subcategoryId: null }
                : current,
            )
          }
          onSubcategoryChange={(subcategoryId) =>
            setFields((current) =>
              current ? { ...current, subcategoryId } : current,
            )
          }
        />

        <ProductPromotionsSection
          productWidePromotions={productPromotionMaps.productWide}
        />

        <DynamicProductFields
          fieldConfig={activeFieldConfig}
          values={dynamicValues}
          onChange={setDynamicValues}
          optionPromotions={productPromotionMaps.byOption}
        />

        {isPhysical ? (
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Stock
            <input
              data-testid="product-edit-stock"
              type="number"
              min="0"
              value={fields.stock}
              onChange={(event) =>
                setFields((current) =>
                  current ? { ...current, stock: event.target.value } : current,
                )
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Duración estimada (minutos)
            <input
              data-testid="product-edit-duration"
              type="number"
              min="1"
              value={fields.durationMinutes}
              onChange={(event) =>
                setFields((current) =>
                  current
                    ? { ...current, durationMinutes: event.target.value }
                    : current,
                )
              }
              className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Descripción
          <textarea
            data-testid="product-edit-description"
            rows={4}
            value={fields.description}
            onChange={(event) =>
              setFields((current) =>
                current ? { ...current, description: event.target.value } : current,
              )
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>

        <ProductImageGallery
          images={fields.images}
          onUpload={handleUpload}
          onDelete={handleDeleteImage}
          onSetPrimary={handleSetPrimary}
          onReplace={handleReplaceImage}
          isUploading={isUploading}
          busyImageId={busyImageId}
        />

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          data-testid="product-edit-submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </ProductFormScreen>
  );
}
