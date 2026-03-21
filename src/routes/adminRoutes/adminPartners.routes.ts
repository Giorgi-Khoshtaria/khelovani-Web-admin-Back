import { Router } from "express";
import { getPartnerById } from "../../controlers/partners-controler/getPartner.js";
import { authenticate } from "../../middleware/auth-middleware/authenticate.js";

const router = Router();

// ✅ Admin Partner management routes
router.get("/:id", authenticate, getPartnerById);

export default router;
