import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { createMenuItem, deleteMenuItem, VALID_MENU_ITEM } from "../menu.helpers.js";

export const menuSecuritySuites = () => {
  test.describe("5. Authorization & Role Checks — Admin Menu", () => {
    test("MNU-040: 401 — GET without token", async ({ api }) => {
      expect((await api.get(ENDPOINTS.ADMIN_MENU)).status()).toBe(401);
    });

    test("MNU-041: 401 — POST without token", async ({ api }) => {
      const res = await api.post(ENDPOINTS.ADMIN_MENU, { data: VALID_MENU_ITEM });
      expect([401, 403]).toContain(res.status());
    });

    test("MNU-043: 401 — PUT without token", async ({ adminApi, api }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        expect(
          (await api.put(`${ENDPOINTS.ADMIN_MENU}/${id}`, { data: { href: "/x" } })).status(),
        ).toBe(401);
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });

    test("MNU-044: 401 — DELETE without token", async ({ adminApi, api }) => {
      const { id } = await createMenuItem(adminApi);
      try {
        expect((await api.delete(`${ENDPOINTS.ADMIN_MENU}/${id}`)).status()).toBe(401);
      } finally {
        await deleteMenuItem(adminApi, id);
      }
    });

    test("MNU-045: 403 — partner role cannot GET admin menu", async ({ partnerApi }) => {
      expect((await partnerApi.get(ENDPOINTS.ADMIN_MENU)).status()).toBe(403);
    });

    test("MNU-046: 403 — partner role cannot POST menu item", async ({ partnerApi }) => {
      expect(
        (await partnerApi.post(ENDPOINTS.ADMIN_MENU, { data: VALID_MENU_ITEM })).status(),
      ).toBe(403);
    });

    test("MNU-047: 401 — expired JWT returns 401", async ({ api }) => {
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      expect(
        (await api.get(ENDPOINTS.ADMIN_MENU, { headers: { Authorization: `Bearer ${expired}` } }))
          .status(),
      ).toBe(401);
    });

    test("MNU-048: 401 — tampered JWT signature returns 401", async ({ api }) => {
      expect(
        (
          await api.get(ENDPOINTS.ADMIN_MENU, {
            headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.INVALID" },
          })
        ).status(),
      ).toBe(401);
    });
  });

  test.describe("6. Security — Admin Menu", () => {
    test("MNU-050: NoSQL injection in POST body label — no 500", async ({ adminApi }) => {
      const injections = [
        { ...VALID_MENU_ITEM, label: { ka: '{"$gt":""}', en: "ok" } },
        { ...VALID_MENU_ITEM, href: '{"$where":"return true"}' },
      ];
      for (const data of injections) {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data });
        expect(res.status()).not.toBe(500);
      }
    });

    test("MNU-051: XSS in href — stored safely or rejected", async ({ adminApi }) => {
      const xssHref = "/test<script>alert(1)</script>";
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: { ...VALID_MENU_ITEM, href: xssHref },
      });
      if (res.status() === 201) {
        const body = await res.json();
        const id = body.data?._id ?? body._id;
        const text = (await adminApi.get(`${ENDPOINTS.ADMIN_MENU}`)).text();
        expect(await text).not.toContain("<script>alert(1)</script>");
        if (id) await deleteMenuItem(adminApi, id);
      } else {
        expect(res.status()).toBe(422);
      }
    });

    test("MNU-052: mass assignment — cannot set _id or internal fields via POST", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: { ...VALID_MENU_ITEM, _id: "000000000000000000000099", isInternal: true },
      });
      if (res.status() === 201) {
        const body = await res.json();
        const id = body.data?._id ?? body._id;
        expect(id).not.toBe("000000000000000000000099");
        if (id) await deleteMenuItem(adminApi, id);
      } else {
        expect([400, 422]).toContain(res.status());
      }
    });

    test("MNU-053: path traversal in id — 422 or 404, never 500", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_MENU}/../../etc/passwd`);
      expect([404, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("MNU-054: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const text = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_MENU}/000000000000000000000000`)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("MNU-055: no X-Powered-By header", async ({ adminApi }) => {
      expect((await adminApi.get(ENDPOINTS.ADMIN_MENU)).headers()["x-powered-by"]).toBeUndefined();
    });

    test("MNU-056: 413 or 422 — extremely large POST body never causes 500", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        data: { ...VALID_MENU_ITEM, label: { ka: "ა".repeat(100_000), en: "x".repeat(100_000) } },
      });
      expect([413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("MNU-057: prototype pollution in POST body — no 500", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          ...VALID_MENU_ITEM,
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("MNU-058: 429 — rate limit triggered on rapid write operations", async ({
      playwright,
      adminUser,
    }) => {
      const requestContext = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
      });

      const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
        data: { email: adminUser.email, password: adminUser.password },
      });
      const loginBody = await loginRes.json();
      const token = loginBody.data?.token ?? loginBody.token;

      const authContext = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        extraHTTPHeaders: { Authorization: `Bearer ${token}` },
      });

      const results = await Promise.all(
        Array.from({ length: 65 }, () =>
          authContext.post(ENDPOINTS.ADMIN_MENU, { data: {} }),
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses).toContain(429);

      await authContext.dispose();
      await requestContext.dispose();
    });
  });
};
