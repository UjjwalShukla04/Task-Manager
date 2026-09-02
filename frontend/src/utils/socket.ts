import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "../api/axios";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      // The JWT cookie is sent automatically; the server authenticates the
      // handshake and joins the user's room. No client-supplied ids.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
