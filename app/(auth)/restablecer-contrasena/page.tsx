import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { ResetPasswordPanel } from "@/features/auth/components/ResetPasswordPanel";

export default function RestablecerContrasenaPage() {
  return (
    <AuthPageShell
      title="Nueva contraseña"
      subtitle="Define una contraseña segura para tu cuenta."
      asideTitle="Restablece tu contraseña"
      asideDescription="El enlace es de un solo uso y expira en 1 hora por tu seguridad."
    >
      <ResetPasswordPanel />
    </AuthPageShell>
  );
}
