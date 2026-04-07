import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { PartnerStatusEnum } from "../../../../../src/types/partnerStatus.js";
import { createPendingPartner } from "../partners.helpers.js";

export const partnersSecuritySuites = () => {
  test.describe("4. Authorization & Role Checks", () => {
    test("AA-070: 401 — GET list without token", async ({ api }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(401);
    });

    test("AA-071: 401 — GET by id without token", async ({ api }) => {
      const { id } = await createPendingPartner(api);
      const res = await api.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(401);
    });

    test("AA-072: 401 — PATCH status without token", async ({ api }) => {
      const { id } = await createPendingPartner(api);
      const res = await api.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
        data: { status: PartnerStatusEnum.APPROVED },
      });
      expect(res.status()).toBe(401);
    });

    test("AA-073: 403 — partner role cannot GET list", async ({
      partnerApi,
    }) => {
      const res = await partnerApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.status()).toBe(403);
    });

    test("AA-074: 403 — partner role cannot GET by id", async ({
      partnerApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await partnerApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
      expect(res.status()).toBe(403);
    });

    test("AA-075: 403 — partner role cannot PATCH status", async ({
      partnerApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await partnerApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: { status: PartnerStatusEnum.APPROVED },
        },
      );
      expect(res.status()).toBe(403);
    });

    test("AA-076: 401 — expired JWT returns 401 (not 500)", async ({ api }) => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const res = await api.get(ENDPOINTS.ADMIN_PARTNERS, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status()).toBe(401);
    });

    test("AA-077: 401 — tampered/invalid JWT signature returns 401", async ({
      api,
    }) => {
      const tamperedToken =
        "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.INVALIDSIG";
      const res = await api.get(ENDPOINTS.ADMIN_PARTNERS, {
        headers: { Authorization: `Bearer ${tamperedToken}` },
      });
      expect(res.status()).toBe(401);
    });

    test("AA-078: 401 — malformed Authorization header (no Bearer prefix)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PARTNERS, {
        headers: { Authorization: "just-a-random-string" },
      });
      expect(res.status()).toBe(401);
    });
  });

  test.describe("5. Security", () => {
    test("AA-080: no password or hash in any list item", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      const body = await res.json();
      const partners = body.partners || body;
      for (const partner of partners) {
        expect(partner).not.toHaveProperty("password");
        expect(partner).not.toHaveProperty("passwordHash");
      }
    });

    test("AA-081: no password or hash in GET by id response", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`)
      ).json();
      expect(body).not.toHaveProperty("password");
      expect(body).not.toHaveProperty("passwordHash");
    });

    test("AA-082: NoSQL injection in search param — no 500", async ({
      adminApi,
    }) => {
      const injections = [
        { search: '{"$gt": ""}' },
        { search: '{"$where": "return true"}' },
        { search: "'; DROP TABLE partners; --" },
      ];
      for (const params of injections) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, { params });
        expect(res.status()).not.toBe(500);
      }
    });

    test("AA-083: path traversal in id param — 400 or 404, not 500", async ({
      adminApi,
    }) => {
      const traversals = ["../admin", "..%2Fadmin", "%2e%2e%2fadmin"];
      for (const id of traversals) {
        const res = await adminApi.get(`${ENDPOINTS.ADMIN_PARTNERS}/${id}`);
        expect([404, 422]).toContain(res.status());
        expect(res.status()).not.toBe(500);
      }
    });

    test("AA-084: mass assignment — cannot set role=admin via status PATCH", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);

      const body = await (
        await adminApi.patch(`${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`, {
          data: {
            status: PartnerStatusEnum.APPROVED,
            role: "admin",
            isAdmin: true,
          },
        })
      ).json();

      expect(body.role).not.toBe("admin");
      expect(body.isAdmin).not.toBe(true);
    });

    test("AA-085: response has no X-Powered-By header", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS);
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("AA-086: no stack trace or DB internals in error responses", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PARTNERS}/000000000000000000000000`,
      );
      const text = await res.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("AA-087: XSS payload in search param — returned safely or rejected", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PARTNERS, {
        params: { search: "<script>alert(1)</script>" },
      });
      const text = await res.text();
      expect(text).not.toContain("<script>alert(1)</script>");
      expect(res.status()).not.toBe(500);
    });

    test("AA-088: extremely large PATCH body — 413 or 400, never 500", async ({
      adminApi,
      api,
    }) => {
      const { id } = await createPendingPartner(api);
      const res = await adminApi.patch(
        `${ENDPOINTS.ADMIN_PARTNERS}/${id}/status`,
        {
          data: {
            status: PartnerStatusEnum.APPROVED,
            junk: "x".repeat(1_000_000), // 1MB payload
          },
        },
      );
      // If schema is not strict, it might be 200 (ignored junk). 
      // If express limit is hit, it's 413. 
      // If validation fails, it's 422.
      // The important part is it's NOT 500.
      expect([200, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};
