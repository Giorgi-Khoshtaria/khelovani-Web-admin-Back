import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
} from "../../controlers/partners-controler/getPartner.js";
import { authenticate } from "../../middleware/auth-middleware/authenticate.js";

const router = Router();

// ✅ Admin Partner management routes
router.get("/:id", authenticate, getPartnerById);
router.get("/", authenticate, getAllPartners);
router.patch("/:id/status", authenticate, updatePartnerStatus);

export default router;
