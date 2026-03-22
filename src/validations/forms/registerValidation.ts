import { UserTypes } from "../../utils/types/userTypes.js";
import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validateNameGe, validateNameEn } from "../shared/name.validation.js";
import { validatePhone } from "../shared/phone.validation.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegistration = (
  data: Partial<UserTypes>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // ── idNumber ───────────────────────────────────────────────────────────
  if (!data.idNumber || data.idNumber.trim() === "") {
    errors.push({ field: "idNumber", message: "პირადი ნომერი სავალდებულოა" });
  } else if (!/^\d{11}$/.test(data.idNumber.trim())) {
    errors.push({
      field: "idNumber",
      message: "პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს",
    });
  }

  // ── names ──────────────────────────────────────────────────────────────
  const nameEnError = validateNameEn(data.nameEn);
  if (nameEnError) errors.push({ field: "nameEn", message: nameEnError });

  const nameGeError = validateNameGe(data.nameGe);
  if (nameGeError) errors.push({ field: "nameGe", message: nameGeError });

  // ── dateOfBirth ────────────────────────────────────────────────────────
  if (!data.dateOfBirth) {
    errors.push({
      field: "dateOfBirth",
      message: "დაბადების თარიღი სავალდებულოა",
    });
  } else {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push({
        field: "dateOfBirth",
        message: "დაბადების თარიღი არასწორი ფორმატისაა",
      });
    } else {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
        age--;
      if (age < 16)
        errors.push({
          field: "dateOfBirth",
          message: "მომხმარებელი უნდა იყოს მინიმუმ 16 წლის",
        });
      if (age > 120)
        errors.push({
          field: "dateOfBirth",
          message: "გთხოვთ, შეიყვანოთ სწორი დაბადების თარიღი",
        });
    }
  }

  // ── city ───────────────────────────────────────────────────────────────
  const cityError = validateCity(data.city);
  if (cityError) errors.push({ field: "city", message: cityError });

  // ── address ────────────────────────────────────────────────────────────
  if (!data.address || data.address.trim() === "") {
    errors.push({ field: "address", message: "მისამართი სავალდებულოა" });
  } else if (data.address.trim().length < 5) {
    errors.push({
      field: "address",
      message: "მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს",
    });
  } else if (data.address.trim().length > 200) {
    errors.push({
      field: "address",
      message: "მისამართი არ უნდა აღემატებოდეს 200 სიმბოლოს",
    });
  }

  // ── email ──────────────────────────────────────────────────────────────
  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: "email", message: emailError });

  // ── password ───────────────────────────────────────────────────────────
  const passwordErrors = validatePassword(data.password);
  passwordErrors.forEach((msg) =>
    errors.push({ field: "password", message: msg }),
  );

  // ── phone ──────────────────────────────────────────────────────────────
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  return errors;
};
