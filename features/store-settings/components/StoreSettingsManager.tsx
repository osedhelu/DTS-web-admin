"use client";

import { useEffect } from "react";

import { StoreSettingsForm } from "@/features/store-settings/components/StoreSettingsForm";
import { useStoreSettingsStore } from "@/features/store-settings/stores/settings-store";
import { useMerchantStoreGuard } from "@/features/stores/hooks/use-merchant-store-guard";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";

export function StoreSettingsManager() {
  const guard = useMerchantStoreGuard();
  const activeStoreId = useMerchantSessionStore((state) => state.activeStoreId);
  const profile = useStoreSettingsStore((state) => state.profile);
  const isLoading = useStoreSettingsStore((state) => state.isLoading);
  const loadProfile = useStoreSettingsStore((state) => state.loadProfile);

  useEffect(() => {
    if (activeStoreId === null) {
      return;
    }

    void loadProfile(activeStoreId);
  }, [activeStoreId, loadProfile]);

  if (!guard.ready) {
    return guard.content;
  }

  const storeId = activeStoreId as number;

  if (isLoading || profile === null) {
    return (
      <p data-testid="store-settings-loading" className="text-sm text-zinc-500">
        Cargando configuración…
      </p>
    );
  }

  return (
    <div data-testid="store-settings-manager">
      <StoreSettingsForm
        key={`${profile.id}-${profile.name}-${profile.description}-${profile.phone}-${profile.address}-${profile.is_open}-${profile.logo_url}`}
        storeId={storeId}
        initial={profile}
      />
    </div>
  );
}
