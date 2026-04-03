import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "../../modules/menu.modules.js";
dotenv.config();

/**
 * seedMenuItems
 * Seeds the MenuItem collection with the default navigation menu.
 * Uses upsert by `href` so it's safe to re-run without duplicating.
 */

const menuItems = [
  {
    label: { ka: "მთავარი", en: "Home" },
    href: "/",
    order: 0,
    isActive: true,
  },
  {
    label: { ka: "პარტნიორები", en: "Partners" },
    href: "/partners",
    order: 1,
    isActive: true,
  },
  {
    label: { ka: "პროდუქტები", en: "Products" },
    href: "/products",
    order: 2,
    isActive: true,
  },
  {
    label: { ka: "ჩვენს შესახებ", en: "About Us" },
    href: "/about",
    order: 3,
    isActive: true,
  },
  {
    label: { ka: "კონტაქტი", en: "Contact" },
    href: "/contact",
    order: 4,
    isActive: true,
  },
];

const seedMenuItems = async () => {
  try {
    if (!process.env.MONGODB_URL_TEST)
      throw new Error("MONGODB_URL_TEST is not defined in .env file");
    await mongoose.connect(process.env.MONGODB_URL_TEST);
    console.log("Connected to MongoDB for menu seeding");

    for (const item of menuItems) {
      await MenuItem.updateOne(
        { href: item.href },
        { $set: item },
        { upsert: true },
      );
      console.log(`MenuItem '${item.href}' upserted.`);
    }

    console.log(`✅ Menu items seeded (${menuItems.length} entries).`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding menu items:", err);
    process.exit(1);
  }
};

seedMenuItems();
