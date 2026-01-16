import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-note", ({ noteId, userId }) => {
    socket.join(noteId);
    socket.to(noteId).emit("user-joined", { userId });
  });

  socket.on("note-content-change", ({ noteId, content }) => {
    socket.to(noteId).emit("note-content-update", { content });
  });

 

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});
