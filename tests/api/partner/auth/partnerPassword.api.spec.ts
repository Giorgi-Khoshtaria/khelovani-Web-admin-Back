import { test } from "@playwright/test";
import { DbHelper } from "../../../helpers/db/db.helper.js";
import { partnerPasswordHappyPathSuites } from "./suites/partnerPasswordHappyPath.suite.js";
import { partnerPasswordValidationSuites } from "./suites/partnerPasswordValidation.suite.js";
import { partnerPasswordSecuritySuites } from "./suites/partnerPasswordSecurity.suite.js";

/**
 * ============================================================
 *  Partner Password Recovery API
 *  POST /api/partner/forgot-password
 *  POST /api/partner/reset-password
 * ============================================================
 */

test.describe("Partner Password Recovery API", () => {
  test.afterAll(async () => {
    await DbHelper.disconnect();
  });

  partnerPasswordHappyPathSuites();
  partnerPasswordValidationSuites();
  partnerPasswordSecuritySuites();
});
