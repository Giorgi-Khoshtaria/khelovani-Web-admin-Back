export const validatePhone = (phone?: string): string | null => {
  if (!phone || phone.trim() === "") return "ტელეფონის ნომერი სავალდებულოა";
  if (!/^5\d{2}\s?\d{3}\s?\d{3}$/.test(phone.trim()))
    return "ტელეფონის ნომერი უნდა იყოს ფორმატში: 5XX XXX XXX";
  return null;
};
