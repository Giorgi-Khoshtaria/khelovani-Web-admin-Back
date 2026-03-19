import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./src/routes/user.routes.js";
import partnerRoutes from "./src/routes/partner.routes.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ 1. cors პირველი
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
