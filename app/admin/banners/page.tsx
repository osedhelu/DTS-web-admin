import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { BannersManager } from "@/features/banners/components/BannersManager";

export default function AdminBannersPage() {
  return (
    <section>
      <AdminPageHeader
        badge="Contenido"
        title="Banners"
        description="Administra banners promocionales que se muestran en la aplicación de clientes: imagen, enlace y vigencia."
      />
      <BannersManager />
    </section>
  );
}
