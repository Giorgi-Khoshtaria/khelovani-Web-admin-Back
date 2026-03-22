import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(async () => {
    const Role = (await import("../../modules/role.modules.js")).default;
    const Admin = (await import("../../modules/admin.modules.js")).default;

    // 1. Find the super_admin role
    const adminRole = await Role.findOne({ name: "super_admin" });
    if (!adminRole) {
      console.log("super_admin role not found! Run your seed script first.");
      process.exit(1);
    }

    // 2. Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log(
        "Admin already exists! You can log in with admin@example.com / admin123",
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
