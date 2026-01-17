import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { _db } from "../config/_db.js";
import { Users, Notes, ActivityLogs } from "../db/schema.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const registerUser = AsyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field?.trim() === "")) {
      return res.status(401).json(new ApiError(401, "all fields are required"));
    }

    const isUserAlreadyExists = await _db
      .select()
      .from(Users)
      .where(eq(Users.email, email));

    if (isUserAlreadyExists[0]) {
      return res.status(409).json(new ApiError(409, "user already exists"));
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await _db
      .insert(Users)
      .values([
        {
          name: name,
          email: email,
          password: hashPassword,
        },
      ])
      .$returningId();

    if (!user[0]) {
      return res
        .status(500)
        .json(
          new ApiError(500, "user could not be registered. Please try again"),
        );
    }

    const ip = req?.ip || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const activitylog = await _db
      .insert(ActivityLogs)
      .values({
        type: "Writing",
        user_id: user[0].id,

        log: "new user created",
        ip_adress: ip,
        user_agent: userAgent,
      })
      .$returningId();
    if (!activitylog[0]) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Something went wrong while registering user. Please try again",
          ),
        );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "user registered succesfully"));
  } catch (error) {
    throw new ApiError(500, "Internal server error");
  }
});
const loginUser = AsyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password))
      return res.status(401).json(new ApiError(401, "all fields are required"));

    const isUserExists = await _db
      .select()
      .from(Users)
      .where(eq(Users.email, email));

    if (!isUserExists[0])
      return res.status(404).json(new ApiError(404, "Invalid Credentials"));

    const isPasswordCorrect = await bcrypt.compare(
      password,
      isUserExists[0].password,
    );

    if (!isPasswordCorrect)
      return res.status(403).json(new ApiError(403, "Invalid Credentials"));

    // generating token
    const payload = {
      id: isUserExists[0].id,
      name: isUserExists[0].name,
      role: isUserExists[0].role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Inserting data to activity log table
    const ip = req?.ip || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const activitylog = await _db
      .insert(ActivityLogs)
      .values({
        type: "Reading",
        user_id: isUserExists[0]?.id,
        user: isUserExists[0]?.role,
        log: "user loggedIn",
        ip_adress: ip,
        user_agent: userAgent,
      })
      .$returningId();
    if (!activitylog[0]) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            "Something went wrong while logging user. Please try again",
          ),
        );
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("nipralo_token", token, options)
      .json(
        new ApiResponse(200, "user loggedin", {
          id: isUserExists[0].id,
          name: isUserExists[0].name,
        }),
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Internal server error");
  }
});

const logoutUser = AsyncHandler(async (req, res) => {
  try {
    res.clearCookie("nipralo_token").json(new ApiResponse(200, "User log out"));
  } catch (error) {
    console.log(error);
  }
});

export { registerUser, loginUser, logoutUser };
