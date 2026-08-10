import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, partnerReviewsUrl } from "../../../../constants/endpoints.js";
import {
  anonContext,
  createApprovedPartner,
  createReviewer,
  deletePartner,
  deleteReviewer,
  leaveReview,
  loginPartnerContext,
} from "../reviews.helpers.js";

/**
 * The isolation guarantee: a partner must never be able to reach another
 * partner's reviews, no matter what it puts in the path or the query string.
 */
export const reviewsSecuritySuites = () => {
  test.describe("5. Authorization & tenant isolation", () => {
    test("RV-040: 401 — the partner review inbox requires a token", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.PARTNER_REVIEWS);
      expect(res.status()).toBe(401);
    });

    test("RV-041: 401 — rating requires a logged-in user", async ({
      playwright,
    }) => {
      const partner = await createApprovedPartner();
      const anon = await anonContext(playwright);

      const res = await anon.post(partnerReviewsUrl(partner.id), {
        data: { rating: 5, comment: "საკმარისად გრძელი კომენტარი აქ წერია." },
      });
      expect(res.status()).toBe(401);

      await anon.dispose();
      await deletePartner(partner);
    });

    test("RV-042: a partner sees only its own reviews", async ({
      playwright,
    }) => {
      const a = await createApprovedPartner();
      const b = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);

      await leaveReview(reviewer, a.id, { rating: 5 });
      await leaveReview(reviewer, b.id, { rating: 1 });

      const partnerA = await loginPartnerContext(playwright, a);
      const body = await (
        await partnerA.get(`${ENDPOINTS.PARTNER_REVIEWS}?limit=50`)
      ).json();

      expect(body.data.length).toBe(1);
      for (const review of body.data) {
        expect(review.partner._id).toBe(a.id);
      }

      await partnerA.dispose();
      await deleteReviewer(reviewer);
      await deletePartner(a);
      await deletePartner(b);
    });

    test("RV-043: 422 — a partner cannot smuggle another partner's id into the query", async ({
      playwright,
    }) => {
      const a = await createApprovedPartner();
      const b = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      await leaveReview(reviewer, b.id, { rating: 1 });

      const partnerA = await loginPartnerContext(playwright, a);

      for (const key of ["partner", "partnerId", "partnerType"]) {
        const res = await partnerA.get(
          `${ENDPOINTS.PARTNER_REVIEWS}?${key}=${b.id}`,
        );
        expect(res.status(), key).toBe(422);
        // And the response must not leak B's data under any circumstance.
        expect(await res.text()).not.toContain(b.id);
      }

      await partnerA.dispose();
      await deleteReviewer(reviewer);
      await deletePartner(a);
      await deletePartner(b);
    });

    test("RV-044: 403 — a partner cannot use the admin review endpoints", async ({
      partnerApi,
    }) => {
      const ghost = "507f1f77bcf86cd799439011";

      expect((await partnerApi.get(ENDPOINTS.ADMIN_REVIEWS)).status()).toBe(403);
      expect(
        (
          await partnerApi.patch(
            `${ENDPOINTS.ADMIN_REVIEWS}/${ghost}/visibility`,
            { data: { isVisible: false } },
          )
        ).status(),
      ).toBe(403);
      expect(
        (
          await partnerApi.delete(`${ENDPOINTS.ADMIN_REVIEWS}/${ghost}`)
        ).status(),
      ).toBe(403);
    });

    test("RV-045: 401 — the admin review endpoints reject anonymous callers", async ({
      api,
    }) => {
      expect((await api.get(ENDPOINTS.ADMIN_REVIEWS)).status()).toBe(401);
    });

    test("RV-046: 404 — a partner token cannot be used to leave a review", async ({
      playwright,
    }) => {
      // `id` collides across the User / Organisation collections, so an
      // organisation JWT passes `authenticate`. The controller's User lookup
      // is what blocks a partner from rating itself or a competitor.
      const a = await createApprovedPartner();
      const b = await createApprovedPartner();
      const partnerA = await loginPartnerContext(playwright, a);

      for (const target of [a.id, b.id]) {
        const res = await partnerA.post(partnerReviewsUrl(target), {
          data: { rating: 5, comment: "თვითშეფასების მცდელობა აქ იწერება." },
        });
        expect(res.status(), target).toBe(404);
      }

      await partnerA.dispose();
      await deletePartner(a);
      await deletePartner(b);
    });

    test("RV-047: 422 — a malformed partner id never reaches the database", async ({
      playwright,
    }) => {
      const reviewer = await createReviewer(playwright);
      const res = await reviewer.api.post(
        partnerReviewsUrl("not-an-object-id"),
        {
          data: { rating: 5, comment: "საკმარისად გრძელი კომენტარი აქ წერია." },
        },
      );
      expect(res.status()).toBe(422);
      await deleteReviewer(reviewer);
    });

    test("RV-048: a hidden review stays hidden from the public list", async ({
      playwright,
      adminApi,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      const created = await leaveReview(reviewer, partner.id, { rating: 2 });
      const reviewId = (await created.json()).data._id;

      await adminApi.patch(
        `${ENDPOINTS.ADMIN_REVIEWS}/${reviewId}/visibility`,
        { data: { isVisible: false } },
      );

      const anon = await anonContext(playwright);
      const publicBody = await (
        await anon.get(partnerReviewsUrl(partner.id))
      ).json();
      expect(publicBody.data).toHaveLength(0);
      expect(publicBody.meta.summary.total).toBe(0);

      await anon.dispose();
      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });
  });
};
