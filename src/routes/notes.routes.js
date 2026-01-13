import { Router } from "express";
import { createNote } from "../controllers/notes.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post(verifyJWT, createNote);
export default router;
