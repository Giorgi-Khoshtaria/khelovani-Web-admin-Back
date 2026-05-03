import { z } from "zod";

const strictPassword = z
  .string()
  .min(1, "password_required")
  .min(8, "password_min_length")
  .max(64, "password_max_length")
  .refine((val) => /[A-Z]/.test(val), { message: "password_needs_uppercase" })
  .refine((val) => /[a-z]/.test(val), { message: "password_needs_lowercase" })
  .refine((val) => /[0-9]/.test(val), { message: "password_needs_digit" })
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: "password_needs_special",
  });

export const changePasswordSchema = {
  body: z
    .object({
      oldPassword: z.string().min(1, "old_password_required"),
      newPassword: strictPassword,
      confirmPassword: z.string().min(1, "confirm_password"),
    })
    .strict()
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "password_mismatch",
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      path: ["newPassword"],
      message: "new_password_same_as_old",
    }),
};
