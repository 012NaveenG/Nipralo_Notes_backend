import { Router } from "express";
import { createNote, editNote } from "../controllers/notes.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post(verifyJWT, createNote);
router.route("/").put(verifyJWT, editNote);
export default router;
