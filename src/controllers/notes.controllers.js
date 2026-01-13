import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { _db } from "../config/_db.js";
import { Users, Notes } from "../db/schema.js";
import { eq, like, or } from "drizzle-orm";

const createNote = AsyncHandler(async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!(title && content))
      return res.status(401).json(new ApiError(401, "all fields are required"));
    const note = await _db
      .insert(Notes)
      .values({
        title: title,
        content: content,
        createdBy: req.user.id,
      })
      .$returningId();

    if (!note[0])
      return res
        .status(500)
        .json(new ApiError(500, "Note could not be created. Please try again"));

    await _db
      .update(Users)
      .set({ role: "editor" })
      .where(eq(Users.id, req?.user.id));

    return res
      .status(200)
      .json(new ApiResponse(200, "Note created succesfully"));
  } catch (error) {
    console.log(error);
  }
});

const editNote = AsyncHandler(async (req, res) => {
  try {
    const { id, title, content } = req.body;
    if (!(id && title && content))
      return res.status(401).json(new ApiError(401, "all fields are required"));

    await _db
      .update(Notes)
      .set({
        title,
        content,
      })
      .where(Notes.id, id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Note updated succuessfully"));
  } catch (error) {
    console.log(error);
  }
});

const deleteNote = AsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(401).json(new ApiError(401, "all fields are required"));

    const result = await _db.delete(Notes).where(eq(Notes.id, id));
    if (result[0]?.affectedRows <= 0)
      return res
        .status(500)
        .json(new ApiError(500, "Note could not be deleted. Please try again"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Note deleted succesfully"));
  } catch (error) {
    console.log(error);
  }
});

const getNoteByTitleContent = AsyncHandler(async (req, res) => {
  try {
    const { title, content } = req.query;
    if (!(title || content))
      return res
        .status(401)
        .json(new ApiError(401, "please provide required info"));
    const notes = await _db
      .select({
        id: Notes.id,
        title: Notes.title,
        content: Notes.content,
        createdBy: Users.name,
        createdAt: Notes.createdAt,
        updatedAt: Notes.updatedAt,
      })
      .from(Notes)
      .innerJoin(Users, eq(Notes.createdBy, Users.id))
      .where(
        or(like(Notes.title, `%${title}%`), like(Notes.content, `%${content}%`))
      );

    if (notes.length === 0)
      return res.status(404).json(new ApiError(404, "No any note found"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Note Found successfully", notes));
  } catch (error) {
    console.log(error);
  }
});
export { createNote, editNote, deleteNote, getNoteByTitleContent };
