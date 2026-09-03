import { io } from "socket.io-client";

export function socketOptions(extra = {}) {
  const url = String(import.meta.env.VITE_API_URL || "");
  const remote = /^https:\/\//i.test(url);

  return {
    withCredentials: true,
    // Render no mantiene sticky sessions: el polling acaba en 404/CORS.
    transports: remote ? ["websocket"] : ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    ...extra,
  };
}

export function connectSocket(extra) {
  return io(import.meta.env.VITE_API_URL, socketOptions(extra));
}
