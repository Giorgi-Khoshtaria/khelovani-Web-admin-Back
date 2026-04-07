import { test } from "../../../fixtures/admin.fixture.js";
import { listPartnersSuites } from "./suites/listPartners.suite.js";
import { getPartnerByIdSuites } from "./suites/getPartnerById.suite.js";
import { partnerStatusSuites } from "./suites/partnerStatus.suite.js";
import { partnersSecuritySuites } from "./suites/partnersSecurity.suite.js";
import { partnerResponseContractSuites } from "./suites/partnerResponseContract.suite.js";
import { bulkDeletePartnersSuites } from "./suites/bulkDeletePartners.suite.js";

/**
 * ============================================================
 *  Admin Partner API — Maximum Coverage Edition
 * ============================================================
 */

test.describe("Admin Partner API", () => {
  listPartnersSuites();
  getPartnerByIdSuites();
  partnerStatusSuites();
  partnersSecuritySuites();
  partnerResponseContractSuites();
  bulkDeletePartnersSuites();
});
