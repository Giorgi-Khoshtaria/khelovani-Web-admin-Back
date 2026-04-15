import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// ✅ Extend Express Request so req.user is available everywhere
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        permissions: string[];
        allowedPanels: string[];
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as Request["user"];
    next();
  } catch {
    res.status(401).json({ message: "არასწორი ან ვადაგასული ტოკენი" });
  }
};

/**
 * ✅ Optional Authentication Middleware
 * If a token is provided and valid, it sets req.user.
 * If no token is provided, it simply continues without error.
 */
export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as Request["user"];
    next();
  } catch {
    // We treat invalid tokens as "not logged in" for optional routes
    next();
  }
};
