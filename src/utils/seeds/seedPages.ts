import mongoose from "mongoose";
import dotenv from "dotenv";
import Page from "../../modules/page.modules.js";
dotenv.config();

/**
 * seedPages
 * Seeds the Page (SEO) collection with the site's static routes, using the
 * same copy that was previously hardcoded in each page's fallback metadata.
 * Uses upsert by `path` so it's safe to re-run without duplicating.
 */

const pages = [
  {
    path: "/",
    title: {
      ka: "Khelovani — ქართული ხელნაკეთი ნივთები",
      en: "Khelovani — Georgian Handmade Goods",
    },
    description: {
      ka: "Khelovani — ქართველი ხელოსნებისა და ბრენდების ონლაინ მარკეტი: ხელნაკეთი კერამიკა, სამკაული, ტექსტილი და სხვა.",
      en: "Khelovani — an online marketplace for Georgian artisans and brands: handmade ceramics, jewelry, textiles, and more.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/products",
    title: { ka: "პროდუქტები", en: "Products" },
    description: {
      ka: "დაათვალიერეთ ხელნაკეთი პროდუქტები ქართველი ხელოსნებისგან — კერამიკა, სამკაული, ტექსტილი და სხვა.",
      en: "Browse handmade products from Georgian artisans — ceramics, jewelry, textiles, and more.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/partners",
    title: { ka: "პარტნიორები", en: "Partners" },
    description: {
      ka: "გაიცანით ჩვენი პარტნიორები — ქართველი ხელოსნები და ბრენდები.",
      en: "Meet our partners — Georgian artisans and brands.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/about",
    title: { ka: "ჩვენ შესახებ", en: "About Us" },
    description: {
      ka: "გაიცანით Khelovani — ქართველი ხელოსნების პლატფორმა.",
      en: "Meet Khelovani — a platform for Georgian artisans.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/contact",
    title: { ka: "დაგვიკავშირდით", en: "Contact Us" },
    description: {
      ka: "დაგვიკავშირდით Khelovani-ს ნებისმიერ საკითხზე — პროდუქტები, ხელოსნები თუ სხვა.",
      en: "Get in touch with Khelovani for any inquiries about our products, artisans, or anything else.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/policy",
    title: { ka: "პოლიტიკა", en: "Policy" },
    description: {
      ka: "Khelovani-ს კონფიდენციალურობის, დაბრუნების და მომსახურების პირობები.",
      en: "Khelovani's privacy, returns, and terms of service policies.",
    },
    ogImage: "",
    noindex: false,
  },
  {
    path: "/become-partner",
    title: { ka: "გახდი პარტნიორი", en: "Become a Partner" },
    description: {
      ka: "დარეგისტრირდი, როგორც Khelovani-ს პარტნიორი და გაყიდე შენი ნამუშევრები.",
      en: "Register as a Khelovani partner and start selling your work.",
    },
    ogImage: "",
    noindex: false,
  },
];

const seedPages = async () => {
  try {
    if (!process.env.MONGODB_URL_TEST)
      throw new Error("MONGODB_URL_TEST is not defined in .env file");
    await mongoose.connect(process.env.MONGODB_URL_TEST);
    console.log("Connected to MongoDB for page seeding");

    for (const page of pages) {
      await Page.updateOne(
        { path: page.path },
        { $set: page },
        { upsert: true },
      );
      console.log(`Page '${page.path}' upserted.`);
    }

    console.log(`✅ Pages seeded (${pages.length} entries).`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding pages:", err);
    process.exit(1);
  }
};

seedPages();
