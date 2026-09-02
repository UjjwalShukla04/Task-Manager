import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const disabled = env.isTest;

/** Tight limiter for credential endpoints (login / register). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => disabled,
  message: {
    status: "error",
    message: "Too many attempts, please try again later.",
  },
});

/** Generous limiter applied to the rest of the API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => disabled,
  message: {
    status: "error",
    message: "Too many requests, please slow down.",
  },
});
