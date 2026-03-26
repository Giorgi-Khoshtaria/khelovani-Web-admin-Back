import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateTranslation = (
  data: any,
  lang: Lang = "ge",
): ValidationError[] => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: ValidationError[] = [];

  if (!data.namespace || data.namespace.trim() === "") {
    errors.push({
      field: "namespace",
      message: tValidation("namespace_required"),
    });
  }

  if (!data.key || data.key.trim() === "") {
    errors.push({
      field: "key",
      message: tValidation("key_required"),
    });
  }

  if (!data.translations) {
    errors.push({
      field: "ge",
      message: tValidation("ge_translation_required"),
    });
    errors.push({
      field: "en",
      message: tValidation("en_translation_required"),
    });
  } else if (!data.translations.en || data.translations.en.trim() === "") {
    errors.push({
      field: "en",
      message: tValidation("en_translation_required"),
    });
  }

  return errors;
};


