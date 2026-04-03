import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../../modules/role.modules.js";
import Permission from "../../modules/permission.modules.js";
import {
  PANELS,
  ROLES,
  PERMISSIONS,
} from "../../middleware/role/permissions.js";
import { seedPermissions } from "./seedPermissions.js";

dotenv.config();

const rolesToSeed = [
  {
    name: ROLES.ADMIN,
    allowedPanels: [PANELS.ADMIN],
    permissions: Object.values(PERMISSIONS.ADMIN),
    description:
      "Administrator with full access over the admin panel and website",
    isActive: true,
  },
  {
    name: ROLES.ORGANISATION,
    allowedPanels: [PANELS.ORGANIZATION],
    permissions: Object.values(PERMISSIONS.PARTNER),
    description:
      "Organization account with access to the admin panel and website",
    isActive: true,
  },
];

const seedRoles = async () => {
  try {
    if (!process.env.MONGODB_URL_TEST) {
      throw new Error("MONGODB_URL_TEST is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URL_TEST);
    console.log("Connected to MongoDB");

    // ── Seed Permissions first ─────────────────────────────────────────────
    await seedPermissions();

    for (const roleData of rolesToSeed) {
      // Look up correct permission ObjectIds from DB for strings
      const permissionIds: mongoose.Types.ObjectId[] = [];
      if (roleData.permissions && roleData.permissions.length > 0) {
        for (const pName of roleData.permissions) {
          const permDoc = await Permission.findOne({ name: pName });
          if (permDoc) {
            permissionIds.push(permDoc._id as mongoose.Types.ObjectId);
          }
        }
      }

      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create({
          ...roleData,
          permissions: permissionIds,
        });
        console.log(`Role '${roleData.name}' created successfully.`);
      } else {
        // Update existing roles layout constants directly
        existingRole.allowedPanels = roleData.allowedPanels as any;
        existingRole.description = roleData.description;
        existingRole.permissions = permissionIds;

        await existingRole.save();
        console.log(
          `Role '${roleData.name}' updated with latest configuration constants.`,
        );
      }
    }

    console.log("Roles seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding roles: ", error);
    process.exit(1);
  }
};

seedRoles();
