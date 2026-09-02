import * as Sentry from "@sentry/node";
import { env } from "./env";
import { logger } from "./logger";

let enabled = false;

export const initSentry = () => {
  if (!env.SENTRY_DSN) {
    logger.info("Sentry disabled (no SENTRY_DSN set)");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
  });
  enabled = true;
  logger.info("Sentry initialised");
};

export const captureException = (err: unknown, context?: Record<string, unknown>) => {
  if (!enabled) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
};

export { Sentry };
