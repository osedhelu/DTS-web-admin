import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { getRoleHomePath, isUserRole } from "@/lib/auth/roles";
import { decodeJwtPayload, isSessionExpired } from "@/lib/auth/session";

const PUBLIC_PATHS = [
  "/login",
  "/vender",
  "/registro-comercio",
  "/confirmar-email",
];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/registro-comercio/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

function redirectToLogin(request: NextRequest, nextPath?: string) {
  const loginUrl = new URL("/login", request.url);

  if (nextPath && nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = token ? decodeJwtPayload(token) : null;
  const hasValidSession =
    claims?.role && isUserRole(claims.role) && !isSessionExpired(claims);

  if (pathname === "/") {
    if (!hasValidSession) {
      return redirectToLogin(request);
    }

    return NextResponse.redirect(
      new URL(getRoleHomePath(claims!.role!), request.url),
    );
  }

  if (!hasValidSession) {
    return redirectToLogin(request, pathname);
  }

  if (pathname.startsWith("/merchant") && claims!.role !== "merchant") {
    if (claims!.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return redirectToLogin(request, pathname);
  }

  if (pathname.startsWith("/admin") && claims!.role !== "super_admin") {
    if (claims!.role === "merchant") {
      return NextResponse.redirect(new URL("/merchant", request.url));
    }

    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
