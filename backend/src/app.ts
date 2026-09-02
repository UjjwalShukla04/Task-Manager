import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { randomUUID } from "crypto";

import { env } from "./config/env";
import { logger } from "./config/logger";
import prisma from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";
import { apiLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Behind a proxy/load-balancer (Render, Fly, Nginx) so secure cookies and
// rate-limit client IPs work correctly.
app.set("trust proxy", 1);

app.use(
  helmet({
    // JSON API — no HTML — so the default CSP only gets in the way.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "no-referrer" },
    hsts: env.isProduction
      ? { maxAge: 15552000, includeSubDomains: true }
      : false,
  })
);
app.use(compression());
app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // curl / server-to-server
      if (env.clientOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }
      if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      logger.warn({ origin }, "blocked by CORS");
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers["x-request-id"];
      const id = (Array.isArray(existing) ? existing[0] : existing) || randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url === "/health" },
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "up" });
  } catch {
    res.status(503).json({ status: "error", db: "down" });
  }
});

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
