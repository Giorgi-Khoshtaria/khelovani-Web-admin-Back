import { Router } from "express";
import { registerPartner } from "../controlers/partners-controler/partnerRegistration.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";

const router = Router();

// ✅ Public Partner routes
router.post("/register", twoMinutesLimiter, registerPartner);

export default router;
