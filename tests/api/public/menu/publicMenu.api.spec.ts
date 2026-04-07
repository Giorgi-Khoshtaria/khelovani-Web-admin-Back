import { test } from "../../../fixtures/user.fixture.js";
import { getPublicMenuSuites } from "./suites/getPublicMenu.suite.js";
import { publicMenuSecuritySuites } from "./suites/publicMenuSecurity.suite.js";

/**
 * ============================================================
 *  Public Menu API — Maximum Coverage
 * ============================================================
 */

test.describe("Public Menu API", () => {
  getPublicMenuSuites();
  publicMenuSecuritySuites();
});
