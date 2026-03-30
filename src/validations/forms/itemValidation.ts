import { Lang } from "../../types/lang.types.js";
import { useTranslation } from "../../types/translate.util.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { CraftCategory } from "../../types/itemsCategory.enum.js";

export interface ValidationError {
  field: string;
  message: string;
}

const georgianRegex = /^[ა-ჰ0-9\s.,/\\\-()!?:;$%&*#@]+$/;
const englishRegex = /^[a-zA-Z0-9\s.,/\\\-()!?:;$%&*#@]+$/;

export const validateAddItem = async (
  data: any,
  lang: Lang = "ge",
): Promise<ValidationError[]> => {
  const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
  const errors: ValidationError[] = [];

  const checkString = (field: string, value: string, min: number, max: number, regex: RegExp, errorPrefix: string) => {
    if (!value || value.trim() === "") {
      errors.push({ field, message: tValidation(`${errorPrefix}_required`) });
    } else if (value.length < min) {
      errors.push({ field, message: tValidation(`${errorPrefix}_min`) });
    } else if (max > 0 && value.length > max) {
      errors.push({ field, message: tValidation(`${errorPrefix}_max`) });
    } else if (!regex.test(value)) {
      errors.push({ field, message: tValidation(`${errorPrefix}_${regex === georgianRegex ? 'georgian' : 'english'}`) });
    }
  };

  const checkArray = (field: string, values: any[], regex: RegExp, errorPrefix: string) => {
    if (!values || !Array.isArray(values) || values.length === 0) {
      errors.push({ field, message: tValidation(`${errorPrefix}_min_count`) || `Minimum 1 ${field} is required` });
    } else {
      if (values.length > 10) errors.push({ field, message: tValidation(`${errorPrefix}_max_count`) });
      values.forEach((v: any) => {
        const str = String(v);
        if (str.length < 3) errors.push({ field, message: `${tValidation(`${errorPrefix}_item_min`)}: ${str}` });
        if (str.length > 30) errors.push({ field, message: `${tValidation(`${errorPrefix}_item_max`)}: ${str}` });
        if (!regex.test(str)) errors.push({ field, message: `${tValidation(`${errorPrefix}_alphabet`)}: ${str}` });
      });
    }
  };

  checkString("titleGe", data.titleGe, 3, 100, georgianRegex, "titleGe");
  checkString("titleEn", data.titleEn, 3, 100, englishRegex, "titleEn");
  checkString("descriptionGe", data.descriptionGe, 10, 2000, georgianRegex, "descriptionGe");
  checkString("descriptionEn", data.descriptionEn, 10, 2000, englishRegex, "descriptionEn");

  if (!data.category || !Object.values(CraftCategory).includes(data.category)) {
    errors.push({ field: "category", message: tValidation("invalid_category") });
  }

  if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.push({ field: "price", message: tValidation("invalid_price") });
  }

  if (data.stockQuantity === undefined || data.stockQuantity === null || isNaN(Number(data.stockQuantity)) || Number(data.stockQuantity) < 0) {
    errors.push({ field: "stockQuantity", message: tValidation("invalid_stock") });
  }

  if (data.locationGe && data.locationGe.trim() !== "") {
    checkString("locationGe", data.locationGe, 2, 100, georgianRegex, "locationGe");
  }
  if (data.locationEn && data.locationEn.trim() !== "") {
    checkString("locationEn", data.locationEn, 2, 100, englishRegex, "locationEn");
  }

  checkArray("tagsGe", data.tagsGe, georgianRegex, "tags");
  checkArray("tagsEn", data.tagsEn, englishRegex, "tags");
  checkArray("materialsGe", data.materialsGe, georgianRegex, "materials");
  checkArray("materialsEn", data.materialsEn, englishRegex, "materials");

  if (!data.condition || !["new", "handmade", "vintage"].includes(data.condition)) {
    errors.push({ field: "condition", message: tValidation("invalid_condition") });
  }

  if (data.shippingPrice !== undefined && (isNaN(Number(data.shippingPrice)) || Number(data.shippingPrice) < 0)) {
    errors.push({ field: "shippingPrice", message: tValidation("invalid_shipping_price") });
  }

  if (data.weight !== undefined && (isNaN(Number(data.weight)) || Number(data.weight) <= 0)) {
    errors.push({ field: "weight", message: tValidation("invalid_weight") });
  }

  return errors;
};
