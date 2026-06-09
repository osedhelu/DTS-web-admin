import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { RegistrationSuccessPanel } from "@/features/onboarding/components/RegistrationSuccessPanel";

export default function RegistroComercioExitoPage() {
  return (
    <AuthPageShell
      title="Registro completado"
      subtitle="Revisa tu correo para activar la cuenta."
      asideTitle="¡Ya casi estás dentro!"
      asideDescription="Confirma tu email y accede al panel para gestionar productos, pedidos e inventario."
      contentClassName="max-w-md"
      asideFooter={
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-sm">
          <p className="text-sm font-semibold text-emerald-200">Próximo paso</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
            Abre el enlace del correo y luego inicia sesión con tu email y contraseña.
          </p>
        </div>
      }
    >
      <RegistrationSuccessPanel />
    </AuthPageShell>
  );
}
