import { Request, Response, NextFunction } from "express";
import multer from "multer";

/**
 * Middleware to handle common multer errors (like file size caps or invalid types)
 * to prevent 500 crashes and return clean status codes.
 */
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(422).json({ 
        errors: [{ field: "images", message: "სურათის ზომა არ უნდა აღემატებოდეს 5MB-ს" }] 
      });
    }
    return res.status(400).json({ message: `ატვირთვის შეცდომა: ${err.message}` });
  }

  // Custom errors from fileFilter
  if (err.message === "მხოლოდ სურათების ატვირთვაა ნებადართული") {
    return res.status(422).json({ 
      errors: [{ field: "images", message: err.message }] 
    });
  }

  // For Cloudinary errors or other crashes, return 500 but log details
  if (err) {
    console.error("[MULTER_CRASH]:", err);
    return res.status(500).json({ message: "სერვერის შეცდომა ფაილის ატვირთვისას", detail: err.message });
  }

  next();
};
