"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CategorySelector } from "@/features/products/components/CategorySelector";
import { DynamicProductFields } from "@/features/products/components/DynamicProductFields";
import {
  isMultiSelectRule,
  normalizeDynamicValueForForm,
  resolveProductFieldConfig,
  syncDynamicValues,
  type DynamicValues,
} from "@/features/products/lib/dynamic-fields";
import { ProductFormScreen } from "@/features/products/components/ProductFormScreen";
import { ProductImageGallery } from "@/features/products/components/ProductImageGallery";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import { useProductsStore } from "@/features/products/stores/products-store";
import type {
  ProductDetail,
  ProductImage,
  UpdateProductInput,
} from "@/features/products/types";
import { useUiStore } from "@/lib/stores/ui-store";

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
  const categories = useCategoriesStore((state) => state.categories);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);
  const setSuccess = useUiStore((state) => state.setSuccess);

  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [fields, setFields] = useState<ProductFormFields | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dynamicValues, setDynamicValues] = useState<DynamicValues>({});
  const hydratedProductIdRef = useRef<number | null>(null);
  const lastCategoryKeyRef = useRef("");

  const categoryKey =
    fields === null ? "" : `${fields.categoryId ?? "null"}:${fields.subcategoryId ?? "null"}`;

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
  }, [loadCategories, storeId]);

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
        setFields(mapDetailToForm(loaded));

        const pendingSuccess = sessionStorage.getItem("product-create-success");
        if (pendingSuccess) {
          sessionStorage.removeItem("product-create-success");
          setSuccess(pendingSuccess);
        }
      }

      setIsLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [loadProductDetail, productId, storeId]);

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
          const selected = dynamicValues[key];
          if (!Array.isArray(selected) || selected.length === 0) {
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
      setDetail(updated);
      setFields(mapDetailToForm(updated));
      setSuccess(`Producto "${updated.name}" actualizado correctamente.`);
    }
  }

  async function handleUpload(file: File): Promise<ProductImage | null> {
    setIsUploading(true);
    const image = await uploadProductImage(storeId, productId, file, true);
    setIsUploading(false);

    if (image && fields) {
      setFields({
        ...fields,
        images: [...fields.images.filter((item) => item.id !== image.id), image],
      });
    }

    return image;
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

        <DynamicProductFields
          fieldConfig={activeFieldConfig}
          values={dynamicValues}
          onChange={setDynamicValues}
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

      <ProductImageGallery
        images={fields.images}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </ProductFormScreen>
  );
}
