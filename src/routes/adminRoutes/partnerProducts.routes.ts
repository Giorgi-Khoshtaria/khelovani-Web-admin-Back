import { Router } from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../controllers/products/index.js";
import upload from "../../utils/config/multer.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { requirePermission } from "../../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { CloudinaryFolder } from "../../types/cloudinaryFolder.enum.js";
import { handleMulterError } from "../../middleware/error/handleMulterError.js";
import { validate } from "../../middleware/validate.js";
import { parseProductData } from "../../middleware/parseProduct.js";
import {
  productSchema,
  updateProductSchema,
} from "../../validations/schemas/product.schema.js";
import {
  commonParamsSchema,
  productIdParamsSchema,
} from "../../validations/schemas/common.schema.js";

const router = Router();

// ✅ Admin Product management routes
router.use(authenticate);

// Global product routes
router.get(
  "/",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  getProducts,
);

router.get(
  "/:productId",
  requirePermission(
    PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL,
    PERMISSIONS.PARTNER.PRODUCT_VIEW,
  ),
  validate(productIdParamsSchema),
  getProductById,
);

router.delete(
  "/:productId",
  requirePermission(
    PERMISSIONS.ADMIN.PRODUCT_DELETE,
    PERMISSIONS.PARTNER.PRODUCT_DELETE,
  ),
  validate(productIdParamsSchema),
  deleteProduct,
);

router.put(
  "/:productId",
  requirePermission(
    PERMISSIONS.ADMIN.PRODUCT_EDIT,
    PERMISSIONS.PARTNER.PRODUCT_EDIT,
  ),
  upload.fields([{ name: "images", maxCount: 5 }]),
  handleMulterError,
  parseProductData,
  validate(updateProductSchema),
  updateProduct,
);

// Partner-specific product routes
router.get(
  "/partner/:id",
  twoMinutesLimiter,
  requirePermission(
    PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL,
    PERMISSIONS.PARTNER.PRODUCT_VIEW,
  ),
  validate(commonParamsSchema),
  getProducts,
);

router.post(
  "/partner/:id",
  twoMinutesLimiter,
  requirePermission(
    PERMISSIONS.ADMIN.PRODUCT_CREATE,
    PERMISSIONS.PARTNER.PRODUCT_CREATE,
  ),
  (req: any, res: any, next: any) => {
    req.cloudinaryFolder = CloudinaryFolder.Products;
    next();
  },
  upload.fields([{ name: "images", maxCount: 5 }]),
  handleMulterError,
  parseProductData,
  validate(commonParamsSchema),
  validate(productSchema),
  addProduct,
);

export default router;
