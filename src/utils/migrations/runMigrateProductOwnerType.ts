import mongoose from "mongoose";
import "dotenv/config";
import { migrateProductOwnerType } from "./migrateProductOwnerType.js";

const uri = process.env.MONGODB_URL;
if (!uri) throw new Error("MONGODB_URL not set");

await mongoose.connect(uri);
await migrateProductOwnerType();
await mongoose.disconnect();
