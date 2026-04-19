import { test } from "../../../fixtures/user.fixture.js";

import { forgotPasswordHappyPathSuites } from "./suites/forgotPassword/forgotPasswordHappyPath.suite.js";
import { forgotPasswordValidationSuites } from "./suites/forgotPassword/forgotPasswordValidation.suite.js";
import { forgotPasswordSecuritySuites } from "./suites/forgotPassword/forgotPasswordSecurity.suite.js";

import { resetPasswordValidationSuites } from "./suites/resetPassword/resetPasswordValidation.suite.js";
import { resetPasswordAuthSuites } from "./suites/resetPassword/resetPasswordAuth.suite.js";
import { resetPasswordSecuritySuites } from "./suites/resetPassword/resetPasswordSecurity.suite.js";

import { verifyAccountHappyPathSuites } from "./suites/verifyAccount/verifyAccountHappyPath.suite.js";
import { verifyAccountValidationSuites } from "./suites/verifyAccount/verifyAccountValidation.suite.js";
import { verifyAccountSecuritySuites } from "./suites/verifyAccount/verifyAccountSecurity.suite.js";

test.describe("User Password API", () => {
  test.describe("Forgot Password", () => {
    forgotPasswordHappyPathSuites();
    forgotPasswordValidationSuites();
    forgotPasswordSecuritySuites();
  });

  test.describe("Reset Password", () => {
    resetPasswordValidationSuites();
    resetPasswordAuthSuites();
    resetPasswordSecuritySuites();
  });

  test.describe("Verify Account", () => {
    verifyAccountHappyPathSuites();
    verifyAccountValidationSuites();
    verifyAccountSecuritySuites();
  });
});
