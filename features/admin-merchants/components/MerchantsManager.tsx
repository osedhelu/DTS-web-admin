"use client";

import { useEffect } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { useAdminMerchantsStore } from "@/features/admin-merchants/stores/admin-merchants-store";

function verificationLabel(verified: boolean): string {
  return verified ? "Verificado" : "Pendiente";
}

function accountStatusLabel(active: boolean): string {
  return active ? "Activa" : "Inactiva";
}

function storeStatusLabel(active: boolean): string {
  return active ? "Operativa" : "Suspendida";
}

export function MerchantsManager() {
  const merchants = useAdminMerchantsStore((state) => state.merchants);
  const filters = useAdminMerchantsStore((state) => state.filters);
  const isLoading = useAdminMerchantsStore((state) => state.isLoading);
  const loadMerchants = useAdminMerchantsStore((state) => state.loadMerchants);
  const setFilters = useAdminMerchantsStore((state) => state.setFilters);
  const suspendStore = useAdminMerchantsStore((state) => state.suspendStore);
  const reactivateStore = useAdminMerchantsStore((state) => state.reactivateStore);

  useEffect(() => {
    void loadMerchants();
  }, [loadMerchants]);

  return (
    <div data-testid="merchants-manager" className="space-y-6">
      <UiFeedback successTestId="merchants-success-message" />

      <div className="flex flex-wrap gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Email verificado</span>
          <select
            data-testid="merchants-filter-email-verified"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            value={
              filters.email_verified === undefined
                ? ""
                : filters.email_verified
                  ? "true"
                  : "false"
            }
            onChange={(event) => {
              const value = event.target.value;
              const next =
                value === ""
                  ? undefined
                  : value === "true";
              const updated = { ...filters, email_verified: next };
              setFilters(updated);
              void loadMerchants(updated);
            }}
          >
            <option value="">Todos</option>
            <option value="true">Verificados</option>
            <option value="false">Pendientes</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-zinc-600">Cuenta activa</span>
          <select
            data-testid="merchants-filter-is-active"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            value={
              filters.is_active === undefined ? "" : filters.is_active ? "true" : "false"
            }
            onChange={(event) => {
              const value = event.target.value;
              const next = value === "" ? undefined : value === "true";
              const updated = { ...filters, is_active: next };
              setFilters(updated);
              void loadMerchants(updated);
            }}
          >
            <option value="">Todos</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando comercios…</p>
      ) : (
        <div
          data-testid="merchants-list"
          className="overflow-x-auto rounded-xl border border-zinc-200 bg-white"
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="px-4 py-3">Comercio</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Verificación</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3">Tienda</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                    No hay comercios registrados.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr
                    key={merchant.store_id}
                    data-testid={`merchant-row-${merchant.store_id}`}
                    className="border-b border-zinc-100"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{merchant.store_name}</div>
                      <div className="text-zinc-500">{merchant.business_name}</div>
                    </td>
                    <td className="px-4 py-3">{merchant.email}</td>
                    <td
                      className="px-4 py-3"
                      data-testid={`merchant-verification-${merchant.store_id}`}
                    >
                      {verificationLabel(merchant.email_verified)}
                    </td>
                    <td className="px-4 py-3">
                      {accountStatusLabel(merchant.user_is_active)}
                    </td>
                    <td
                      className="px-4 py-3"
                      data-testid={`merchant-store-status-${merchant.store_id}`}
                    >
                      {storeStatusLabel(merchant.store_is_active)}
                    </td>
                    <td className="px-4 py-3">
                      {merchant.store_is_active ? (
                        <button
                          type="button"
                          data-testid={`merchant-suspend-${merchant.store_id}`}
                          onClick={() => void suspendStore(merchant.store_id)}
                          className="font-medium text-red-700 hover:underline"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`merchant-reactivate-${merchant.store_id}`}
                          onClick={() => void reactivateStore(merchant.store_id)}
                          className="font-medium text-emerald-700 hover:underline"
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
