import { Router } from "express";

import userRoutes from "./user.routes.js";
import partnerRoutes from "./partner.routes.js";
import adminAuthRoutes from "./adminRoutes/adminAuth.routes.js";
import adminPartnersRoutes from "./adminRoutes/adminPartners.routes.js";
import translationRoutes from "./adminRoutes/translation.routes.js";
import roleRoutes from "./adminRoutes/role.routes.js";
import partnerProductsRoutes from "./partnerProducts.routes.js";
import permissionRoutes from "./adminRoutes/permission.routes.js";
import adminMenuRoutes from "./adminRoutes/menu.routes.js";
import publicMenuRoutes from "./menu.routes.js";
import uploadRoutes from "./adminRoutes/upload.routes.js";
import adminUsersRoutes from "./adminRoutes/adminUsers.routes.js";
import categoryRoutes from "./adminRoutes/category.routes.js";
import publicCategoryRoutes from "./categories.routes.js";

const apiRouter = Router();

apiRouter.use("/user", userRoutes);
apiRouter.use("/partner", partnerRoutes);
apiRouter.use("/products", partnerProductsRoutes);
apiRouter.use("/menu", publicMenuRoutes);

apiRouter.use("/admin/auth", adminAuthRoutes);
apiRouter.use("/admin/partners", adminPartnersRoutes);
apiRouter.use("/admin/translations", translationRoutes);
apiRouter.use("/admin/roles", roleRoutes);
apiRouter.use("/admin/permissions", permissionRoutes);
apiRouter.use("/admin/menu", adminMenuRoutes);
apiRouter.use("/admin/upload", uploadRoutes);
apiRouter.use("/admin/users", adminUsersRoutes);
apiRouter.use("/admin/categories", categoryRoutes);
apiRouter.use("/categories", publicCategoryRoutes);

export default apiRouter;
