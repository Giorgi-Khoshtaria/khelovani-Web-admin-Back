import { test } from "../../../fixtures/admin.fixture.js";
import { createTranslationSuites } from "./suites/createTranslation.suite.js";
import { updateTranslationSuites } from "./suites/updateTranslation.suite.js";
import { bulkTranslationSuites } from "./suites/bulkTranslation.suite.js";

/**
 * ============================================================
 *  Admin Translation API — Maximum Coverage
 * ============================================================
 */

test.describe("Admin Translation API", () => {
  createTranslationSuites();
  updateTranslationSuites();
  bulkTranslationSuites();
});
