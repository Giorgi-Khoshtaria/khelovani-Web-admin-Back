import { Request, Response, NextFunction } from "express";
import { useTranslation } from "../../types/translate.util.js";
import { Lang } from "../../types/lang.types.js";
import { TranslationNamespace } from "../../types/translation.enum.js";
import { AppError } from "../../utils/errors/AppError.js";
import multer from "multer";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const lang = (req.query.lang as Lang) || "ge";
  const { t: tAlerts } = useTranslation(lang, TranslationNamespace.Alerts);

  let statusCode = err.statusCode || 500;
  let message = err.message || tAlerts("server_error") || "Internal Server Error";
  let errors = err.errors || undefined;

  // Handle Multer errors explicitly
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? (lang === "ge" ? "ფაილის ზომა აღემატება 5MB-ს" : "File size exceeds 5MB")
        : err.message;
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validation Error";
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  // Handle JWT Error
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  // Handle JWT Expired Error
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired. Please log in again.";
  }

  // If operational error, use its message
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Console log internal errors in development
  if (statusCode === 500 && process.env.NODE_ENV !== "production") {
    console.error("Global Error:", err);
  } else if (statusCode === 500) {
    console.error("Global Error:", err.message);
  }

  // Expose error info to request logger middleware (read in res.on("finish"))
  res.locals.errorMessage = message;
  res.locals.errorStack = err?.stack || null;

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
