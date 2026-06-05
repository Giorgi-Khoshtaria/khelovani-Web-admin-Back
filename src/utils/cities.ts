/**
 * Single source of truth for the cities supported across the backend.
 * Used by mongoose schemas, zod validation, email templates, and seeds.
 */

export const CITY_KEYS = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
] as const;

export type CityKey = (typeof CITY_KEYS)[number];

export const CITY_LABELS: Record<CityKey, { ge: string; en: string }> = {
  tbilisi: { ge: "თბილისი", en: "Tbilisi" },
  batumi: { ge: "ბათუმი", en: "Batumi" },
  kutaisi: { ge: "ქუთაისი", en: "Kutaisi" },
  rustavi: { ge: "რუსთავი", en: "Rustavi" },
  gori: { ge: "გორი", en: "Gori" },
  zugdidi: { ge: "ზუგდიდი", en: "Zugdidi" },
};

export const isCityKey = (value: unknown): value is CityKey =>
  typeof value === "string" && (CITY_KEYS as readonly string[]).includes(value);

export const getCityLabel = (key: string, lang: "ge" | "en" = "ge"): string => {
  if (isCityKey(key)) return CITY_LABELS[key][lang];
  return key;
};
