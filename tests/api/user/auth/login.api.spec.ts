import { test } from "../../../fixtures/auth.fixture.js";
import { loginHappyPathSuites } from "./suites/login/loginHappyPath.suite.js";
import { loginValidationSuites } from "./suites/login/loginValidation.suite.js";
import { loginSecuritySuites } from "./suites/login/loginSecurity.suite.js";

/**
 * ============================================================
 *  User Login API — Maximum Coverage
 * ============================================================
 */

test.describe("User Login API", () => {
  test.setTimeout(120_000); // Higher timeout for Mail.tm/Rate limiting
  loginHappyPathSuites();
  loginValidationSuites();
  loginSecuritySuites();
});
