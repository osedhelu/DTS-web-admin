import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function RecuperarContrasenaPage() {
  return (
    <AuthPageShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace seguro a tu correo."
      asideTitle="Recupera el acceso a tu cuenta"
      asideDescription="Si olvidaste tu contraseña, te enviamos un enlace temporal para crear una nueva de forma segura."
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
