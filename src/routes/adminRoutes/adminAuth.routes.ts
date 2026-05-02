import { Router } from "express";
import { loginAdmin } from "../../controllers/admin/auth/index.js";
import { twoMinutesLimiter } from "../../utils/limiters/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema } from "../../validations/schemas/userAuth/login.schema.js";
const router = Router();

router.post("/login", twoMinutesLimiter, validate(loginSchema), loginAdmin);

export default router;
