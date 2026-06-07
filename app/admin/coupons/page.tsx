import { CouponsManager } from "@/features/coupons/components/CouponsManager";

export default function AdminCouponsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">Cupones</h2>
        <p className="text-zinc-600">Gestión de cupones promocionales.</p>
      </div>

      <CouponsManager />
    </section>
  );
}
