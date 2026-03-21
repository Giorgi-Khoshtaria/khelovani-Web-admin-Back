import { Router } from "express";
import { loginAdmin } from "../../controlers/admin-controler/auth/adminrLogin.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
const router = Router();

router.post("/login", twoMinutesLimiter, loginAdmin);

export default router;
