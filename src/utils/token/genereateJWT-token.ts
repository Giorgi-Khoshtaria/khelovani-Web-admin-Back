import jwt from "jsonwebtoken";

interface JWTPayload {
  id: string;
  role: string;
  permissions: string[];
  allowedPanels: string[];
}

export const generateJWTToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};
