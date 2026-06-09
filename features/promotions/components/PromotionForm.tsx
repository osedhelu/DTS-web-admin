"use client";

import { useEffect, useMemo, useState } from "react";

import { useCategoriesStore } from "@/features/categories/stores/categories-store";
import {
  getSelectedOptions,
  resolveProductFieldConfig,
} from "@/features/products/lib/dynamic-fields";
import { useProductsStore } from "@/features/products/stores/products-store";
import type { ProductDetail } from "@/features/products/types";
import type {
  CreatePromotionPayload,
  StorePromotion,
  UpdatePromotionPayload,
} from "@/features/promotions/types";

interface PromotionFormProps {
  storeId: number;
  initial?: StorePromotion | null;
  onSubmit: (
    payload: CreatePromotionPayload | UpdatePromotionPayload,
  ) => Promise<boolean>;
  onCancel?: () => void;
  submitLabel?: string;
}

const defaultPayload: CreatePromotionPayload = {
  name: "",
  discount_type: "PERCENTAGE",
  discount_value: "10",
  product_id: null,
  param_key: null,
  param_value: null,
};

function formatDiscountType(type: StorePromotion["discount_type"]): string {
  return type === "PERCENTAGE" ? "Porcentaje" : "Monto fijo";
}

export function PromotionForm({
  storeId,
  initial = null,
  onSubmit,
  onCancel,
  submitLabel,
}: PromotionFormProps) {
  const products = useProductsStore((state) => state.products);
  const loadProducts = useProductsStore((state) => state.loadProducts);
  const loadProductDetail = useProductsStore((state) => state.loadProductDetail);
  const categories = useCategoriesStore((state) => state.categories);
  const loadCategories = useCategoriesStore((state) => state.loadCategories);

  const [payload, setPayload] = useState<CreatePromotionPayload>(
    initial
      ? {
          name: initial.name,
          discount_type: initial.discount_type,
          discount_value: initial.discount_value,
          product_id: initial.product_id,
          param_key: initial.param_key,
          param_value: initial.param_value,
          valid_from: initial.valid_from,
          valid_until: initial.valid_until,
        }
      : defaultPayload,
  );
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);
  const [loadedProductId, setLoadedProductId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProductDetail =
    payload.product_id != null && payload.product_id === loadedProductId
      ? productDetail
      : null;

  useEffect(() => {
    void loadProducts(storeId);
    void loadCategories(storeId);
  }, [loadCategories, loadProducts, storeId]);

  useEffect(() => {
    const productId = payload.product_id;
    if (!productId) {
      return;
    }

    let active = true;
    void loadProductDetail(storeId, productId).then((detail) => {
      if (!active) {
        return;
      }
      setProductDetail(detail);
      setLoadedProductId(productId);
    });

    return () => {
      active = false;
    };
  }, [loadProductDetail, payload.product_id, storeId]);

  const fieldConfig = useMemo(() => {
    if (!activeProductDetail) {
      return {};
    }

    return resolveProductFieldConfig(
      categories,
      activeProductDetail.category_id,
      activeProductDetail.subcategory_id,
    );
  }, [activeProductDetail, categories]);

  const paramKeys = useMemo(
    () => Object.keys(fieldConfig),
    [fieldConfig],
  );

  const paramOptions = useMemo(() => {
    if (!payload.param_key || !activeProductDetail?.dynamic_values) {
      return [] as string[];
    }

    return getSelectedOptions(activeProductDetail.dynamic_values[payload.param_key]);
  }, [payload.param_key, activeProductDetail]);

  const scopeLabel = useMemo(() => {
    if (!payload.product_id) {
      return "Toda la tienda";
    }

    const product = products.find((item) => item.id === payload.product_id);
    if (payload.param_key && payload.param_value) {
      return `${product?.name ?? "Producto"} · ${payload.param_key}=${payload.param_value}`;
    }

    return product?.name ?? "Producto específico";
  }, [payload.param_key, payload.param_value, payload.product_id, products]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const saved = await onSubmit({
      ...payload,
      product_id: payload.product_id ?? null,
      param_key: payload.param_key ?? null,
      param_value: payload.param_value ?? null,
      variant_id: null,
    });
    if (saved && !initial) {
      setPayload(defaultPayload);
      setProductDetail(null);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      data-testid={initial ? "promotion-edit-form" : "promotion-form"}
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        {initial ? "Editar promoción" : "Nueva promoción"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Nombre
        <input
          data-testid="promotion-name"
          required
          value={payload.name}
          onChange={(event) =>
            setPayload((current) => ({ ...current, name: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tipo de descuento
        <select
          data-testid="promotion-discount-type"
          value={payload.discount_type}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              discount_type: event.target.value as CreatePromotionPayload["discount_type"],
            }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="PERCENTAGE">Porcentaje</option>
          <option value="FIXED">Monto fijo</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Valor
        <input
          data-testid="promotion-discount-value"
          required
          type="number"
          min="0"
          step="0.01"
          value={payload.discount_value}
          onChange={(event) =>
            setPayload((current) => ({
              ...current,
              discount_value: event.target.value,
            }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Producto
        <select
          data-testid="promotion-product"
          value={payload.product_id ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            setPayload((current) => ({
              ...current,
              product_id: value ? Number(value) : null,
              param_key: null,
              param_value: null,
            }));
            setLoadedProductId(null);
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        >
          <option value="">Toda la tienda</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      {payload.product_id ? (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Parámetro de categoría (opcional)
            <select
              data-testid="promotion-param-key"
              value={payload.param_key ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setPayload((current) => ({
                  ...current,
                  param_key: value || null,
                  param_value: null,
                }));
              }}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="">Todo el producto</option>
              {paramKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>

          {payload.param_key ? (
            <label className="flex flex-col gap-1 text-sm">
              Opción con descuento
              <select
                data-testid="promotion-param-value"
                value={payload.param_value ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setPayload((current) => ({
                    ...current,
                    param_value: value || null,
                  }));
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2"
              >
                <option value="">Selecciona opción…</option>
                {paramOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {paramOptions.length === 0 ? (
                <span className="text-xs text-zinc-500">
                  Este producto no tiene opciones marcadas para «{payload.param_key}».
                  Edita el producto y configura los parámetros de la categoría.
                </span>
              ) : null}
            </label>
          ) : null}
        </>
      ) : null}

      <p className="text-xs text-zinc-500" data-testid="promotion-scope-label">
        Aplicará a: {scopeLabel}
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          data-testid="promotion-submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : submitLabel ?? (initial ? "Guardar" : "Crear promoción")}
        </button>
        {onCancel ? (
          <button
            type="button"
            data-testid="promotion-cancel"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function formatPromotionSummary(promotion: StorePromotion): string {
  if (promotion.discount_type === "PERCENTAGE") {
    return `${promotion.discount_value}%`;
  }

  return `$${promotion.discount_value}`;
}

export function formatPromotionScope(promotion: StorePromotion): string {
  if (!promotion.product_id) {
    return "Toda la tienda";
  }

  if (promotion.param_key && promotion.param_value) {
    const productLabel = promotion.product_name ?? "Producto";
    return `${productLabel} · ${promotion.param_key}=${promotion.param_value}`;
  }

  return promotion.product_name ?? "Producto";
}

export { formatDiscountType };
