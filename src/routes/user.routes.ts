import { Router, type Request, type Response, type NextFunction } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
  changePassword,
  deleteAccount,
  addCard,
  getCards,
  setDefaultCard,
  deleteCard,
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
  checkout,
  getOrders,
  getOrder,
} from "../controllers/user/index.js";
import { twoMinutesLimiter } from "../utils/limiters/rate-limit.js";
import { authenticate } from "../middleware/auth/authenticate.js";
import { verifyEmailCallback } from "../controllers/verification/index.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validations/schemas/userAuth/login.schema.js";
import { registerSchema } from "../validations/schemas/userAuth/register.schema.js";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/schemas/userAuth/forgotPassword.schema.js";
import { profileUpdateSchema } from "../validations/schemas/user/profileUpdate.schema.js";
import { changePasswordSchema } from "../validations/schemas/user/changePassword.schema.js";
import { addPaymentCardSchema } from "../validations/schemas/user/paymentCard.schema.js";
import {
  addAddressSchema,
  updateAddressSchema,
} from "../validations/schemas/user/address.schema.js";
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from "../validations/schemas/user/cart.schema.js";
import {
  checkoutSchema,
  orderIdParamSchema,
} from "../validations/schemas/user/order.schema.js";
import upload from "../utils/config/multer.js";
import { handleMulterError } from "../middleware/error/handleMulterError.js";
import { CloudinaryFolder } from "../types/cloudinaryFolder.enum.js";

const router = Router();

// ✅ Public
router.post(
  "/register",
  twoMinutesLimiter,
  validate(registerSchema),
  registerUser,
);
router.post("/login", twoMinutesLimiter, validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.post(
  "/forgot-password",
  twoMinutesLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  twoMinutesLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);
router.get("/verify", verifyEmailCallback);

// ✅ Protected — profile
router.get("/profile", authenticate, getProfile);
router.patch(
  "/profile",
  authenticate,
  validate(profileUpdateSchema),
  updateProfile,
);
router.post(
  "/profile/image",
  authenticate,
  (req: Request, _res: Response, next: NextFunction) => {
    (req as any).cloudinaryFolder = CloudinaryFolder.Users;
    next();
  },
  upload.single("profileImage"),
  handleMulterError,
  uploadProfileImage,
);
router.delete("/profile/image", authenticate, deleteProfileImage);

// ✅ Protected — account
router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  changePassword,
);
router.delete("/account", authenticate, deleteAccount);

// ✅ Protected — payment cards
router.get("/cards", authenticate, getCards);
router.post("/cards", authenticate, validate(addPaymentCardSchema), addCard);
router.patch("/cards/:id/default", authenticate, setDefaultCard);
router.delete("/cards/:id", authenticate, deleteCard);

// ✅ Protected — addresses
router.get("/addresses", authenticate, getAddresses);
router.post("/addresses", authenticate, validate(addAddressSchema), addAddress);
router.patch(
  "/addresses/:id",
  authenticate,
  validate(updateAddressSchema),
  updateAddress,
);
router.patch("/addresses/:id/default", authenticate, setDefaultAddress);
router.delete("/addresses/:id", authenticate, deleteAddress);

// ✅ Protected — cart
router.get("/cart", authenticate, getCart);
router.post(
  "/cart/items",
  authenticate,
  validate(addToCartSchema),
  addToCart,
);
router.patch(
  "/cart/items/:productId",
  authenticate,
  validate(updateCartItemSchema),
  updateCartItem,
);
router.delete("/cart/items/:productId", authenticate, removeCartItem);
router.delete("/cart", authenticate, clearCart);
router.post("/cart/merge", authenticate, validate(mergeCartSchema), mergeCart);

// ✅ Protected — orders
router.post("/orders/checkout", authenticate, validate(checkoutSchema), checkout);
router.get("/orders", authenticate, getOrders);
router.get("/orders/:id", authenticate, validate(orderIdParamSchema), getOrder);

export default router;
