import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { getRoleHomePath, isUserRole } from "@/lib/auth/roles";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { decodeJwtPayload, isSessionExpired } from "@/lib/auth/session";
import { locales } from "@/lib/i18n/config";
import { getLocaleFromAcceptLanguage } from "@/lib/i18n/get-locale";

const PUBLIC_PATHS = [
  "/login",
  "/vender",
  "/registro-comercio",
  "/confirmar-email",
];

function pathnameHasLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function isPublicPath(pathname: string): boolean {
  if (pathnameHasLocale(pathname)) {
    return true;
  }

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const locale = getLocaleFromAcceptLanguage(
      request.headers.get("accept-language"),
    );
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await resolveSession(request);
  const claims = session.claims;
  const hasValidSession = Boolean(
    claims?.role && isUserRole(claims.role) && !isSessionExpired(claims),
  );

  if (!hasValidSession) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json({ detail: "No autenticado" }, { status: 401 });
      return withRefreshedToken(response, session.refreshedToken);
    }

    return redirectToLogin(request, pathname);
  }

  if (pathname.startsWith("/merchant") && claims!.role !== "merchant") {
    if (claims!.role === "super_admin") {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      return withRefreshedToken(response, session.refreshedToken);
    }

    return redirectToLogin(request, pathname);
  }

  if (pathname.startsWith("/admin") && claims!.role !== "super_admin") {
    if (claims!.role === "merchant") {
      const response = NextResponse.redirect(new URL("/merchant", request.url));
      return withRefreshedToken(response, session.refreshedToken);
    }

    return redirectToLogin(request, pathname);
  }

  const response = NextResponse.next({
    request: {
      headers: session.requestHeaders,
    },
  });
  return withRefreshedToken(response, session.refreshedToken);
}

function withRefreshedToken(response: NextResponse, token?: string): NextResponse {
  if (!token) {
    return response;
  }

  response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}

async function resolveSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = token ? decodeJwtPayload(token) : null;
  const hasValidToken =
    claims?.role && isUserRole(claims.role) && !isSessionExpired(claims);

  if (hasValidToken) {
    return { claims, refreshedToken: undefined as string | undefined, requestHeaders };
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return { claims: null, refreshedToken: undefined as string | undefined, requestHeaders };
  }

  const refreshedToken = await refreshAccessToken(refreshToken);
  if (!refreshedToken) {
    return { claims: null, refreshedToken: undefined as string | undefined, requestHeaders };
  }

  const refreshedClaims = decodeJwtPayload(refreshedToken);
  const hasValidRefreshedSession =
    refreshedClaims?.role &&
    isUserRole(refreshedClaims.role) &&
    !isSessionExpired(refreshedClaims);

  if (!hasValidRefreshedSession) {
    return { claims: null, refreshedToken: undefined as string | undefined, requestHeaders };
  }

  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const nextCookieHeader = cookieHeader.includes(`${ACCESS_TOKEN_COOKIE}=`)
    ? cookieHeader.replace(
        new RegExp(`${ACCESS_TOKEN_COOKIE}=[^;]*`),
        `${ACCESS_TOKEN_COOKIE}=${refreshedToken}`,
      )
    : [cookieHeader, `${ACCESS_TOKEN_COOKIE}=${refreshedToken}`]
        .filter(Boolean)
        .join("; ");
  requestHeaders.set("cookie", nextCookieHeader);

  return { claims: refreshedClaims, refreshedToken, requestHeaders };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
