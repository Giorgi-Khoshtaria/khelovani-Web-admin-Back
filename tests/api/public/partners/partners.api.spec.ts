import { test } from "../../../fixtures/admin.fixture.js";
import { setupTestPartners, cleanupTestPartners } from "./publicPartners.helpers.js";
import { listPublicPartnersSuites } from "./suites/listPublicPartners.suite.js";
import { getPublicPartnerByIdSuites } from "./suites/getPublicPartnerById.suite.js";

/**
 * ============================================================
 *  Public Partner API — Maximum Coverage
 * ============================================================
 */

test.describe("Public Partner API", () => {
  const sharedState = {
    approvedPartnerId: "",
    approvedPartnerEmail: "",
    pendingPartnerId: "",
  };

  test.beforeAll(async ({ api, adminApi }) => {
    const data = await setupTestPartners(api, adminApi);
    sharedState.approvedPartnerId = data.approvedPartnerId;
    sharedState.approvedPartnerEmail = data.approvedPartnerEmail;
    sharedState.pendingPartnerId = data.pendingPartnerId;
  });

  test.afterAll(async ({ adminApi }) => {
    await cleanupTestPartners(
      adminApi,
      sharedState.approvedPartnerId,
      sharedState.pendingPartnerId,
    );
  });

  listPublicPartnersSuites(sharedState);
  getPublicPartnerByIdSuites(sharedState);
});
