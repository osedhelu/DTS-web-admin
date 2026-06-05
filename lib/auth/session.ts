import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { getRoleHomePath, isUserRole, type UserRole } from "@/lib/auth/roles";

export interface SessionClaims {
  role?: UserRole;
  email?: string;
  user_id?: number;
  exp?: number;
}

export function decodeJwtPayload(token: string): SessionClaims | null {
  const part = token.split(".")[1];
  if (!part) {
    return null;
  }

  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    const claims = JSON.parse(decoded) as SessionClaims;

    if (claims.role && !isUserRole(claims.role)) {
      return null;
    }

    return claims;
  } catch {
    return null;
  }
}

export function isSessionExpired(claims: SessionClaims): boolean {
  if (!claims.exp) {
    return false;
  }

  return claims.exp * 1000 < Date.now();
}

export async function getServerSession(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const claims = decodeJwtPayload(token);

  if (!claims || isSessionExpired(claims)) {
    return null;
  }

  return claims;
}

export { getRoleHomePath };
