import { DbHelper } from "./helpers/db/db.helper.js";

async function globalSetup() {
  const email = "global_qa_partner@test.com";
  try {
    let partner = await DbHelper.getPartnerByEmail(email);
    if (!partner) {
      await DbHelper.createApprovedPartner(email, "pass123");
      partner = await DbHelper.getPartnerByEmail(email);
    }
    if (partner) {
      process.env.ORGANIZER_PARTNER_ID = partner._id.toString();
    }
  } catch (error) {
    console.error("Failed to seed global partner:", error);
  } finally {
    await DbHelper.disconnect();
  }
}

export default globalSetup;
