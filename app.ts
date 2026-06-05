import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import apiRouter from "./src/routes/index.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";
import { globalErrorHandler } from "./src/middleware/error/globalErrorHandler.js";
import { requestLogger } from "./src/middleware/logger/requestLogger.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Set Permissions-Policy before any other middleware so nothing can override it
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()",
  );
  next();
});

// ✅ 1. cors first
const origins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ADMIN,
  process.env.FRONTEND_ADMIN_LIVE_URL,
  process.env.FRONTEND_WEB_LIVE_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ 1.1 Cookie parser — populates req.cookies (used for httpOnly auth token)
app.use(cookieParser());

// ✅ 2. Security Middleware (Helmet etc)
app.use(helmet());

// ✅ 3. body parser
app.use(express.json({ limit: "5mb" }));

// ✅ 3.1 Security Middleware (Sanitize after body parser)
app.use(mongoSanitize());

// ✅ 3.1 JSON Validation Middleware (400 Bad Request)
app.use(
  (
    err: any,
    _req: express.Request,
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

// ✅ 4. rate limiter
app.use(globalLimiter);

// ✅ 4.1 Request logger (persists every /api/* request to MongoDB; auto-deleted after 3 days)
app.use(requestLogger);

// Root Status Route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Khelovani API is running",
    version: "1.0.0",
  });
});

// ✅ 5. routes
app.use("/api", apiRouter);

// ✅ 6. Global Error Handler
app.use(globalErrorHandler);

export default app;
