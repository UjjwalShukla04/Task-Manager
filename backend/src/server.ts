import http from "http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { initSentry } from "./config/sentry";
import app from "./app";
import { initSocket } from "./utils/socket";
import prisma from "./config/prisma";

initSentry();

const server = http.createServer(app);
const io = initSocket(server);

const start = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    server.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutting down");
  const timeout = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);

  try {
    await new Promise<void>((resolve) => io.close(() => resolve()));
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    await prisma.$disconnect();
    clearTimeout(timeout);
    logger.info("Shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error({ err }, "Error during shutdown");
    process.exit(1);
  }
};

["SIGTERM", "SIGINT"].forEach((sig) =>
  process.on(sig, () => void shutdown(sig))
);

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandledRejection");
});
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
  void shutdown("uncaughtException");
});

void start();
