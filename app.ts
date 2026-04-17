import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import apiRouter from "./src/routes/index.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";
import { globalErrorHandler } from "./src/middleware/error/globalErrorHandler.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

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

// ✅ 2. Security Middleware (Helmet etc)
app.use(helmet());

// ✅ 3. body parser
app.use(express.json({ limit: "5mb" }));

// ✅ 3.1 Security Middleware (Sanitize after body parser)
app.use(mongoSanitize());

// Custom middleware to set Permissions-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), interest-cohort=()",
  );
  next();
});

// ✅ 3.1 JSON Validation Middleware (400 Bad Request)
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

// ✅ 4. rate limiter
app.use(globalLimiter);

// Root Status Route
app.get("/", (req, res) => {
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
