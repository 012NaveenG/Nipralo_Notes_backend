import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/users.controllers.js";

const router  = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
export default router