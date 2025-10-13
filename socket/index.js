import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

let io;

export const initSocket = (httpServer, corsOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Optional auth middleware: if JWT cookie is present, attach userId to socket
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers?.cookie;
      if (!cookieHeader) return next();

      // Parse minimal cookie header to retrieve `token`
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [k, ...v] = c.trim().split("=");
          return [decodeURIComponent(k), decodeURIComponent(v.join("="))];
        })
      );
      const token = cookies.token;
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decoded?.id) {
        socket.data.userId = decoded.id;
      }
    } catch (_) {
      // Non-fatal: we allow unauthenticated sockets as read-only listeners
    } finally {
      next();
    }
  });

  io.on("connection", (socket) => {
    // If authenticated, auto-join a private user room for notifications
    if (socket.data?.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    // Client will emit 'join-auction' with auctionId to receive updates
    socket.on("join-auction", (auctionId, ack) => {
      if (typeof auctionId !== "string" || !Types.ObjectId.isValid(auctionId)) {
        return typeof ack === "function" && ack({ ok: false, error: "Invalid auctionId" });
      }
      socket.join(`auction:${auctionId}`);
      if (typeof ack === "function") ack({ ok: true });
    });

    socket.on("leave-auction", (auctionId, ack) => {
      if (typeof auctionId !== "string" || !Types.ObjectId.isValid(auctionId)) {
        return typeof ack === "function" && ack({ ok: false, error: "Invalid auctionId" });
      }
      socket.leave(`auction:${auctionId}`);
      if (typeof ack === "function") ack({ ok: true });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  }
  return io;
};

export const emitBidUpdate = (auctionId, payload) => {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("bid:update", payload);
};

export const emitAuctionStatus = (auctionId, payload) => {
  if (!io) return;
  io.to(`auction:${auctionId}`).emit("auction:status", payload);
};

// Optional: emit a private notification to a specific authenticated user (if they joined their own room elsewhere)
export const emitUserNotification = (userId, payload) => {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit("user:notify", payload);
};
