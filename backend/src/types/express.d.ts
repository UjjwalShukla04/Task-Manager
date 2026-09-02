import "express";

declare global {
  namespace Express {
    interface Request {
      /** Populated by the `validate({ query })` middleware. */
      validatedQuery?: unknown;
      user?: { id: string };
    }
  }
}

export {};
