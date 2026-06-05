import { Router } from "express";
import mongoose from "mongoose";
import { getRedis } from "../utils/cache/redis.js";

import userRoutes from "./user.routes.js";
import partnerRoutes from "./partner.routes.js";
import adminAuthRoutes from "./adminRoutes/adminAuth.routes.js";
import adminPartnersRoutes from "./adminRoutes/adminPartners.routes.js";
import translationRoutes from "./adminRoutes/translation.routes.js";
import roleRoutes from "./adminRoutes/role.routes.js";
import partnerProductsRoutes from "./partnerProducts.routes.js";
import partnerOrdersRoutes from "./partnerOrders.routes.js";
import adminOrdersRoutes from "./adminRoutes/adminOrders.routes.js";
import permissionRoutes from "./adminRoutes/permission.routes.js";
import adminMenuRoutes from "./adminRoutes/menu.routes.js";
import publicMenuRoutes from "./menu.routes.js";
import uploadRoutes from "./adminRoutes/upload.routes.js";
import adminUsersRoutes from "./adminRoutes/adminUsers.routes.js";
import categoryRoutes from "./adminRoutes/category.routes.js";
import publicCategoryRoutes from "./categories.routes.js";
import favoritesRoutes from "./favorites.routes.js";
import logsRoutes from "./adminRoutes/logs.routes.js";
import cacheRoutes from "./adminRoutes/cache.routes.js";
import mediaRoutes from "./adminRoutes/media.routes.js";
import informationFieldRoutes from "./adminRoutes/informationField.routes.js";
import publicInformationFieldRoutes from "./informationField.routes.js";
import adminStatisticsRoutes from "./adminRoutes/statistics.routes.js";
import partnerStatisticsRoutes from "./partnerStatistics.routes.js";

const apiRouter = Router();

apiRouter.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redis = getRedis();
  let redisState = "disabled";
  if (redis) {
    try {
      await redis.ping();
      redisState = "connected";
    } catch {
      redisState = "error";
    }
  }
  res.json({ status: "ok", db: dbState, redis: redisState, uptime: Math.floor(process.uptime()) });
});

apiRouter.use("/user", userRoutes);
// Register before "/partner" so the partner router's "/:id" doesn't swallow "/orders".
apiRouter.use("/partner/orders", partnerOrdersRoutes);
apiRouter.use("/partner/statistics", partnerStatisticsRoutes);
apiRouter.use("/partner", partnerRoutes);
apiRouter.use("/products", partnerProductsRoutes);
apiRouter.use("/menu", publicMenuRoutes);
apiRouter.use("/information-fields", publicInformationFieldRoutes);

apiRouter.use("/admin/auth", adminAuthRoutes);
apiRouter.use("/admin/partners", adminPartnersRoutes);
apiRouter.use("/admin/translations", translationRoutes);
apiRouter.use("/admin/roles", roleRoutes);
apiRouter.use("/admin/permissions", permissionRoutes);
apiRouter.use("/admin/menu", adminMenuRoutes);
apiRouter.use("/admin/upload", uploadRoutes);
apiRouter.use("/admin/users", adminUsersRoutes);
apiRouter.use("/admin/orders", adminOrdersRoutes);
apiRouter.use("/admin/categories", categoryRoutes);
apiRouter.use("/admin/logs", logsRoutes);
apiRouter.use("/admin/cache", cacheRoutes);
apiRouter.use("/admin/media", mediaRoutes);
apiRouter.use("/admin/information-fields", informationFieldRoutes);
apiRouter.use("/admin/statistics", adminStatisticsRoutes);
apiRouter.use("/categories", publicCategoryRoutes);
apiRouter.use("/favorites", favoritesRoutes);

export default apiRouter;
