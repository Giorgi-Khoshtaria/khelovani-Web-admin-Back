import Category from "../../modules/category.modules.js";

const SEED_CATEGORIES = [
  { slug: "jewelry",      nameGe: "სამკაული",              nameEn: "Jewelry" },
  { slug: "ceramics",     nameGe: "კერამიკა",              nameEn: "Ceramics" },
  { slug: "textile",      nameGe: "ტექსტილი",              nameEn: "Textile" },
  { slug: "woodwork",     nameGe: "ხის ნაკეთობები",        nameEn: "Woodwork" },
  { slug: "painting",     nameGe: "ფერწერა",               nameEn: "Painting" },
  { slug: "sculpture",    nameGe: "ქანდაკება",             nameEn: "Sculpture" },
  { slug: "leatherwork",  nameGe: "ტყავის ნაკეთობები",    nameEn: "Leatherwork" },
  { slug: "glasswork",    nameGe: "მინის ნაკეთობები",     nameEn: "Glasswork" },
  { slug: "embroidery",   nameGe: "ნაქარგობა",             nameEn: "Embroidery" },
  { slug: "metalwork",    nameGe: "ლითონის ნაკეთობები",   nameEn: "Metalwork" },
  { slug: "feltwork",     nameGe: "თექა",                  nameEn: "Feltwork" },
  { slug: "knitting",     nameGe: "ნაქსოვი",               nameEn: "Knitting" },
  { slug: "candles",      nameGe: "სანთლები",              nameEn: "Candles" },
  { slug: "photography",  nameGe: "ფოტოგრაფია",           nameEn: "Photography" },
  { slug: "printmaking",  nameGe: "გრაფიკა",               nameEn: "Printmaking" },
  { slug: "paper_art",    nameGe: "ქაღალდის ხელოვნება",   nameEn: "Paper Art" },
  { slug: "home_decor",   nameGe: "სახლის დეკორი",        nameEn: "Home Decor" },
  { slug: "accessories",  nameGe: "აქსესუარები",           nameEn: "Accessories" },
  { slug: "toys",         nameGe: "სათამაშოები",           nameEn: "Toys" },
  { slug: "other",        nameGe: "სხვა",                  nameEn: "Other" },
];

export const seedCategories = async () => {
  try {
    console.log("Seeding categories...");

    for (const c of SEED_CATEGORIES) {
      await Category.updateOne(
        { slug: c.slug },
        { $setOnInsert: { ...c, isActive: true } },
        { upsert: true },
      );
    }

    console.log("Categories seeding completed.");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};
