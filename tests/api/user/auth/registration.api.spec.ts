import { test } from "../../../fixtures/user.fixture.js";
import { registrationHappyPathSuites } from "./suites/registration/registrationHappyPath.suite.js";
import { registrationValidationSuites } from "./suites/registration/registrationValidation.suite.js";
import { registrationSecuritySuites } from "./suites/registration/registrationSecurity.suite.js";
import { registrationFieldValidationSuites } from "./suites/registration/registrationFieldValidation.suite.js";

/**
 * ============================================================
 *  User Registration API — Maximum Coverage
 * ============================================================
 */

test.describe("User Registration API", () => {
  registrationHappyPathSuites();
  registrationValidationSuites();
  registrationFieldValidationSuites();
  registrationSecuritySuites();
});
