import rateLimit from "express-rate-limit";

export const twoMinutesLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: process.env.MONGODB_URL_TEST ? 20 : 10,
  skipSuccessfulRequests: true,
  skip: (req) => req.headers["x-test-bypass"] === "khelovani-test-2026",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many failed attempts. Please try again in 2 minutes.",
    });
  },
});

export const oneHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  // max: 5,
  max: process.env.MONGODB_URL_TEST ? 10 : 5, 
  skip: (req) => req.headers["x-test-bypass"] === "khelovani-test-2026",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many registration attempts. Please try again in 1 hour.",
    });
  },
});

// ====================== GLOBAL LIMITER ======================
export const globalLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes (as you requested)
  max: process.env.MONGODB_URL_TEST ? 2000 : 300, // ← 300 requests per IP every 2 minutes (tightened for max security)
  standardHeaders: true,
  skip: (req) => req.headers["x-test-bypass"] === "khelovani-test-2026",
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP. Please try again in 2 minutes.",
    });
  },
});
