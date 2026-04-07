import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { useTranslation } from "../types/translate.util.js";
import { Lang } from "../types/lang.types.js";
import { TranslationNamespace } from "../types/translation.enum.js";

/**
 * Higher-order middleware to validate request data using Zod schemas.
 * Validates body, params, and query.
 */
export const validate = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as any;
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as any;
      }
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const lang = (req.query.lang as Lang) || "ge";
        const { t: tValidation } = useTranslation(lang, TranslationNamespace.Validation);
        
        const errors: { field: string; message: string }[] = [];
        
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          errors.push({
            field: path,
            message: tValidation(issue.message as any) || issue.message,
          });
        });

        res.status(422).json({ errors });
        return;
      }
      
      return next(error);
    }
  };
};
