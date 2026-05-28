import { test } from "../../../fixtures/admin.fixture.js";
import { logsHappyPathSuites } from "./suites/logsHappyPath.suite.js";
import { logsValidationSuites } from "./suites/logsValidation.suite.js";
import { logsSecuritySuites } from "./suites/logsSecurity.suite.js";

/**
 * ============================================================
 *  Admin Request Logs API — /api/admin/logs
 *  list · get-by-id · delete-by-id · clear-all
 * ============================================================
 */

test.describe("Admin Request Logs API", () => {
  logsHappyPathSuites();
  logsValidationSuites();
  logsSecuritySuites();
});
