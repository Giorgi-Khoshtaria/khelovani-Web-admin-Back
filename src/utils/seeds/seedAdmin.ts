import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { ROLES } from "../../middleware/role/permissions.js";

dotenv.config();

const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error("❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars are required.");
  process.exit(1);
}

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URL_TEST as string)
  .then(async () => {
    const Role = (await import("../../modules/role.modules.js")).default;
    const Admin = (await import("../../modules/admin.modules.js")).default;

    const adminRole = await Role.findOne({ name: ROLES.ADMIN });
    if (!adminRole) {
      console.log("admin role not found! Run `npm run seed:roles` first.");
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      existingAdmin.role = adminRole._id;
      await existingAdmin.save();
      console.log("✅ Admin already existed — role reference updated.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      role: adminRole._id,
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
    process.exit(0);
  })
  .catch(console.error);
