import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyToken } from "../middleware/auth.middleware";
import { AUTH_COOKIE } from "./cookies";
import { env } from "../config/env";
import { logger } from "../config/logger";

let io: Server | undefined;

interface AuthedSocket extends Socket {
  data: { userId: string };
}

const parseCookies = (raw?: string): Record<string, string> => {
  if (!raw) return {};
  return raw.split(";").reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    acc[key] = decodeURIComponent(part.slice(idx + 1).trim());
    return acc;
  }, {});
};

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
    },
  });

  // Authenticate every connection from the JWT cookie (or an explicit
  // handshake auth token). The room is derived from the verified user id —
  // never from a client-supplied value.
  io.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token =
        cookies[AUTH_COOKIE] ||
        (socket.handshake.auth?.token as string | undefined);
      if (!token) return next(new Error("Unauthorized"));
      const { id } = verifyToken(token);
      (socket as AuthedSocket).data.userId = id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = (socket as AuthedSocket).data;
    socket.join(userId);
    logger.debug({ socketId: socket.id, userId }, "socket connected");

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id, userId }, "socket disconnected");
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

/** Emit an event to a set of user rooms, de-duplicated. */
export const emitToUsers = (
  userIds: Array<string | null | undefined>,
  event: string,
  payload: unknown
) => {
  if (!io) return;
  const unique = [...new Set(userIds.filter(Boolean) as string[])];
  for (const uid of unique) {
    io.to(uid).emit(event, payload);
  }
};
