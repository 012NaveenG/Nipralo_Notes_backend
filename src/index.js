import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config("./.env");

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, _res, next) => {
  req.io = io;
  next();
});

const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("note:join", ({ noteId, user }) => {
    if (!noteId || !user) {
      console.log("❌ Invalid join payload", { noteId, user });
      return;
    }

    const room = `note-${noteId}`;
    socket.join(room);

    if (!activeUsers.has(noteId)) {
      activeUsers.set(noteId, new Map());
    }

    activeUsers.get(noteId).set(socket.id, user);

    io.to(room).emit(
      "note:users",
      Array.from(activeUsers.get(noteId).values()),
    );

    console.log(`🔥 ${user.name} joined note ${noteId}`);
  });

  socket.on("note:leave", ({ noteId }) => {
    if (!noteId) return;

    const room = `note-${noteId}`;
    socket.leave(room);

    activeUsers.get(noteId)?.delete(socket.id);

    io.to(room).emit(
      "note:users",
      Array.from(activeUsers.get(noteId)?.values() || []),
    );
  });

  socket.on("disconnect", () => {
    for (const [noteId, users] of activeUsers.entries()) {
      if (users.delete(socket.id)) {
        io.to(`note-${noteId}`).emit("note:users", Array.from(users.values()));
      }
    }

    console.log("❌ Socket disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 12345, () =>
  console.log(`Server is running at http://localhost:${process.env.PORT }`),
);
