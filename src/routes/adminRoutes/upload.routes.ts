import { Router } from "express";
import upload from "../../utils/config/multer.js";
import { uploadImage } from "../../controllers/upload/uploads.controller.js";
import { authenticate } from "../../middleware/auth/authenticate.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";

const router = Router();

router.post("/", authenticate, twoMinutesLimiter, upload.single("image"), uploadImage);

export default router;
