import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
} from "../../controllers/partners/getPartner.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

const router = Router();

// ✅ Admin Partner management routes
router.get("/:id", authenticate, getPartnerById);
router.get("/", authenticate, getAllPartners);
router.patch("/:id/status", authenticate, updatePartnerStatus);

export default router;
