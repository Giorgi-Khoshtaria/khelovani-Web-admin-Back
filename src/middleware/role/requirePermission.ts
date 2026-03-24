import type { Request, Response, NextFunction } from "express";

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
      return;
    }

    // ✅ check if user has ANY required permissions (or 'all' / 'super_admin' God-mode)
    const hasPermission = 
      req.user!.role === "super_admin" || 
      req.user!.permissions.includes("all") || 
      permissions.some((p) => req.user!.permissions.includes(p));

    if (!hasPermission) {
      res.status(403).json({ message: "წვდომა აკრძალულია" });
      return;
    }

    next();
  };
};
