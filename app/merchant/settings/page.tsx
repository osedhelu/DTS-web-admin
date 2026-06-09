import { StoreSettingsManager } from "@/features/store-settings/components/StoreSettingsManager";

export default function MerchantSettingsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">
          Configuración de la tienda
        </h2>
        <p className="text-zinc-600">
          Actualiza los datos públicos de tu comercio, logo, ubicación en mapa y disponibilidad.
        </p>
      </div>

      <StoreSettingsManager />
    </section>
  );
}
