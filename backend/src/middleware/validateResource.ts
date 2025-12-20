import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e: any) {
      next(e);
    }
  };

export default validate;
