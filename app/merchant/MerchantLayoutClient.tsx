import { MerchantSessionBootstrap } from "@/features/stores/components/MerchantSessionBootstrap";
import { MerchantShell } from "@/features/stores/components/MerchantShell";

export default function MerchantLayoutClient({
  children,
  userEmail,
}: Readonly<{
  children: React.ReactNode;
  userEmail?: string;
}>) {
  return (
    <MerchantShell userEmail={userEmail}>
      <MerchantSessionBootstrap />
      {children}
    </MerchantShell>
  );
}
