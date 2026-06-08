"use client";

import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

interface MerchantStoreSelectorProps {
  /** Oculta el selector cuando solo hay una tienda (solo muestra el nombre). */
  compact?: boolean;
}

export function MerchantStoreSelector({
  compact = false,
}: MerchantStoreSelectorProps) {
  const stores = useMerchantSessionStore((state) => state.stores);
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const setActiveStoreId = useMerchantSessionStore(
    (state) => state.setActiveStoreId,
  );
  const isLoadingStores = useMerchantSessionStore(
    (state) => state.isLoadingStores,
  );

  if (isLoadingStores) {
    return (
      <span className="text-xs text-zinc-500">Cargando tienda…</span>
    );
  }

  if (stores.length === 0) {
    return null;
  }

  if (stores.length === 1) {
    return (
      <span
        className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200"
        data-testid="merchant-active-store"
      >
        Tienda: <span className="font-semibold text-zinc-900">{stores[0].name}</span>
      </span>
    );
  }

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
      Tienda
      <select
        data-testid="merchant-store-selector"
        value={activeStoreId ?? ""}
        onChange={(event) => setActiveStoreId(Number(event.target.value))}
        className={`rounded-lg border border-zinc-300 bg-white px-3 py-1.5 font-normal text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 ${
          compact ? "max-w-xs" : "max-w-sm"
        }`}
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>
    </label>
  );
}
