import { getTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
];

export const validateCity = (
  city?: string,
  lang: Lang = "ge",
): string | null => {
  if (!city || city.trim() === "")
    return getTranslation(TranslationNamespace.Validation, "city_required", lang);
  if (!VALID_CITIES.includes(city.trim().toLowerCase()))
    return getTranslation(TranslationNamespace.Validation, "city_invalid", lang);
  return null;
};
