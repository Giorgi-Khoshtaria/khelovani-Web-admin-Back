import mongoose from "mongoose";
import dotenv from "dotenv";
import { migratePartnerCategories } from "./migratePartnerCategories.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL_TEST as string)
  .then(async () => {
    console.log("Connected to MongoDB");
    await migratePartnerCategories();
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
