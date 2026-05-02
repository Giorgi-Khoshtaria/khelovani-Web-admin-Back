import Organisation from "../../modules/organization.modules.js";
import { PartnerTypeEnum } from "../../types/partnerTypes.js";

export async function migratePartnerType() {
  const partners = await Organisation.find({
    partnerType: { $exists: false },
  }).lean();

  if (partners.length === 0) {
    console.log("migratePartnerType: nothing to migrate.");
    return;
  }

  const result = await Organisation.updateMany(
    { partnerType: { $exists: false } },
    { $set: { partnerType: PartnerTypeEnum.ORGANIZATION } },
  );

  console.log(`migratePartnerType: stamped ${result.modifiedCount} partners as "organization".`);
}
