import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config("./.env");
export const app = Express();

app.use(cookieParser());
app.use(
  cors(),
);

app.use(Express.json());
app.use(Express.urlencoded());

// import routes
import userRoutes from "./routes/users.routes.js";
import noteRoutes from "./routes/notes.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/notes", noteRoutes);

app.get("", (req, res) => res.send("welcome to nipralo notes"));
