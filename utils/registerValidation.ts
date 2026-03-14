import { UserTypes } from "./userTypes.js";

export interface ValidationError {
  field: string;
  message: string;
}

const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
];

export const validateRegistration = (
  data: Partial<UserTypes>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // ── idNumber ──────────────────────────────────────────────────────────────
  if (!data.idNumber || data.idNumber.trim() === "") {
    errors.push({ field: "idNumber", message: "პირადი ნომერი სავალდებულოა" });
  } else if (!/^\d{11}$/.test(data.idNumber.trim())) {
    errors.push({
      field: "idNumber",
      message: "პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს",
    });
  }

  // ── nameEn ────────────────────────────────────────────────────────────────
  if (!data.nameEn || data.nameEn.trim() === "") {
    errors.push({
      field: "nameEn",
      message: "სახელი (ინგლისურად) სავალდებულოა",
    });
  } else if (data.nameEn.trim().length < 2) {
    errors.push({
      field: "nameEn",
      message: "სახელი (ინგლისურად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
    });
  } else if (!/^[A-Za-z\s'-]+$/.test(data.nameEn.trim())) {
    errors.push({
      field: "nameEn",
      message: "სახელი (ინგლისურად) უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს",
    });
  }

  // ── nameGe (optional but validated if provided) ───────────────────────────
  if (data.nameGe && data.nameGe.trim() !== "") {
    if (data.nameGe.trim().length < 2) {
      errors.push({
        field: "nameGe",
        message: "სახელი (ქართულად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს",
      });
    } else if (!/^[\u10D0-\u10FF\s'-]+$/.test(data.nameGe.trim())) {
      errors.push({
        field: "nameGe",
        message: "სახელი (ქართულად) უნდა შეიცავდეს მხოლოდ ქართულ ასოებს",
      });
    }
  }

  // ── dateOfBirth ───────────────────────────────────────────────────────────
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
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }
      if (age < 16) {
        errors.push({
          field: "dateOfBirth",
          message: "მომხმარებელი უნდა იყოს მინიმუმ 16 წლის",
        });
      }
      if (age > 120) {
        errors.push({
          field: "dateOfBirth",
          message: "გთხოვთ, შეიყვანოთ სწორი დაბადების თარიღი",
        });
      }
    }
  }

  // ── city ──────────────────────────────────────────────────────────────────
  if (!data.city || data.city.trim() === "") {
    errors.push({ field: "city", message: "ქალაქი სავალდებულოა" });
  } else if (!VALID_CITIES.includes(data.city.trim().toLowerCase())) {
    errors.push({
      field: "city",
      message: `ქალაქი უნდა იყოს: ${VALID_CITIES.join(", ")}`,
    });
  }

  // ── address ───────────────────────────────────────────────────────────────
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

  // ── email ─────────────────────────────────────────────────────────────────
  if (!data.email || data.email.trim() === "") {
    errors.push({ field: "email", message: "ელ. ფოსტა სავალდებულოა" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push({
      field: "email",
      message: "ელ. ფოსტის ფორმატი არასწორია",
    });
  }

  // ── password ──────────────────────────────────────────────────────────────
  if (!data.password || data.password === "") {
    errors.push({ field: "password", message: "პაროლი სავალდებულოა" });
  } else {
    const pwd = data.password;

    if (pwd.length < 8) {
      errors.push({
        field: "password",
        message: "პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს",
      });
    }
    if (pwd.length > 64) {
      errors.push({
        field: "password",
        message: "პაროლი არ უნდა აღემატებოდეს 64 სიმბოლოს",
      });
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს (A-Z)",
      });
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს (a-z)",
      });
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push({
        field: "password",
        message: "პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს (0-9)",
      });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push({
        field: "password",
        message:
          "პაროლი უნდა შეიცავდეს მინიმუმ ერთ სპეციალურ სიმბოლოს (!@#$%...)",
      });
    }
  }

  return errors;
};
