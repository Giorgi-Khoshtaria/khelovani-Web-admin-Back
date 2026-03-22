import { validateEmail } from "../shared/email.validation.js";
import { validatePassword } from "../shared/password.validation.js";
import { validateCity } from "../shared/city.validation.js";
import { validatePhone } from "../shared/phone.validation.js";
import { PartnerRegisterData } from "../../utils/types/partnerTypes.js";

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePartnerRegistration = (
  data: Partial<PartnerRegisterData>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.companyNameGe || data.companyNameGe.trim() === "") {
    errors.push({
      field: "companyNameGe",
      message: "კომპანიის ქართული სახელი სავალდებულოა",
    });
  }

  if (!data.companyNameEn || data.companyNameEn.trim() === "") {
    errors.push({
      field: "companyNameEn",
      message: "კომპანიის ინგლისური სახელი სავალდებულოა",
    });
  }

  if (!data.identificationCode || data.identificationCode.trim() === "") {
    errors.push({
      field: "identificationCode",
      message: "საიდენტიფიკაციო კოდი სავალდებულოა",
    });
  } else if (!/^\d{9}$/.test(data.identificationCode.trim())) {
    errors.push({
      field: "identificationCode",
      message: "საიდენტიფიკაციო კოდი უნდა შეიცავდეს 9 ციფრს",
    });
  }

  if (!data.contactPerson || data.contactPerson.trim() === "") {
    errors.push({
      field: "contactPerson",
      message: "საკონტაქტო პირი სავალდებულოა",
    });
  }

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.push({ field: "phone", message: phoneError });

  const cityError = validateCity(data.city);
  if (cityError) errors.push({ field: "city", message: cityError });

  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: "email", message: emailError });

  if (!data.address || data.address.trim() === "") {
    errors.push({ field: "address", message: "მისამართი სავალდებულოა" });
  } else if (!/^[ა-ჰ0-9\s.,/\\\-()]+$/.test(data.address.trim())) {
    errors.push({
      field: "address",
      message: "მისამართი უნდა იყოს ქართულად",
    });
  }

  if (!data.addressEn || data.addressEn.trim() === "") {
    errors.push({
      field: "addressEn",
      message: "მისამართი (ინგლისურად) სავალდებულოა",
    });
  } else if (!/^[a-zA-Z0-9\s.,/\\\-()]+$/.test(data.addressEn.trim())) {
    errors.push({
      field: "addressEn",
      message: "მისამართი (ინგლისურად) უნდა იყოს ინგლისურად",
    });
  }

  if (!data.terms) {
    errors.push({
      field: "terms",
      message: "წესებზე და პირობებზე დათანხმება აუცილებელია",
    });
  }

  return errors;
};
