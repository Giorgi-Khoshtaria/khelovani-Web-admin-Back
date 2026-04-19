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

  // Cloudinary rejections or other upload errors — return 422, never 500
  if (err) {
    console.error("[UPLOAD_ERROR]:", err);
    return res.status(422).json({ message: "ფაილის ატვირთვა ვერ მოხერხდა" });
  }

  next();
};
