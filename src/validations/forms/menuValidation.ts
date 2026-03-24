export interface MenuFormErrors {
  labelKa?: string;
  labelEn?: string;
  href?: string;
  order?: string;
}

export const validateMenuItem = (data: {
  label?: { ka?: string; en?: string };
  href?: string;
  order?: any;
}): MenuFormErrors => {
  const errors: MenuFormErrors = {};

  // label.ka
  if (!data.label?.ka || data.label.ka.trim() === "") {
    errors.labelKa = "ქართული სახელი სავალდებულოა";
  } else if (data.label.ka.trim().length < 2) {
    errors.labelKa = "ქართული სახელი მინიმუმ 2 სიმბოლო უნდა იყოს";
  }

  // label.en
  if (!data.label?.en || data.label.en.trim() === "") {
    errors.labelEn = "ინგლისური სახელი სავალდებულოა";
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.label.en.trim())) {
    errors.labelEn = "ინგლისური სახელი მხოლოდ ლათინური ასოებით უნდა იყოს";
  }

  // href
  if (!data.href || data.href.trim() === "") {
    errors.href = "ლინკი სავალდებულოა";
  } else if (!data.href.trim().startsWith("/")) {
    errors.href = "ლინკი უნდა იწყებოდეს '/' სიმბოლოთი";
  }

  // order
  if (data.order === undefined || data.order === "") {
    errors.order = "რიგითობა სავალდებულოა";
  } else {
    const orderNum = Number(data.order);
    if (isNaN(orderNum) || orderNum < 0) {
      errors.order = "რიგითობა უნდა იყოს 0 ან მეტი";
    }
  }

  return errors;
};
