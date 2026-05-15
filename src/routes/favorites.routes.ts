import { Router } from "express";
import { authenticate } from "../middleware/auth/authenticate.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  getFavoriteIds,
  clearFavorites,
} from "../controllers/favorites/index.js";

const router = Router();

router.use(authenticate);

router.get("/", getFavorites);
router.delete("/", clearFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:productId", addFavorite);
router.delete("/:productId", removeFavorite);

export default router;
