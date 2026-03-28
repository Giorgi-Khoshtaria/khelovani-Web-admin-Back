import { Router } from "express";
import { registerPartner } from "../controllers/partners/partnerRegistration.controller.js";
import { getPublicPartners, getPublicPartnerById } from "../controllers/partners/getPartner.controller.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";

const router = Router();

// ✅ Public Partner routes
router.post("/register", twoMinutesLimiter, registerPartner);
router.get("/", getPublicPartners);
router.get("/:id", getPublicPartnerById);

export default router;
