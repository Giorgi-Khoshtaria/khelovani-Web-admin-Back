import { test } from "../../../fixtures/auth.fixture.js";
import { getPublicMenuSuites } from "./suites/getPublicMenu.suite.js";

/**
 * ============================================================
 *  Public Menu API — Maximum Coverage
 * ============================================================
 */

test.describe("Public Menu API", () => {
  getPublicMenuSuites();
});
