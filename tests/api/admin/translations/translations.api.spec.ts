import { test } from "../../../fixtures/auth.fixture.js";
import { createTranslationSuites } from "./suites/createTranslation.suite.js";
import { bulkTranslationSuites } from "./suites/bulkTranslation.suite.js";

/**
 * ============================================================
 *  Admin Translation API — Maximum Coverage
 * ============================================================
 */

test.describe("Admin Translation API", () => {
  createTranslationSuites();
  bulkTranslationSuites();
});
