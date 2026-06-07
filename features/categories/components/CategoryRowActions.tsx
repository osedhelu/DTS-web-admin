"use client";

import { useState } from "react";

interface CategoryRowActionsProps {
  categoryId: number;
  parentId: number | null;
  initialName: string;
  storeId: number;
  onUpdate: (
    categoryId: number,
    name: string,
    parentId: number | null,
  ) => Promise<boolean>;
  onDelete: (categoryId: number, parentId: number | null) => Promise<boolean>;
}

export function CategoryRowActions({
  categoryId,
  parentId,
  initialName,
  storeId,
  onUpdate,
  onDelete,
}: CategoryRowActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    const saved = await onUpdate(categoryId, name, parentId);
    setIsSaving(false);

    if (saved) {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          data-testid={`category-edit-input-${categoryId}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 text-sm"
        />
        <button
          type="button"
          data-testid={`category-save-${categoryId}`}
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => {
            setName(initialName);
            setIsEditing(false);
          }}
          className="text-sm text-zinc-500 hover:underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      <button
        type="button"
        data-testid={`category-edit-${categoryId}`}
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-zinc-900 hover:underline"
      >
        Editar
      </button>
      <button
        type="button"
        data-testid={`category-delete-${categoryId}`}
        onClick={() => void onDelete(categoryId, parentId)}
        className="text-sm text-red-600 hover:text-red-700"
      >
        Eliminar
      </button>
      <span className="sr-only">store-{storeId}</span>
    </div>
  );
}
