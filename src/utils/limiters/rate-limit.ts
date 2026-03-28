import rateLimit from "express-rate-limit";

export const twoMinutesLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10,
  skipSuccessfulRequests: true,
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
  max: 5,
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
  max: 300, // ← 300 requests per IP every 2 minutes (tightened for max security)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP. Please try again in 2 minutes.",
    });
  },
});
