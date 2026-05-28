import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test" || Boolean(process.env.MONGODB_URL_TEST);

const testBypass = isTest
  ? (req: any) => req.headers["x-test-bypass"] === "khelovani-test-2026"
  : () => false;

export const twoMinutesLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: isTest ? 20 : 10,
  skipSuccessfulRequests: true,
  skip: testBypass,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many failed attempts. Please try again in 2 minutes.",
    });
  },
});

export const oneHourLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 10 : 5,
  skip: testBypass,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many registration attempts. Please try again in 1 hour.",
    });
  },
});

export const globalLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: isTest ? 2000 : 300,
  standardHeaders: true,
  skip: testBypass,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP. Please try again in 2 minutes.",
    });
  },
});
