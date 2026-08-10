import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { partnerReviewsUrl, ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createApprovedPartner,
  createReviewer,
  deletePartner,
  deleteReviewer,
  leaveReview,
  loginPartnerContext,
} from "../reviews.helpers.js";

export const createReviewSuites = () => {
  test.describe("1. POST /api/partner/:id/reviews — Create & edit", () => {
    test("RV-001: 201 — a logged-in user can rate an approved partner", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);

      const res = await leaveReview(reviewer, partner.id, { rating: 5 });
      expect(res.status()).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.rating).toBe(5);

      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-002: 200 — re-submitting edits the same review, never creates a second", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);

      await leaveReview(reviewer, partner.id, { rating: 2 });
      const second = await leaveReview(reviewer, partner.id, {
        rating: 5,
        comment: "გადავიფიქრე — მომსახურება ნამდვილად შესანიშნავი აღმოჩნდა.",
      });

      expect(second.status()).toBe(200);
      expect((await second.json()).data.rating).toBe(5);
      expect(await DbHelper.countReviewsForPartner(partner.id)).toBe(1);

      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-003: the partner's rating & reviewCount are recomputed", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const a = await createReviewer(playwright);
      const b = await createReviewer(playwright);

      await leaveReview(a, partner.id, { rating: 5 });
      await leaveReview(b, partner.id, { rating: 4 });

      const db = await DbHelper.getPartnerById(partner.id);
      expect(db.reviewCount).toBe(2);
      expect(db.rating).toBe(4.5);

      await deleteReviewer(a);
      await deleteReviewer(b);
      await deletePartner(partner);
    });

    test("RV-004: 422 — rating out of range, non-integer, or unknown body key", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      const url = partnerReviewsUrl(partner.id);

      const bad = [
        { rating: 0, comment: "საკმარისად გრძელი კომენტარი აქ წერია." },
        { rating: 6, comment: "საკმარისად გრძელი კომენტარი აქ წერია." },
        { rating: 3.5, comment: "საკმარისად გრძელი კომენტარი აქ წერია." },
        { rating: 4, comment: "მოკლე" },
        { rating: 4, comment: "ა".repeat(601) },
        {
          rating: 4,
          comment: "საკმარისად გრძელი კომენტარი აქ წერია.",
          isVisible: true,
        },
      ];

      for (const data of bad) {
        const res = await reviewer.api.post(url, { data });
        expect(res.status(), JSON.stringify(data)).toBe(422);
      }

      expect(await DbHelper.countReviewsForPartner(partner.id)).toBe(0);

      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-005: 404 — a pending or hidden partner cannot be rated", async ({
      playwright,
    }) => {
      const pending = await createApprovedPartner();
      await DbHelper.setPartnerFields(pending.id, { status: "PENDING" });

      const hidden = await createApprovedPartner();
      await DbHelper.setPartnerFields(hidden.id, { isShown: false });

      const reviewer = await createReviewer(playwright);

      expect((await leaveReview(reviewer, pending.id)).status()).toBe(404);
      expect((await leaveReview(reviewer, hidden.id)).status()).toBe(404);

      await deleteReviewer(reviewer);
      await deletePartner(pending);
      await deletePartner(hidden);
    });

    test("RV-006: the partner receives their review in the panel", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      await leaveReview(reviewer, partner.id, { rating: 3 });

      const partnerApi = await loginPartnerContext(playwright, partner);

      const res = await partnerApi.get(ENDPOINTS.PARTNER_REVIEWS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].rating).toBe(3);
      expect(body.meta.summary.average).toBe(3);

      await partnerApi.dispose();
      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });
  });
};
