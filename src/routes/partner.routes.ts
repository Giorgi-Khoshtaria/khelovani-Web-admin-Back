import { Router } from "express";
import {
  registerPartner,
  getPublicPartners,
  getPublicPartnerById,
  getPinnedPartners,
} from "../controllers/partners/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import { validate } from "../middleware/validate.js";
import { partnerRegistrationSchema } from "../validations/schemas/partner/partnerAuth.schema.js";

const router = Router();

// ✅ Public Partner routes
router.post(
  "/register",
  twoMinutesLimiter,
  validate(partnerRegistrationSchema),
  registerPartner,
);
router.get("/pinned", twoMinutesLimiter, getPinnedPartners);
router.get("/", twoMinutesLimiter, getPublicPartners);
router.get("/:id", twoMinutesLimiter, getPublicPartnerById);

export default router;
