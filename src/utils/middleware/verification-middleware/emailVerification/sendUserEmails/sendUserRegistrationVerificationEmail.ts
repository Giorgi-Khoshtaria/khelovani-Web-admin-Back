import { generateRememberToken } from "../../generateRememberToken.js";
import { sendVerificationEmail } from "../email-middleware/sendVerificationEmail.js";

export const sendUserRegistrationVerificationEmail = async (
  email: string,
): Promise<void> => {
  const verificationToken = generateRememberToken(email);

  const verificationLink = `${process.env.FRONTEND_URL}/verify-user-registration?token=${verificationToken}`;
  const subject = "მომხმარებლის რეგისტრაციისთვის ელ-ფოსტის დადასტურება";

  await sendVerificationEmail(email, verificationLink, subject);
};
