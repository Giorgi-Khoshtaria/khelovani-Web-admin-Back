import { useTranslation } from "../../types/translate.util.js";
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
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);

  if (!city || city.trim() === "") return tValidation("city_required");
  if (!VALID_CITIES.includes(city.trim().toLowerCase())) return tValidation("city_invalid");
  return null;
};

