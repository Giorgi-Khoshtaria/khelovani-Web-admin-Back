import mongoose from "mongoose";
import dotenv from "dotenv";
import { ROLES } from "../../middleware/role/permissions.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(async () => {
    const Role = (await import("../../modules/role.modules.js")).default;
    const Admin = (await import("../../modules/admin.modules.js")).default;

    const email = "[EMAIL_USER]";

    // 1. Find the admin role
    const adminRole = await Role.findOne({ name: ROLES.ADMIN });
    if (!adminRole) {
      console.log("super_admin role not found! Run your seed script first.");
      process.exit(1);
    }

    // 2. Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log(`Admin with email ${email} not found!`);
      process.exit(1);
    }

    // 3. Update role and ensure role is active
    admin.role = adminRole._id;
    await admin.save();

    // Ensure role itself is active
    if (!adminRole.isActive) {
      adminRole.isActive = true;
      await adminRole.save();
    }

    console.log(`✅ Success: ${email} is now Super Admin with active status.`);
    process.exit(0);
  })
  .catch(console.error);
