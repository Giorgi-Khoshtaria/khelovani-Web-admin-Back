export const DEFAULT_PLACEHOLDER = "/assets/placeholder/default.png";

export const CATEGORY_PLACEHOLDER_MAP: Record<string, string> = {
  jewelry: "/assets/placeholder/jewelry.png",
  ceramics: "/assets/placeholder/ceramics.png",
  textile: "/assets/placeholder/textile.png",
  woodwork: "/assets/placeholder/woodwork.png",
  painting: "/assets/placeholder/painting.png",
  sculpture: "/assets/placeholder/sculpture.png",
  leatherwork: "/assets/placeholder/leatherwork.png",
  glasswork: "/assets/placeholder/glasswork.png",
  embroidery: "/assets/placeholder/embroidery.png",
  metalwork: "/assets/placeholder/metalwork.png",
  feltwork: "/assets/placeholder/feltwork.png",
  knitting: "/assets/placeholder/knitting.png",
  candles: "/assets/placeholder/candles.png",
};

/**
 * Gets the localized placeholder URL for a category.
 * Mirrors the logic in the frontend for consistency.
 */
export function getCategoryPlaceholder(category: string): string {
  if (!category) return DEFAULT_PLACEHOLDER;

  const normalized = category.toLowerCase();

  // 1. Exact match
  if (CATEGORY_PLACEHOLDER_MAP[normalized]) {
    return CATEGORY_PLACEHOLDER_MAP[normalized];
  }

  // 2. Legacy / compound values (e.g. "jewelry_accessories" -> try "jewelry" first)
  const firstSegment = normalized.split("_")[0];
  if (firstSegment && CATEGORY_PLACEHOLDER_MAP[firstSegment]) {
    return CATEGORY_PLACEHOLDER_MAP[firstSegment];
  }

  return DEFAULT_PLACEHOLDER;
}
