import { Router } from "express";
import { getPublicCategories } from "../controllers/public/getPublicCategories.js";
import { getPinnedCategories } from "../controllers/public/getPinnedCategories.js";

const router = Router();

router.get("/", getPublicCategories);
router.get("/pinned", getPinnedCategories);

export default router;
