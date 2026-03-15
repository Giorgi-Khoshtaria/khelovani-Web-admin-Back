import { Router } from "express";
import { registerUser, loginUser } from "../controlers/users.controler.js";
import { twoMinutesLimiter, oneHourLimiter } from "../utils/rate-limit.js";

const router = Router();

router.post("/register", oneHourLimiter, registerUser);
router.post("/login", twoMinutesLimiter, loginUser);

export default router;
