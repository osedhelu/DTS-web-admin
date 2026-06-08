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
      <div>
        <p className="text-sm font-medium text-zinc-800">Parámetros del producto</p>
        <p className="text-xs text-zinc-500">
          Define las opciones disponibles en la categoría. Los productos elegirán cuáles
          ofrecen (ej. tallas S, M, L en &quot;Ropa&quot; se heredan en pantalones y camisas).
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">Sin parámetros configurados.</p>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={`field-row-${index}`}
          data-testid={`category-field-row-${index}`}
          className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:grid-cols-[1fr_auto_1fr_auto]"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Nombre del parámetro
            <input
              data-testid={`category-field-key-${index}`}
              value={row.key}
              onChange={(event) => updateRow(index, { key: event.target.value })}
              placeholder="talla, masa, color"
              className="rounded border border-zinc-300 px-2 py-1.5 text-sm font-normal"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600">
            Tipo
            <select
              data-testid={`category-field-type-${index}`}
              value={row.type}
              onChange={(event) =>
                updateRow(index, {
                  type: event.target.value as CategoryFieldConfigRow["type"],
                })
              }
              className="rounded border border-zinc-300 px-2 py-1.5 text-sm font-normal"
            >
              <option value="multi_select">Varias opciones (tallas, colores…)</option>
              <option value="single_select">Una sola opción</option>
              <option value="free_text">Texto libre</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-600 sm:col-span-1">
            Opciones (separadas por coma)
            <input
              data-testid={`category-field-options-${index}`}
              value={row.options}
              disabled={row.type === "free_text"}
              onChange={(event) => updateRow(index, { options: event.target.value })}
              placeholder="S, M, L, XL"
              className="rounded border border-zinc-300 px-2 py-1.5 text-sm font-normal disabled:bg-zinc-100"
            />
          </label>

          <button
            type="button"
            data-testid={`category-field-remove-${index}`}
            onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
            className="self-end rounded border border-red-200 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Quitar
          </button>
        </div>
      ))}

      <button
        type="button"
        data-testid="category-field-add"
        onClick={() => onChange([...rows, emptyRow()])}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
      >
        + Agregar parámetro
      </button>
    </div>
  );
}
