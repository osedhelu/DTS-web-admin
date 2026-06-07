const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Origen del backend sin el prefijo /api/v1 (p. ej. http://extreme.local:8000). */
export function getApiOrigin(): string {
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

/** Convierte rutas relativas /media/... en URL absoluta del servidor Django. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const origin = getApiOrigin();
  if (!origin) {
    return url;
  }

  return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
}

/** @deprecated Usar resolveMediaUrl */
export function productMediaUrl(url: string | null | undefined): string {
  return resolveMediaUrl(url);
}
