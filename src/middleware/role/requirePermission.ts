import { Request, Response, NextFunction } from "express";
import { ROLES } from "./permissions.js";

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
      return;
    }

    // ✅ ANY/OR logic (or Admin Gods bypass)
    const hasPermission =
      req.user!.role === ROLES.ADMIN ||
      permissions.some((p) => req.user!.permissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({ message: "წვდომა აკრძალულია" });
      return;
    }

    next();
  };
};

export const requireAllPermissions = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
      return;
    }

    // ✅ ALL/AND logic (or Admin Gods bypass)
    const hasPermission =
      req.user!.role === ROLES.ADMIN ||
      permissions.every((p) => req.user!.permissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({ message: "წვდომა აკრძალულია" });
      return;
    }

    next();
  };
};
