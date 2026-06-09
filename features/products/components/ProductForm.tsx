"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { CategorySelector } from "@/features/products/components/CategorySelector";
import { DynamicProductFields } from "@/features/products/components/DynamicProductFields";
import {
  getSelectedOptions,
  isMultiSelectRule,
  resolveProductFieldConfig,
  syncDynamicValues,
  type DynamicValues,
} from "@/features/products/lib/dynamic-fields";
import { ProductFormScreen } from "@/features/products/components/ProductFormScreen";
import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import type { CreateProductInput, Product } from "@/features/products/types";

interface ProductFormProps {
  onCreated: (product: Product) => void;
  storeId: number;
}

const initialState = {
  name: "",
  price: "",
  stock: "0",
  durationMinutes: "",
  description: "",
  categoryId: null as number | null,
  subcategoryId: null as number | null,
};

export function ProductForm({ onCreated, storeId }: ProductFormProps) {
  const categories = useCategoriesStore((state) => state.categories);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);

  const [productType, setProductType] = useState<"physical" | "service">("physical");
  const [fields, setFields] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawDynamicValues, setRawDynamicValues] = useState<DynamicValues>({});

  const activeFieldConfig = useMemo(
    () =>
      resolveProductFieldConfig(categories, fields.categoryId, fields.subcategoryId),
    [categories, fields.categoryId, fields.subcategoryId],
  );

  const dynamicValues = useMemo(
    () => syncDynamicValues(activeFieldConfig, rawDynamicValues),
    [activeFieldConfig, rawDynamicValues],
  );

  useEffect(() => {
    void loadCategories(storeId);
  }, [loadCategories, storeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

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

    const dynamicPayload =
      Object.keys(activeFieldConfig).length > 0 ? dynamicValues : undefined;

    const payload: CreateProductInput =
      productType === "service"
        ? {
            product_type: "service",
            name: fields.name.trim(),
            price: fields.price,
            description: fields.description,
            duration_minutes: fields.durationMinutes
              ? Number(fields.durationMinutes)
              : null,
            category_id: fields.categoryId,
            subcategory_id: fields.subcategoryId,
            dynamic_values: dynamicPayload,
          }
        : {
            product_type: "physical",
            name: fields.name.trim(),
            price: fields.price,
            stock: Number(fields.stock) || 0,
            description: fields.description,
            category_id: fields.categoryId,
            subcategory_id: fields.subcategoryId,
            dynamic_values: dynamicPayload,
          };

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as Product & { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo crear el ítem");
        return;
      }

      onCreated(data);
      setFields(initialState);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProductFormScreen
      title="Nuevo producto o servicio"
      subtitle="Elige el tipo y completa los campos del catálogo."
    >
      <UiFeedback successTestId="product-create-success-message" />

      <form
        onSubmit={handleSubmit}
        data-testid="product-form"
        className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
      >
      <fieldset className="flex gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="radio"
            name="product_type"
            value="physical"
            checked={productType === "physical"}
            onChange={() => setProductType("physical")}
            data-testid="product-type-physical"
          />
          Producto físico
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <input
            type="radio"
            name="product_type"
            value="service"
            checked={productType === "service"}
            onChange={() => setProductType("service")}
            data-testid="product-type-service"
          />
          Servicio
        </label>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre
        <input
          data-testid="product-name"
          required
          value={fields.name}
          onChange={(event) =>
            setFields((current) => ({ ...current, name: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Precio
        <input
          data-testid="product-price"
          required
          type="number"
          min="0.01"
          step="0.01"
          value={fields.price}
          onChange={(event) =>
            setFields((current) => ({ ...current, price: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        />
      </label>

      <CategorySelector
        categories={categories}
        categoryId={fields.categoryId}
        subcategoryId={fields.subcategoryId}
        onCategoryChange={(categoryId) =>
          setFields((current) => ({
            ...current,
            categoryId,
            subcategoryId: null,
          }))
        }
        onSubcategoryChange={(subcategoryId) =>
          setFields((current) => ({ ...current, subcategoryId }))
        }
      />

      <DynamicProductFields
        fieldConfig={activeFieldConfig}
        values={dynamicValues}
        onChange={setRawDynamicValues}
      />

      {productType === "physical" ? (
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Stock inicial
          <input
            data-testid="product-stock"
            type="number"
            min="0"
            value={fields.stock}
            onChange={(event) =>
              setFields((current) => ({ ...current, stock: event.target.value }))
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Duración estimada (minutos)
          <input
            data-testid="product-duration"
            type="number"
            min="1"
            value={fields.durationMinutes}
            onChange={(event) =>
              setFields((current) => ({
                ...current,
                durationMinutes: event.target.value,
              }))
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Descripción
        <textarea
          data-testid="product-description"
          rows={3}
          value={fields.description}
          onChange={(event) =>
            setFields((current) => ({
              ...current,
              description: event.target.value,
            }))
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
        data-testid="product-submit"
        disabled={isSubmitting}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Crear ítem"}
      </button>
      </form>
    </ProductFormScreen>
  );
}
