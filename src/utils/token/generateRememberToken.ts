import jwt from "jsonwebtoken";

export const generateRememberToken = (email: string): string => {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "3d" });
};
