"use client";

import type { CategoryFieldConfigRow } from "@/features/categories/types";

interface CategoryFieldConfigEditorProps {
  rows: CategoryFieldConfigRow[];
  onChange: (rows: CategoryFieldConfigRow[]) => void;
}

const emptyRow = (): CategoryFieldConfigRow => ({
  key: "",
  type: "multi_select",
  options: "",
});

export function CategoryFieldConfigEditor({
  rows,
  onChange,
}: CategoryFieldConfigEditorProps) {
  function updateRow(index: number, patch: Partial<CategoryFieldConfigRow>) {
    onChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  return (
    <div
      data-testid="category-field-config-editor"
      className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-800">Parámetros del producto</p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Opciones que heredan los productos de esta categoría (tallas, colores, etc.).
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">Sin parámetros configurados.</p>
      ) : null}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={`field-row-${index}`}
            data-testid={`category-field-row-${index}`}
            className="space-y-3 rounded-lg border border-zinc-200 bg-white p-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-zinc-600">
                Nombre del parámetro
                <input
                  data-testid={`category-field-key-${index}`}
                  value={row.key}
                  onChange={(event) => updateRow(index, { key: event.target.value })}
                  placeholder="talla, masa, color"
                  className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-zinc-600">
                Tipo
                <select
                  data-testid={`category-field-type-${index}`}
                  value={row.type}
                  onChange={(event) =>
                    updateRow(index, {
                      type: event.target.value as CategoryFieldConfigRow["type"],
                    })
                  }
                  className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
                >
                  <option value="multi_select">Varias opciones</option>
                  <option value="single_select">Una opción</option>
                  <option value="free_text">Texto libre</option>
                </select>
              </label>
            </div>

            {row.type !== "free_text" ? (
              <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-zinc-600">
                Opciones (separadas por coma)
                <input
                  data-testid={`category-field-options-${index}`}
                  value={row.options}
                  onChange={(event) => updateRow(index, { options: event.target.value })}
                  placeholder="S, M, L, XL"
                  className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal"
                />
              </label>
            ) : null}

            <div className="flex justify-end border-t border-zinc-100 pt-2">
              <button
                type="button"
                data-testid={`category-field-remove-${index}`}
                onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Quitar parámetro
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        data-testid="category-field-add"
        onClick={() => onChange([...rows, emptyRow()])}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 sm:w-auto"
      >
        + Agregar parámetro
      </button>
    </div>
  );
}
