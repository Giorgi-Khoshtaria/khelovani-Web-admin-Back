import { Router } from "express";
import { registerPartner } from "../controllers/partners/partnerRegistration.controller.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";

const router = Router();

// ✅ Public Partner routes
router.post("/register", twoMinutesLimiter, registerPartner);

export default router;
