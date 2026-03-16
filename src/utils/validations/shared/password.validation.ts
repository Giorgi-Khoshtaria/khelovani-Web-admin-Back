export const validatePassword = (password?: string): string[] => {
  const errors: string[] = [];

  if (!password || password === "") {
    errors.push("პაროლი სავალდებულოა");
    return errors;
  }

  if (password.length < 8)
    errors.push("პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს");
  if (password.length > 64)
    errors.push("პაროლი არ უნდა აღემატებოდეს 64 სიმბოლოს");
  if (!/[A-Z]/.test(password))
    errors.push("პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს (A-Z)");
  if (!/[a-z]/.test(password))
    errors.push("პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს (a-z)");
  if (!/[0-9]/.test(password))
    errors.push("პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს (0-9)");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
    errors.push(
      "პაროლი უნდა შეიცავდეს მინიმუმ ერთ სპეციალურ სიმბოლოს (!@#$%...)",
    );

  return errors;
};
