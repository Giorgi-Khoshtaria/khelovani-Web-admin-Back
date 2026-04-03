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
  const { t: tValidation } = useTranslation(
    lang,
    TranslationNamespace.Validation,
  );
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
  } else if (data.key.trim().length < 2) {
    errors.push({
      field: "key",
      message:
        tValidation("key_too_short") || "გასაღები უნდა იყოს მინიმუმ 2 სიმბოლო",
    });
  } else if (data.key.trim().length > 100) {
    errors.push({
      field: "key",
      message:
        tValidation("key_too_long") ||
        "გასაღები უნდა იყოს მაქსიმუმ 100 სიმბოლო",
    });
  }

  if (!data.translations) {
    errors.push({
      field: "ge",
      message:
        tValidation("ge_translation_required") ||
        "ქართული თარგმანი სავალდებულოა",
    });
    errors.push({
      field: "en",
      message:
        tValidation("en_translation_required") ||
        "ინგლისური თარგმანი სავალდებულოა",
    });
  } else {
    if (!data.translations.ge || data.translations.ge.trim() === "") {
      errors.push({
        field: "ge",
        message:
          tValidation("ge_translation_required") ||
          "ქართული თარგმანი სავალდებულოა",
      });
    } else if (data.translations.ge.length > 200) {
      errors.push({
        field: "ge",
        message:
          tValidation("translation_too_long") ||
          "თარგმანი არ უნდა აღემატებოდეს 200 სიმბოლოს",
      });
    }

    if (!data.translations.en || data.translations.en.trim() === "") {
      errors.push({
        field: "en",
        message:
          tValidation("en_translation_required") ||
          "ინგლისური თარგმანი სავალდებულოა",
      });
    } else if (data.translations.en.length > 200) {
      errors.push({
        field: "en",
        message:
          tValidation("translation_too_long") ||
          "თარგმანი არ უნდა აღემატებოდეს 200 სიმბოლოს",
      });
    }
  }

  return errors;
};
