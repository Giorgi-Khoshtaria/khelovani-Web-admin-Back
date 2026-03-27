import "dotenv/config";
import express from "express";
import cors from "cors";
import { loadTranslationCache } from "./src/types/translate.util.js";
import mongoose from "mongoose";
import userRoutes from "./src/routes/user.routes.js";
import partnerRoutes from "./src/routes/partner.routes.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";
import adminAuthRoutes from "./src/routes/adminRoutes/adminAuth.routes.js";
import adminPartnersRoutes from "./src/routes/adminRoutes/adminPartners.routes.js";
import translationRoutes from "./src/routes/adminRoutes/translation.routes.js";
import roleRoutes from "./src/routes/adminRoutes/role.routes.js";
import permissionRoutes from "./src/routes/adminRoutes/permission.routes.js";
import adminMenuRoutes from "./src/routes/adminRoutes/menu.routes.js";
import publicMenuRoutes from "./src/routes/menu.routes.js";
import uploadRoutes from "./src/routes/adminRoutes/upload.routes.js";
import { seedPermissions } from "./src/utils/seeds/seedPermissions.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ 1. cors პირველი
const origins: string[] = [];
if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
if (process.env.FRONTEND_URL_ADMIN)
  origins.push(process.env.FRONTEND_URL_ADMIN);

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ 2. body parser მეორე
app.use(express.json());

// ✅ 3. rate limiter მესამე
app.use(globalLimiter);

// ✅ 4. routes ბოლოს
app.use("/api/user", userRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/partners", adminPartnersRoutes);
app.use("/api/admin/translations", translationRoutes);
app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/permissions", permissionRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/menu", publicMenuRoutes);
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected");
    loadTranslationCache();
    seedPermissions();
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
