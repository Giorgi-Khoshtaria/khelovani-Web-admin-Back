export const validateEmail = (email?: string): string | null => {
  if (!email || email.trim() === "") return "ელ. ფოსტა სავალდებულოა";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "ელ. ფოსტის ფორმატი არასწორია";
  return null;
};
