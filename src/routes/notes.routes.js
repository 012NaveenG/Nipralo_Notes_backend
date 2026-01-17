import { Router } from "express";
import {
  AddNoteCollaborator,
  createNote,
  deleteNote,
  editNote,
  getAllNoteByUserId,
  getNoteByNoteId,
  getNoteByTitleContent,
  GetSharedNotes,
} from "../controllers/notes.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post(verifyJWT, createNote);
router.route("/").put(verifyJWT, editNote);
router.route("/:id").delete(verifyJWT, deleteNote);
router.route("/").get(verifyJWT, getNoteByTitleContent); //  for query parameters

router.route("/get-user-notes").get(verifyJWT, getAllNoteByUserId);
router.route("/get-note/:noteId").get(verifyJWT, getNoteByNoteId);
router.route("/collaborate").post(verifyJWT, AddNoteCollaborator);
router.route("/shared-notes").get(verifyJWT, GetSharedNotes);
export default router;
