import { Router } from "express";
import {
  getAllPartners,
  getPartnerById,
  updatePartnerStatus,
  updatePartner,
  deletePartner,
  updatePartnerPhoto,
} from "../../controllers/partners/getPartner.controller.js";
import {
  addProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../../controllers/partners/product.controller.js";
import upload from "../../utils/config/multer.js";
import { authenticate } from "../../middleware/auth/authenticate.js";

import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { CloudinaryFolder } from "../../types/cloudinaryFolder.enum.js";

const router = Router();

// ✅ Admin Partner management routes
router.use(authenticate);

router.get("/", requirePermission(PERMISSIONS.ADMIN.USER_LIST), getAllPartners);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.USER_LIST, PERMISSIONS.PARTNER.PROFILE_EDIT),
  getPartnerById,
); // Access check also handled in controller
router.patch(
  "/:id/status",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_APPROVE, PERMISSIONS.ADMIN.ORG_REJECT),
  updatePartnerStatus,
);
router.patch(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.USER_LIST, PERMISSIONS.PARTNER.PROFILE_EDIT),
  updatePartner,
); // Access check also handled in controller
router.patch(
  "/:id/photo",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.USER_LIST, PERMISSIONS.PARTNER.PROFILE_EDIT),
  (req: any, res, next) => {
    req.cloudinaryFolder = CloudinaryFolder.Organizations;
    next();
  },
  upload.single("image"),
  updatePartnerPhoto,
);
router.get(
  "/:id/products",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL, PERMISSIONS.PARTNER.ORDER_VIEW), // Using order view as a proxy for generic partner access if needed, or better define a PRODUCT_VIEW for partners
  getProducts,
);
router.get(
  "/:id/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL, PERMISSIONS.PARTNER.PRODUCT_EDIT),
  getProductById,
);
router.delete(
  "/:id/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_DELETE, PERMISSIONS.PARTNER.PRODUCT_DELETE),
  deleteProduct,
);
router.put(
  "/:id/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_EDIT, PERMISSIONS.PARTNER.PRODUCT_EDIT),
  upload.fields([{ name: "images", maxCount: 5 }]),
  updateProduct,
);
router.post(
  "/:id/products",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_CREATE, PERMISSIONS.PARTNER.PRODUCT_CREATE),
  (req: any, res, next) => {
    req.cloudinaryFolder = CloudinaryFolder.Products;
    next();
  },
  upload.fields([{ name: "images", maxCount: 5 }]),
  addProduct,
);
router.delete(
  "/:id",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.ORG_DELETE),
  deletePartner,
); // Access check also handled in controller

// ✅ Global product routes for admins
router.get(
  "/products/all",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  getProducts,
);
router.get(
  "/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  getProductById,
);
router.delete(
  "/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_DELETE),
  deleteProduct,
);
router.put(
  "/products/:productId",
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_EDIT),
  upload.fields([{ name: "images", maxCount: 5 }]),
  updateProduct,
);

export default router;
