import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validatePhone = (
  phone?: string,
  lang: Lang = "ge",
): string | null => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);

  if (!phone || phone.trim() === "") return tValidation("phone_required");
  if (!/^5\d{2}\s?\d{3}\s?\d{3}$/.test(phone.trim())) return tValidation("phone_invalid");
  return null;
};


