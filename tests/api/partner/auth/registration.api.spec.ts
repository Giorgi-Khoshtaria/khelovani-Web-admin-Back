import { test } from "../../../fixtures/partner.fixture.js";
import { partnerRegistrationHappyPathSuites } from "./suites/partnerRegistrationHappyPath.suite.js";
import { partnerRegistrationValidationSuites } from "./suites/partnerRegistrationValidation.suite.js";
import { partnerRegistrationSecuritySuites } from "./suites/partnerRegistrationSecurity.suite.js";
import { partnerFieldValidationSuites } from "./suites/partnerFieldValidation.suite.js";

test.describe("Partner Registration API", () => {
  partnerRegistrationHappyPathSuites();
  partnerRegistrationValidationSuites();
  partnerFieldValidationSuites();
  partnerRegistrationSecuritySuites();
});
