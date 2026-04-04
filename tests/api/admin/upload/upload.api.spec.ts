import { test } from "../../../fixtures/auth.fixture.js";
import { uploadImageSuites } from "./suites/uploadImage.suite.js";

/**
 * ============================================================
 *  Admin Upload API — Maximum Coverage
 * ============================================================
 */

test.describe("Admin Upload API", () => {
  uploadImageSuites();
});
