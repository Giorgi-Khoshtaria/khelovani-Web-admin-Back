import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS, partnerReviewsUrl } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  anonContext,
  createApprovedPartner,
  createReviewer,
  deletePartner,
  deleteReviewer,
  leaveReview,
} from "../reviews.helpers.js";

export const adminReviewsSuites = () => {
  test.describe("3. GET /api/admin/reviews — Admin list & filters", () => {
    test("RV-020: 200 — filters by organisation", async ({
      playwright,
      adminApi,
    }) => {
      const a = await createApprovedPartner();
      const b = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);

      await leaveReview(reviewer, a.id, { rating: 5 });
      await leaveReview(reviewer, b.id, { rating: 2 });

      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_REVIEWS}?partnerId=${a.id}`,
      );
      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body.data.length).toBe(1);
      expect(body.data[0].partner._id).toBe(a.id);

      await deleteReviewer(reviewer);
      await deletePartner(a);
      await deletePartner(b);
    });

    test("RV-021: 200 — filters by organisation type", async ({
      playwright,
      adminApi,
    }) => {
      const org = await createApprovedPartner("organization");
      const individual = await createApprovedPartner("individual");
      const reviewer = await createReviewer(playwright);

      await leaveReview(reviewer, org.id);
      await leaveReview(reviewer, individual.id);

      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_REVIEWS}?partnerType=individual&limit=50`,
      );
      const body = await res.json();

      const ids = body.data.map(
        (r: { partner: { _id: string } }) => r.partner._id,
      );
      expect(ids).toContain(individual.id);
      expect(ids).not.toContain(org.id);

      await deleteReviewer(reviewer);
      await deletePartner(org);
      await deletePartner(individual);
    });

    test("RV-022: 200 — filters by star value and searches the comment", async ({
      playwright,
      adminApi,
    }) => {
      const partner = await createApprovedPartner();
      const a = await createReviewer(playwright);
      const b = await createReviewer(playwright);

      const marker = `zzq${Date.now()}`;
      await leaveReview(a, partner.id, {
        rating: 1,
        comment: `ძალიან ცუდი გამოცდილება ${marker} სამწუხაროდ.`,
      });
      await leaveReview(b, partner.id, { rating: 5 });

      const byStar = await adminApi.get(
        `${ENDPOINTS.ADMIN_REVIEWS}?partnerId=${partner.id}&rating=1`,
      );
      expect((await byStar.json()).data).toHaveLength(1);

      const bySearch = await adminApi.get(
        `${ENDPOINTS.ADMIN_REVIEWS}?search=${marker}`,
      );
      const searchBody = await bySearch.json();
      expect(searchBody.data).toHaveLength(1);
      expect(searchBody.data[0].rating).toBe(1);

      await deleteReviewer(a);
      await deleteReviewer(b);
      await deletePartner(partner);
    });

    test("RV-023: 422 — unknown query key is rejected", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_REVIEWS}?partner=abc`);
      expect(res.status()).toBe(422);
    });
  });

  test.describe("4. Moderation — hide / unhide / delete", () => {
    test("RV-030: hiding a review removes it from the public list and the average", async ({
      playwright,
      adminApi,
    }) => {
      const partner = await createApprovedPartner();
      const a = await createReviewer(playwright);
      const b = await createReviewer(playwright);

      await leaveReview(a, partner.id, { rating: 5 });
      await leaveReview(b, partner.id, { rating: 1 });

      const list = await adminApi.get(
        `${ENDPOINTS.ADMIN_REVIEWS}?partnerId=${partner.id}&rating=1`,
      );
      const target = (await list.json()).data[0];

      const hide = await adminApi.patch(
        `${ENDPOINTS.ADMIN_REVIEWS}/${target._id}/visibility`,
        { data: { isVisible: false } },
      );
      expect(hide.status()).toBe(200);

      const anon = await anonContext(playwright);
      const publicBody = await (
        await anon.get(partnerReviewsUrl(partner.id))
      ).json();
      expect(publicBody.data).toHaveLength(1);
      expect(publicBody.meta.summary.average).toBe(5);

      const db = await DbHelper.getPartnerById(partner.id);
      expect(db.rating).toBe(5);
      expect(db.reviewCount).toBe(1);

      // …and unhiding brings it back.
      await adminApi.patch(
        `${ENDPOINTS.ADMIN_REVIEWS}/${target._id}/visibility`,
        { data: { isVisible: true } },
      );
      const restored = await DbHelper.getPartnerById(partner.id);
      expect(restored.reviewCount).toBe(2);
      expect(restored.rating).toBe(3);

      await anon.dispose();
      await deleteReviewer(a);
      await deleteReviewer(b);
      await deletePartner(partner);
    });

    test("RV-031: deleting a review recomputes the partner's aggregate", async ({
      playwright,
      adminApi,
    }) => {
      const partner = await createApprovedPartner();
      const reviewer = await createReviewer(playwright);
      const created = await leaveReview(reviewer, partner.id, { rating: 4 });
      const reviewId = (await created.json()).data._id;

      const res = await adminApi.delete(
        `${ENDPOINTS.ADMIN_REVIEWS}/${reviewId}`,
      );
      expect(res.status()).toBe(200);

      const db = await DbHelper.getPartnerById(partner.id);
      expect(db.reviewCount).toBe(0);
      expect(db.rating).toBe(0);

      await deleteReviewer(reviewer);
      await deletePartner(partner);
    });

    test("RV-032: 404 — moderating a review that does not exist", async ({
      adminApi,
    }) => {
      const ghost = "507f1f77bcf86cd799439011";
      expect(
        (
          await adminApi.patch(
            `${ENDPOINTS.ADMIN_REVIEWS}/${ghost}/visibility`,
            { data: { isVisible: false } },
          )
        ).status(),
      ).toBe(404);
      expect(
        (await adminApi.delete(`${ENDPOINTS.ADMIN_REVIEWS}/${ghost}`)).status(),
      ).toBe(404);
    });

    test("RV-033: 422 — malformed id and malformed visibility body", async ({
      adminApi,
    }) => {
      expect(
        (await adminApi.delete(`${ENDPOINTS.ADMIN_REVIEWS}/not-an-id`)).status(),
      ).toBe(422);
      expect(
        (
          await adminApi.patch(
            `${ENDPOINTS.ADMIN_REVIEWS}/507f1f77bcf86cd799439011/visibility`,
            { data: { isVisible: "maybe" } },
          )
        ).status(),
      ).toBe(422);
    });
  });
};
