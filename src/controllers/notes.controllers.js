import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { _db } from "../config/_db.js";
import { Users, Notes } from "../db/schema.js";
import { eq } from "drizzle-orm";

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

export { createNote };
