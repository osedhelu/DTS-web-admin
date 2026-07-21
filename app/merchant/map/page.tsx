import dynamic from "next/dynamic";

const MerchantOperationsMapPanel = dynamic(
  () =>
    import("@/features/merchant-map/components/MerchantOperationsMapPanel").then(
      (mod) => mod.MerchantOperationsMapPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
        Cargando mapa…
      </div>
    ),
  },
);

export default function MerchantMapPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">Mapa en vivo</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ubicación de tus tiendas y conductores en ruta. Se actualiza cada 10
          segundos.
        </p>
      </header>
      <MerchantOperationsMapPanel />
    </div>
  );
}
