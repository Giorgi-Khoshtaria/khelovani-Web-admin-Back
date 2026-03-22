export const VALID_CITIES = [
  "tbilisi",
  "batumi",
  "kutaisi",
  "rustavi",
  "gori",
  "zugdidi",
];

export const validateCity = (city?: string): string | null => {
  if (!city || city.trim() === "") return "ქალაქი სავალდებულოა";
  if (!VALID_CITIES.includes(city.trim().toLowerCase()))
    return `ქალაქი უნდა იყოს: ${VALID_CITIES.join(", ")}`;
  return null;
};
