import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import { loadTranslationCache } from "./src/types/translate.util.js";
import mongoose from "mongoose";
import userRoutes from "./src/routes/user.routes.js";
import partnerRoutes from "./src/routes/partner.routes.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";
import adminAuthRoutes from "./src/routes/adminRoutes/adminAuth.routes.js";
import adminPartnersRoutes from "./src/routes/adminRoutes/adminPartners.routes.js";
import translationRoutes from "./src/routes/adminRoutes/translation.routes.js";
import roleRoutes from "./src/routes/adminRoutes/role.routes.js";
import partnerProductsRoutes from "./src/routes/partnerProducts.routes.js";
import permissionRoutes from "./src/routes/adminRoutes/permission.routes.js";
import adminMenuRoutes from "./src/routes/adminRoutes/menu.routes.js";
import publicMenuRoutes from "./src/routes/menu.routes.js";
import uploadRoutes from "./src/routes/adminRoutes/upload.routes.js";
import helmet from "helmet";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3001;

// ✅ 1. cors პირველი
const origins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ADMIN,
  process.env.FRONTEND_ADMIN_LIVE_URL,
  process.env.FRONTEND_WEB_LIVE_URL,
].filter(Boolean) as string[];

app.use(helmet());

// Custom middleware to set Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), interest-cohort=()",
  );
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Khelovani API is running",
    version: "1.0.0",
  });
});

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ 2. body parser მეორე
app.use(express.json({ limit: "5mb" }));

// ✅ 2.1 JSON Validation Middleware (400 Bad Request)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON format" });
    }
    next();
  },
);

// Middleware to catch empty bodies for non-GET requests
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (
      ["POST", "PUT", "PATCH"].includes(req.method) &&
      (!req.body || Object.keys(req.body).length === 0)
    ) {
      // Only apply this to registration if you want, or globally as a better REST practice
      if (req.path === "/api/user/register") {
        return res
          .status(400)
          .json({ success: false, message: "Empty request body" });
      }
    }
    next();
  },
);

// ✅ 3. rate limiter მესამე
app.use(globalLimiter);

// ✅ 4. routes ბოლოს
app.use("/api/user", userRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/partners", adminPartnersRoutes);
app.use("/api/products", partnerProductsRoutes);
app.use("/api/admin/translations", translationRoutes);
app.use("/api/admin/roles", roleRoutes);
app.use("/api/admin/permissions", permissionRoutes);
app.use("/api/admin/menu", adminMenuRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/menu", publicMenuRoutes);

// Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Global Error:", err);

    // Handle Multer errors explicitly
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message:
          err.code === "LIMIT_FILE_SIZE"
            ? "ფაილის ზომა აღემატება 5MB-ს"
            : err.message,
      });
    }

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ success: false, message });
  },
);

mongoose
  .connect(process.env.MONGODB_URL_TEST!)
  .then(() => {
    console.log("MongoDB-test connected");
    loadTranslationCache();
  })
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// mongoose
//   .connect(process.env.MONGODB_URL!)
//   .then(() => {
//     console.log("MongoDB connected");
//     loadTranslationCache();
//     seedPermissions();
//   })
//   .catch(console.error);

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
