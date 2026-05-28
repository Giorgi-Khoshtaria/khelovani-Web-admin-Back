import { test } from "@playwright/test";
import { DbHelper } from "../../../helpers/db/db.helper.js";
import { cardsHappyPathSuites } from "./suites/cardsHappyPath.suite.js";
import { cardsValidationSuites } from "./suites/cardsValidation.suite.js";
import { cardsSecuritySuites } from "./suites/cardsSecurity.suite.js";

/**
 * ============================================================
 *  Payment Cards API — /api/user/cards
 *  add · list · set-default · delete
 * ============================================================
 */

test.describe("Payment Cards API", () => {
  test.afterAll(async () => {
    await DbHelper.disconnect();
  });

  cardsHappyPathSuites();
  cardsValidationSuites();
  cardsSecuritySuites();
});
