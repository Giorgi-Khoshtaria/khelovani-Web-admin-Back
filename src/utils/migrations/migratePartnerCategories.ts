import Organisation from "../../modules/organization.modules.js";

const LEGACY_MAP: Record<string, string> = {
  jewelry: "jewelry",
  ceramics: "ceramics",
  textile: "textile",
  leather: "leatherwork",
  wood: "woodwork",
  handcraft: "other",
  food: "other",
  art: "painting",
  enamel: "other",
};

export async function migratePartnerCategories() {
  // Find all partners that still have the legacy `category` field set
  const partners = await Organisation.find({
    category: { $exists: true, $nin: [null, ""] },
  }).lean();

  if (partners.length === 0) {
    console.log("No legacy partner category data found — nothing to migrate.");
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const partner of partners) {
    const legacy = (partner as any).category as string | undefined;
    if (!legacy) { skipped++; continue; }

    const mapped = LEGACY_MAP[legacy] ?? legacy;
    await Organisation.updateOne(
      { _id: partner._id },
      {
        $set: { categories: [mapped] },
        $unset: { category: 1 },
      },
    );
    migrated++;
  }

  console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped.`);
}
