import { test } from "@playwright/test";
import { DbHelper } from "../../../helpers/db/db.helper.js";
import { addressesHappyPathSuites } from "./suites/addressesHappyPath.suite.js";
import { addressesValidationSuites } from "./suites/addressesValidation.suite.js";
import { addressesSecuritySuites } from "./suites/addressesSecurity.suite.js";

/**
 * ============================================================
 *  Addresses API — /api/user/addresses
 *  add · list · update · set-default · delete
 * ============================================================
 */

test.describe("Addresses API", () => {
  test.afterAll(async () => {
    await DbHelper.disconnect();
  });

  addressesHappyPathSuites();
  addressesValidationSuites();
  addressesSecuritySuites();
});
