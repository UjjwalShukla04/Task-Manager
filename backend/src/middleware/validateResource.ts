import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type Schemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

/**
 * Validate and coerce request parts against Zod schemas.
 * Parsed values replace the originals so downstream handlers get typed data.
 */
export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      if (schemas.query) {
        // req.query is a read-only getter on Express 5 — store parsed result.
        const parsed = schemas.query.parse(req.query);
        Object.defineProperty(req, "validatedQuery", {
          value: parsed,
          writable: false,
          configurable: true,
        });
      }
      next();
    } catch (e) {
      next(e);
    }
  };

export default validate;
