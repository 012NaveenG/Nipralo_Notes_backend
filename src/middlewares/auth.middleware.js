import jwt from "jsonwebtoken";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Users } from "../db/schema.js";
import { _db } from "../config/_db.js";
import { eq } from "drizzle-orm";

const verifyJWT = AsyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.nipralo_token;
    if (!token)
      return res.status(403).json(new ApiResponse(403, "unauthorized access"));

    const isTokenCorrect = jwt.verify(token, process.env.JWT_SECRET);
    if (!isTokenCorrect)
      return res.status(403).json(new ApiResponse(403, "unauthorized access"));

    const user = await _db
      .select()
      .from(Users)
      .where(eq(Users.id, isTokenCorrect.id));

    if (!user[0])
      return res.status(404).json(new ApiResponse(404, "Invalid Token"));

    req.user = user[0];
    next();
  } catch (error) {
    console.log(error);
  }
});

export { verifyJWT };
