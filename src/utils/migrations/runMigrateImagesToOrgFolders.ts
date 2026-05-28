import mongoose from "mongoose";
import "dotenv/config";
import { migrateImagesToOrgFolders } from "./migrateImagesToOrgFolders.js";

const uri = process.env.MONGODB_URL;
if (!uri) throw new Error("MONGODB_URL not set");

await mongoose.connect(uri);
await migrateImagesToOrgFolders();
await mongoose.disconnect();
