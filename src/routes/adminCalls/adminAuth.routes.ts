import { Router } from "express";
import { loginPartner } from "../../controlers/partners-controler/admin/partnerLogin.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
const router = Router();

router.post("/login", twoMinutesLimiter, loginPartner);

export default router;
