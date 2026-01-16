import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 12345;

const server = http.createServer(app);


const io = new Server(server);

// Socket events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
