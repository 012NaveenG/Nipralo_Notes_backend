import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
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

export { server };
