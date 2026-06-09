import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { RegistrationWizard } from "@/features/onboarding/components/RegistrationWizard";

const registrationAsideFooter = (
  <>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">Catálogo listo</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Plantillas por vertical: comida, retail o servicios a domicilio.
      </p>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">Ubicación en mapa</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
        Tu tienda aparecerá en el mapa operativo del administrador.
      </p>
    </div>
  </>
);

export default function RegistroComercioPage() {
  return (
    <AuthPageShell
      title="Registro de comercio"
      subtitle="Crea tu cuenta en 3 pasos sencillos."
      asideTitle="Vende con DTS Delivery"
      asideDescription="Registra tu comercio, configura catálogo y empieza a recibir pedidos desde el panel merchant."
      contentClassName="max-w-2xl"
      asideFooter={registrationAsideFooter}
    >
      <RegistrationWizard />
    </AuthPageShell>
  );
}
