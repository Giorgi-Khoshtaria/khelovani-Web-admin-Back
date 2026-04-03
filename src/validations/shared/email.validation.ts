import {
  useTranslation,
  createTranslator,
} from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export const validateEmail = (
  email?: string,
  lang: Lang = "ge",
): string | null => {
  const { t: tValidation } = useTranslation(
    lang,
    TranslationNamespace.Validation,
  );

  if (!email || email.trim() === "") return tValidation("email_required");
  const trimmedEmail = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
    return tValidation("email_invalid");
  const localPart = trimmedEmail.split("@")[0];
  if (localPart.includes("..")) return tValidation("email_invalid");
  return null;
};
