import { MerchantsManager } from "@/features/admin-merchants/components/MerchantsManager";

export default function AdminMerchantsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Comercios</h2>
        <p className="text-zinc-600">
          Moderación de comercios registrados y estado de verificación.
        </p>
      </div>

      <MerchantsManager />
    </section>
  );
}
