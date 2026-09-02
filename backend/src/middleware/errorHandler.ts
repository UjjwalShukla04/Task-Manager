import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";
import { captureException } from "../config/sentry";
import { env } from "../config/env";

interface ErrorBody {
  status: "error" | "fail";
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ status: "fail", message: `Route ${req.method} ${req.originalUrl} not found` });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  let statusCode = 500;
  const body: ErrorBody = { status: "error", message: "Internal Server Error" };

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    body.status = err.statusCode < 500 ? "fail" : "error";
    body.message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    body.status = "fail";
    body.message = "Validation failed";
    body.errors = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      body.status = "fail";
      body.message = "A record with that value already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      body.status = "fail";
      body.message = "Record not found";
    } else {
      statusCode = 400;
      body.status = "fail";
      body.message = "Database request error";
    }
  }

  const logPayload = {
    err,
    reqId: (req as { id?: string }).id,
    method: req.method,
    path: req.originalUrl,
  };
  if (statusCode >= 500) {
    logger.error(logPayload, "unhandled error");
    captureException(err, { path: req.originalUrl, method: req.method });
    if (!env.isProduction && err instanceof Error) {
      body.message = err.message;
    }
  } else {
    logger.warn(logPayload, "request error");
  }

  res.status(statusCode).json(body);
};
