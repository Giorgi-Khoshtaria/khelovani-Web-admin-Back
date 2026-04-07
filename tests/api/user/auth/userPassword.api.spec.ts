import { test } from "../../../fixtures/user.fixture.js";
import { forgotPasswordSuites } from "./suites/forgotPassword/forgotPassword.suite.js";
import { resetPasswordSuites } from "./suites/forgotPassword/resetPassword.suite.js";
import { verifyAccountSuites } from "./suites/verifyAccount.suite.js";

/**
 * ============================================================
 *  User Password Management API — Maximum Coverage
 * ============================================================
 */

test.describe("User Password API", () => {
  forgotPasswordSuites();
  resetPasswordSuites();
  verifyAccountSuites();
});
