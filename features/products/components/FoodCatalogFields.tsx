"use client";

import type { ProductIngredient, ProductVariant } from "@/features/products/types";
import { DEFAULT_FOOD_VARIANTS } from "@/features/products/types";

interface FoodCatalogFieldsProps {
  variants: ProductVariant[];
  ingredients: ProductIngredient[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  onIngredientsChange: (ingredients: ProductIngredient[]) => void;
}

export function FoodCatalogFields({
  variants,
  ingredients,
  onVariantsChange,
  onIngredientsChange,
}: FoodCatalogFieldsProps) {
  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    onVariantsChange(
      variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  }

  function addVariant() {
    onVariantsChange([
      ...variants,
      { name: "", price: "", sort_order: variants.length },
    ]);
  }

  function removeVariant(index: number) {
    onVariantsChange(variants.filter((_, currentIndex) => currentIndex !== index));
  }

  function addDefaultPortions() {
    onVariantsChange(DEFAULT_FOOD_VARIANTS.map((variant) => ({ ...variant })));
  }

  function updateIngredient(index: number, patch: Partial<ProductIngredient>) {
    onIngredientsChange(
      ingredients.map((ingredient, currentIndex) =>
        currentIndex === index ? { ...ingredient, ...patch } : ingredient,
      ),
    );
  }

  function addIngredient() {
    onIngredientsChange([...ingredients, { name: "", is_allergen: false }]);
  }

  function removeIngredient(index: number) {
    onIngredientsChange(
      ingredients.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">Porciones / variantes</h4>
            <p className="text-xs text-zinc-500">Ej. S, M, L, XL con precio distinto.</p>
          </div>
          <button
            type="button"
            data-testid="add-default-variants"
            onClick={addDefaultPortions}
            className="text-sm text-zinc-700 underline hover:text-zinc-900"
          >
            Usar S/M/L/XL
          </button>
        </div>

        <div className="space-y-2" data-testid="product-variants">
          {variants.map((variant, index) => (
            <div
              key={`variant-${index}`}
              data-testid={`variant-row-${index}`}
              className="grid gap-2 rounded-lg border border-zinc-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <input
                data-testid={`variant-name-${index}`}
                placeholder="Nombre (ej. M)"
                value={variant.name}
                onChange={(event) =>
                  updateVariant(index, { name: event.target.value })
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                data-testid={`variant-price-${index}`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Precio"
                value={variant.price}
                onChange={(event) =>
                  updateVariant(index, { price: event.target.value })
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                data-testid={`variant-remove-${index}`}
                onClick={() => removeVariant(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          data-testid="add-variant"
          onClick={addVariant}
          className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
        >
          + Agregar variante
        </button>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-zinc-900">Ingredientes</h4>
          <p className="text-xs text-zinc-500">Marca alérgenos cuando aplique.</p>
        </div>

        <div className="space-y-2" data-testid="product-ingredients">
          {ingredients.map((ingredient, index) => (
            <div
              key={`ingredient-${index}`}
              data-testid={`ingredient-row-${index}`}
              className="grid gap-2 rounded-lg border border-zinc-200 p-3 sm:grid-cols-[1fr_auto_auto]"
            >
              <input
                data-testid={`ingredient-name-${index}`}
                placeholder="Ingrediente"
                value={ingredient.name}
                onChange={(event) =>
                  updateIngredient(index, { name: event.target.value })
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  data-testid={`ingredient-allergen-${index}`}
                  type="checkbox"
                  checked={ingredient.is_allergen}
                  onChange={(event) =>
                    updateIngredient(index, { is_allergen: event.target.checked })
                  }
                />
                Alérgeno
              </label>
              <button
                type="button"
                data-testid={`ingredient-remove-${index}`}
                onClick={() => removeIngredient(index)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          data-testid="add-ingredient"
          onClick={addIngredient}
          className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
        >
          + Agregar ingrediente
        </button>
      </section>
    </div>
  );
}
