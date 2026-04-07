import { Router } from "express";
import {
  registerPartner,
  getPublicPartners,
  getPublicPartnerById,
} from "../controllers/partners/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { partnerRegistrationSchema } from "../validations/schemas/orgPartner.schema.js";

const router = Router();

// ✅ Public Partner routes
router.post(
  "/register",
  twoMinutesLimiter,
  validate(partnerRegistrationSchema),
  registerPartner,
);
router.get("/", twoMinutesLimiter, getPublicPartners);
router.get("/:id", twoMinutesLimiter, getPublicPartnerById);

export default router;
