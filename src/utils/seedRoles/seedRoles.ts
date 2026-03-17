import mongoose from "mongoose";
import dotenv from "dotenv";
import Role from "../../modules/role.modules.js";

dotenv.config();

const rolesToSeed = [
  {
    name: "super_admin",
    allowedPanels: ["admin"],
    permissions: ["all"],
    description:
      "Administrator with full access over the admin panel and website",
    isActive: true,
  },
  {
    name: "moderator",
    allowedPanels: ["admin"],
    permissions: ["moderate_content"],
    description: "Moderator with access to moderate content",
    isActive: true,
  },
  {
    name: "org",
    allowedPanels: ["admin"],
    permissions: ["org_management"],
    description:
      "Organization account with access to the admin panel and website",
    isActive: true,
  },
  {
    name: "user",
    allowedPanels: ["web"],
    permissions: [],
    description: "Standard web user (No admin panel access)",
    isActive: true,
  },
];

const seedRoles = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    for (const roleData of rolesToSeed) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Role '${roleData.name}' created successfully.`);
      } else {
        console.log(`Role '${roleData.name}' already exists.`);
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
