export interface ValidationError {
  field: string;
  message: string;
}

export const validateTranslation = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.namespace || data.namespace.trim() === "") {
    errors.push({ field: "namespace", message: "ნეიმსპეისი სავალდებულოა" });
  }

  if (!data.key || data.key.trim() === "") {
    errors.push({ field: "key", message: "გასაღები სავალდებულოა" });
  }

  if (!data.translations) {
    errors.push({ field: "ge", message: "ქართული თარგმანი სავალდებულოა" });
    errors.push({ field: "en", message: "ინგლისური თარგმანი სავალდებულოა" });
  }

  if (!data.translations.en || data.translations.en.trim() === "") {
    errors.push({ field: "en", message: "ინგლისური თარგმანი სავალდებულოა" });
  }

  return errors;
};
