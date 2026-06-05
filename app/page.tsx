import { redirect } from "next/navigation";

import { getRoleHomePath } from "@/lib/auth/roles";
import { getServerSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session?.role) {
    redirect("/login");
  }

  redirect(getRoleHomePath(session.role));
}
