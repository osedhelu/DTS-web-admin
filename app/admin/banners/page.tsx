import { BannersManager } from "@/features/banners/components/BannersManager";

export default function AdminBannersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Banners</h2>
        <p className="text-zinc-600">
          Administra los banners promocionales visibles en la app cliente.
        </p>
      </div>

      <BannersManager />
    </section>
  );
}
