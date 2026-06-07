import { redirect } from "next/navigation";

import MerchantLayoutClient from "@/app/merchant/MerchantLayoutClient";
import { getServerSession } from "@/lib/auth/session";

export default async function MerchantLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session?.role || session.role !== "merchant") {
    redirect("/login");
  }

  return (
    <MerchantLayoutClient userEmail={session.email}>
      {children}
    </MerchantLayoutClient>
  );
}
