import { CommissionsPanel } from "@/features/commissions/components/CommissionsPanel";

export default function AdminCommissionsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Comisiones</h2>
        <p className="text-zinc-600">
          Ventas por comercio y comisiones de conductores.
        </p>
      </div>

      <CommissionsPanel />
    </section>
  );
}
