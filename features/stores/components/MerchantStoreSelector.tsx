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
    return <p className="text-sm text-zinc-500">Cargando tienda…</p>;
  }

  if (stores.length === 0) {
    return null;
  }

  if (stores.length === 1) {
    return (
      <p className="text-sm text-zinc-600" data-testid="merchant-active-store">
        Tienda: <span className="font-medium">{stores[0].name}</span>
      </p>
    );
  }

  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      Tienda
      <select
        data-testid="merchant-store-selector"
        value={activeStoreId ?? ""}
        onChange={(event) => setActiveStoreId(Number(event.target.value))}
        className={`rounded-lg border border-zinc-300 px-3 py-2 font-normal ${
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
