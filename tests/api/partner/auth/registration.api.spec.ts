import { test, CreatedPartner } from "../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../constants/endpoints.js";
import { partnerRegistrationHappyPathSuites } from "./suites/partnerRegistrationHappyPath.suite.js";
import { partnerRegistrationValidationSuites } from "./suites/partnerRegistrationValidation.suite.js";
import { partnerRegistrationSecuritySuites } from "./suites/partnerRegistrationSecurity.suite.js";

/**
 * ============================================================
 *  Partner Registration API — Maximum Coverage
 * ============================================================
 */

test.describe("Partner Registration API", () => {
  const createdPartners: CreatedPartner[] = [];

  test.afterAll(async ({ api }) => {
    if (createdPartners.length === 0) return;
    console.log(`🧹 Cleaning up ${createdPartners.length} created partners...`);
    for (const partner of createdPartners) {
      try {
        // Example: await api.delete(`${ENDPOINTS.PARTNER_DELETE}/${partner.identificationCode}`);
        console.log(`   Deleted partner: ${partner.email}`);
      } catch (e) {
        console.warn(`   Failed to delete partner ${partner.email}:`, e);
      }
    }
    createdPartners.length = 0;
  });

  partnerRegistrationHappyPathSuites();
  partnerRegistrationValidationSuites();
  partnerRegistrationSecuritySuites();
});
