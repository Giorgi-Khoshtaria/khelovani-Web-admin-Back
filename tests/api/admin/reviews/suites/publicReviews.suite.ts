import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { partnerReviewsUrl } from "../../../../constants/endpoints.js";
import {
  anonContext,
  createApprovedPartner,
  createReviewer,
  deletePartner,
  deleteReviewer,
  leaveReview,
} from "../reviews.helpers.js";

export const publicReviewsSuites = () => {
  test.describe("2. GET /api/partner/:id/reviews — Public list", () => {
    test("RV-010: 200 — anonymous visitors see the list but no reviewer emails", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      await leaveReview(reviewer, partner.id, { rating: 5 });

      const anon = await anonContext(playwright);
      const res = await anon.get(partnerReviewsUrl(partner.id));
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].user.email).toBeUndefined();
      expect(body.data[0].user.nameEn).toBeTruthy();
      expect(body.meta.summary.average).toBe(5);
      expect(body.meta.myReview).toBeNull();

      await anon.dispose();
      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-011: 200 — a logged-in reviewer gets meta.myReview for prefilling", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      await leaveReview(reviewer, partner.id, { rating: 4 });

      const res = await reviewer.api.get(partnerReviewsUrl(partner.id));
      const body = await res.json();

      expect(body.meta.myReview).not.toBeNull();
      expect(body.meta.myReview.rating).toBe(4);

      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-012: pagination meta is correct", async ({ playwright }) => {
      const partner = await createApprovedPartner();
      const reviewers = [
        await createReviewer(playwright),
        await createReviewer(playwright),
        await createReviewer(playwright),
      ];
      for (const r of reviewers) await leaveReview(r, partner.id);

      const anon = await anonContext(playwright);
      const res = await anon.get(
        `${partnerReviewsUrl(partner.id)}?page=1&limit=2`,
      );
      const body = await res.json();

      expect(body.data).toHaveLength(2);
      expect(body.meta.totalCount).toBe(3);
      expect(body.meta.totalPages).toBe(2);
      expect(body.meta.currentPage).toBe(1);

      await anon.dispose();
      for (const r of reviewers) await deleteReviewer(r);
      await deletePartner(partner);
    });

    test("RV-013: 422 — unknown query keys are rejected", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const anon = await anonContext(playwright);

      const res = await anon.get(
        `${partnerReviewsUrl(partner.id)}?isVisible=false`,
      );
      expect(res.status()).toBe(422);

      await anon.dispose();
      await deletePartner(partner);
    });
  });
};
