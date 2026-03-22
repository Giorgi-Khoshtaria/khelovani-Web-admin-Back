// Georgian name
export const validateNameGe = (name?: string): string | null => {
  if (!name || name.trim() === "") return null; // optional
  if (name.trim().length < 2)
    return "სახელი (ქართულად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს";
  if (!/^[\u10D0-\u10FF\s'-]+$/.test(name.trim()))
    return "სახელი (ქართულად) უნდა შეიცავდეს მხოლოდ ქართულ ასოებს";
  return null;
};

// English name
export const validateNameEn = (name?: string): string | null => {
  if (!name || name.trim() === "") return "სახელი (ინგლისურად) სავალდებულოა";
  if (name.trim().length < 2)
    return "სახელი (ინგლისურად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს";
  if (!/^[A-Za-z\s'-]+$/.test(name.trim()))
    return "სახელი (ინგლისურად) უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს";
  return null;
};
