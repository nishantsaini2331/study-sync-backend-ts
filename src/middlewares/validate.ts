import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateReqBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error.errors[0].message,
      });
      return;
    }

    req.body = result.data;
    next();
  };

export const validateParams =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error.errors[0].message,
      });
      return;
    }

    req.body = result.data;
    next();
  };
