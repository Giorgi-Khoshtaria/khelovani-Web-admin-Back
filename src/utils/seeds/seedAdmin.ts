import mongoose from "mongoose";
import dotenv from "dotenv";
import { ROLES } from "../../middleware/role/permissions.js";

dotenv.config();

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(async () => {
    const Role = (await import("../../modules/role.modules.js")).default;
    const Admin = (await import("../../modules/admin.modules.js")).default;

    // 1. Find the admin role
    // Role names are seeded from `src/middleware/role/permissions.ts`.
    const adminRole = await Role.findOne({ name: ROLES.ADMIN });
    if (!adminRole) {
      console.log("admin role not found! Run `npm run seed:roles` first.");
      process.exit(1);
    }

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      // If the admin exists but has an old/bad role ref, fix it.
      existingAdmin.role = adminRole._id;
      await existingAdmin.save();
      console.log(
        "✅ Admin already existed, but role was updated to `admin`.",
      );
      process.exit(0);
    }

    // 3. Create the admin user (admin123 hashed)
    await Admin.create({
      email: "admin@example.com",
      password: "$2b$10$HcdLcU.xmeoM/ccWfxb/dOL6NjaqM2m7IDC2qV2mTPOa0arDW8nWC",
      role: adminRole._id,
    });

    console.log(
      "✅ Admin user successfully created! (admin@example.com / admin123)",
    );
    process.exit(0);
  })
  .catch(console.error);
