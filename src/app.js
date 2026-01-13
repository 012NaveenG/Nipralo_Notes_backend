import Express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = Express();
app.use(cookieParser());
app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded());
