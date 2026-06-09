/** Detecta URLs de iconos SVG (categorías, etc.) */
export function isSvgMediaUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  return /\.svg($|\?|#)/i.test(url);
}
