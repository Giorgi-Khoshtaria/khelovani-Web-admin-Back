import type { Request, Response, NextFunction } from "express";

export const requirePanel = (panel: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "ავტორიზაცია საჭიროა" });
      return;
    }

    if (!req.user.allowedPanels.includes(panel)) {
      res.status(403).json({ message: "ამ პანელზე წვდომა არ გაქვთ" });
      return;
    }

    next();
  };
};
