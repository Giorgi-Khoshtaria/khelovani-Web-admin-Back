import { Router } from "express";
import {
  registerPartner,
  getPublicPartners,
  getPublicPartnerById,
} from "../controllers/partners/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";

const router = Router();

// ✅ Public Partner routes
router.post("/register", twoMinutesLimiter, registerPartner);
router.get("/", getPublicPartners);
router.get("/:id", getPublicPartnerById);

export default router;
