import jwt from "jsonwebtoken";
import { DbHelper } from "../../../helpers/db/db.helper.js";
import { randomId } from "../../../helpers/utils/generators.js";

/**
 * Sign a password-reset token the same way the backend expects it:
 * a JWT whose payload carries the partner's email.
 */
export const signResetToken = (
  email: string,
  options: jwt.SignOptions = { expiresIn: "1h" },
): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the test environment");
  return jwt.sign({ email }, secret, options);
};

/** A token signed with the wrong secret — should always be rejected. */
export const signWithWrongSecret = (email: string): string =>
  jwt.sign({ email }, "definitely-not-the-real-secret", { expiresIn: "1h" });

/** An already-expired token. */
export const signExpiredToken = (email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in the test environment");
  return jwt.sign({ email }, secret, { expiresIn: -10 });
};

/** Create an approved partner directly in the DB; returns its credentials. */
export const createPartner = async (): Promise<{
  email: string;
  password: string;
}> => {
  const email = `qa_pwd_partner_${randomId()}@test.com`;
  const password = "OldPass123!";
  await DbHelper.createApprovedPartner(email, password);
  return { email, password };
};
