import { test } from "../../../fixtures/user.fixture.js";
import { loginHappyPathSuites } from "./suites/login/loginHappyPath.suite.js";
import { loginValidationSuites } from "./suites/login/loginValidation.suite.js";
import { loginSecuritySuites } from "./suites/login/loginSecurity.suite.js";
import { loginFieldValidationSuites } from "./suites/login/loginFieldValidation.suite.js";

/**
 * ============================================================
 *  User Login API — Maximum Coverage
 * ============================================================
 */

test.describe("User Login API", () => {
  test.setTimeout(120_000);
  loginHappyPathSuites();
  loginValidationSuites();
  loginFieldValidationSuites();
  loginSecuritySuites();
});
