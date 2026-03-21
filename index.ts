import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./src/routes/user.routes.js";
import partnerRoutes from "./src/routes/partner.routes.js";
import { globalLimiter } from "./src/utils/limiters/rate-limit.js";
import adminAuthRoutes from "./src/routes/adminRoutes/adminAuth.routes.js";
import adminPartnersRoutes from "./src/routes/adminRoutes/adminPartners.routes.js";

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
app.use("/api/admin/auth", adminAuthRoutes);
// app.use("/api/admin/partners", adminPartnersRoutes);
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
