import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./src/routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/user", userRoutes);

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
