import { Router } from "express";
import { registerUser, loginUser } from "../controlers/users.controler.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
