"use client";

import { useEffect, useMemo, useState } from "react";

import type { CategoryTemplateItem } from "@/features/categories/types";

interface CategoryTemplatePickerProps {
  storeId: number;
  onImportSuccess: (templateName: string) => void;
  onCreateManual: () => void;
}

export function CategoryTemplatePicker({
  storeId,
  onImportSuccess,
  onCreateManual,
}: CategoryTemplatePickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [templates, setTemplates] = useState<CategoryTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importingName, setImportingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      const suffix = debouncedQuery
        ? `?q=${encodeURIComponent(debouncedQuery)}`
        : "";

      try {
        const response = await fetch(
          `/api/merchant/stores/${storeId}/category-templates${suffix}`,
        );
        const data = (await response.json()) as {
          templates?: CategoryTemplateItem[];
          detail?: string;
        };

        if (!active) {
          return;
        }

        if (!response.ok) {
          setTemplates([]);
          setError(data.detail ?? "No se pudieron cargar las plantillas");
          return;
        }

        setTemplates(data.templates ?? []);
      } catch {
        if (active) {
          setTemplates([]);
          setError("Error de conexión al cargar plantillas.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [debouncedQuery, storeId]);

  const availableCount = useMemo(
    () => templates.filter((item) => !item.already_imported).length,
    [templates],
  );

  async function handleImport(templateName: string) {
    setImportingName(templateName);
    setError(null);

    try {
      const response = await fetch(
        `/api/merchant/stores/${storeId}/categories/import-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template_name: templateName }),
        },
      );
      const data = (await response.json()) as { detail?: string };

      if (!response.ok) {
        setError(data.detail ?? "No se pudo importar la plantilla");
        return;
      }

      onImportSuccess(templateName);
    } catch {
      setError("Error de conexión al importar la plantilla.");
    } finally {
      setImportingName(null);
    }
  }

  return (
    <div
      data-testid="category-template-picker"
      className="flex min-h-0 flex-col gap-4"
    >
      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium text-zinc-700">
        Buscar plantilla
        <input
          data-testid="category-template-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej. Restaurante, Entradas, Bebidas…"
          className="w-full min-w-0 rounded-lg border border-zinc-300 px-3 py-2 font-normal"
        />
      </label>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando catálogo DTS…</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-zinc-500" data-testid="category-template-empty">
          No hay plantillas que coincidan. Puedes crear una categoría personalizada.
        </p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {templates.map((template) => (
            <li
              key={template.name}
              data-testid={`category-template-item-${template.name}`}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{template.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Incluye: {template.subcategories.join(", ")}
                  </p>
                  {template.already_imported ? (
                    <span className="mt-2 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                      Ya en tu tienda
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  data-testid={`category-template-import-${template.name}`}
                  disabled={template.already_imported || importingName !== null}
                  onClick={() => void handleImport(template.name)}
                  className="shrink-0 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {importingName === template.name
                    ? "Importando…"
                    : template.already_imported
                      ? "Importada"
                      : "Importar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && availableCount === 0 && templates.length > 0 ? (
        <p className="text-xs text-zinc-500">
          Todas las plantillas visibles ya están en tu tienda.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-5 flex shrink-0 border-t border-zinc-100 bg-white px-5 py-3 sm:-mx-6 sm:px-6">
        <button
          type="button"
          data-testid="category-create-manual"
          onClick={onCreateManual}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Crear categoría personalizada
        </button>
      </div>
    </div>
  );
}
