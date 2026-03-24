import Permission from "../../modules/permission.modules.js";
import { PERMISSIONS } from "../../middleware/role/permissions.js";

export const seedPermissions = async () => {
  try {
    console.log("Seeding permissions...");
    for (const [category, items] of Object.entries(PERMISSIONS)) {
      for (const [key, value] of Object.entries(items as Record<string, string>)) {
        const existing = await Permission.findOne({ name: value });
        if (!existing) {
          await Permission.create({
            name: value,
            description: `${category} ${key} Permission`,
            category: category,
          });
          console.log(`Created permission: ${value}`);
        }
      }
    }

    // Cleanup old permissions no longer in PERMISSIONS template
    const currentKeys = Object.values(PERMISSIONS).flatMap(cat => Object.values(cat as Record<string, string>));
    const deleteResult = await Permission.deleteMany({ name: { $nin: currentKeys } });
    if (deleteResult.deletedCount > 0) {
      console.log(`Deleted ${deleteResult.deletedCount} deprecated permissions.`);
    }

    console.log("Seeding permissions completed.");
  } catch (error) {
    console.error("Error seeding permissions:", error);
  }
};
