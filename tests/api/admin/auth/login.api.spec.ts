import { test } from "../../../fixtures/admin.fixture.js";
import { loginHappyPathSuites } from "./suites/loginHappyPath.suite.js";
import { loginValidationSuites } from "./suites/loginValidation.suite.js";
import { loginSecuritySuites } from "./suites/loginSecurity.suite.js";
import { loginFieldValidationSuites } from "./suites/loginFieldValidation.suite.js";

/**
 * ============================================================
 *  Admin Login API — Maximum Coverage
 * ============================================================
 */

test.describe("Admin Login API", () => {
  loginHappyPathSuites();
  loginValidationSuites();
  loginFieldValidationSuites();
  loginSecuritySuites();
});
