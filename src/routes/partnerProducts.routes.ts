import { Router } from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductPin,
  getPinnedProducts,
} from "../controllers/products/index.js";
import upload from "../utils/config/multer.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middleware/auth/authenticate.js";
import { requirePermission } from "../middleware/role/requirePermission.js";
import { PERMISSIONS } from "../middleware/role/permissions.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import { CloudinaryFolder } from "../types/cloudinaryFolder.enum.js";
import { handleMulterError } from "../middleware/error/handleMulterError.js";
import { validate } from "../middleware/validate.js";
import { parseProductData } from "../middleware/parseProduct.js";
import {
  productSchema,
  updateProductSchema,
  pinProductSchema,
} from "../validations/schemas/product/product.schema.js";
import {
  commonParamsSchema,
  productIdParamsSchema,
} from "../validations/schemas/shared/common.schema.js";
import { cacheRoute } from "../middleware/cache.js";
import { CacheKey, CacheTTL } from "../utils/cache/keys.js";

const router = Router();

// ✅ Public fetching routes (with optional auth for admin/owner view)
router.get(
  "/pinned",
  twoMinutesLimiter,
  cacheRoute(() => CacheKey.pinnedProducts(), CacheTTL.pinnedProducts),
  getPinnedProducts,
);

router.get(
  "/",
  twoMinutesLimiter,
  optionalAuthenticate,
  cacheRoute(
    (req) => CacheKey.productsList(CacheKey.helper.stable(req.query)),
    CacheTTL.productsList,
  ),
  getProducts,
);

router.get(
  "/:productId",
  optionalAuthenticate,
  validate(productIdParamsSchema),
  cacheRoute(
    (req) => CacheKey.productById(req.params.productId),
    CacheTTL.productById,
  ),
  getProductById,
);

// ✅ Protected management routes (require login)
router.use(authenticate);

// Global product listing for admins (keeps permission requirement)
router.get(
  "/all",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_VIEW_ALL),
  getProducts,
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

router.patch(
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

router.patch(
  "/:productId/pin",
  twoMinutesLimiter,
  requirePermission(PERMISSIONS.ADMIN.PRODUCT_PIN),
  validate(productIdParamsSchema),
  validate(pinProductSchema),
  updateProductPin,
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
