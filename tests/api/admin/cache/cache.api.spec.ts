import { test } from "../../../fixtures/admin.fixture.js";
import { clearCacheSuites } from "./suites/clearCache.suite.js";

/**
 * ============================================================
 *  Admin Cache API — DELETE /api/admin/cache
 * ============================================================
 */

test.describe("Admin Cache API", () => {
  clearCacheSuites();
});
