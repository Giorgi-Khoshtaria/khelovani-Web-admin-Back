import { Router } from "express";
import { getPublicMenuItems } from "../controllers/menu/index.js";

const router = Router();

// Public — no auth needed
router.get("/", getPublicMenuItems);

export default router;
