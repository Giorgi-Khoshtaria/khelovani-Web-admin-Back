import { test } from "../../../fixtures/admin.fixture.js";
import { createReviewSuites } from "./suites/createReview.suite.js";
import { publicReviewsSuites } from "./suites/publicReviews.suite.js";
import { adminReviewsSuites } from "./suites/adminReviews.suite.js";
import { reviewsSecuritySuites } from "./suites/reviewsSecurity.suite.js";

/**
 * ============================================================
 *  Partner Reviews API — public, partner and admin surfaces
 * ============================================================
 */

test.describe("Partner Reviews API", () => {
  createReviewSuites();
  publicReviewsSuites();
  adminReviewsSuites();
  reviewsSecuritySuites();
});
