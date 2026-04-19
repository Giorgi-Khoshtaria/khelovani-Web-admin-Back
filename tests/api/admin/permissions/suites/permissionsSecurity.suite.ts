import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createPermission,
  deletePermission,
  uniqueName,
  VALID_PERMISSION,
} from "../permissions.helpers.js";
import { randomId } from "../../../../helpers/utils/generators.js";

export const permissionsSecuritySuites = () => {
  test.describe("6. Authorization & Role Checks", () => {
    test("PRM-090: 401 — no token: GET list", async ({ api }) => {
      expect((await api.get(ENDPOINTS.ADMIN_PERMISSIONS)).status()).toBe(401);
    });

    test("PRM-091: 401 — no token: POST create", async ({ api }) => {
      const res = await api.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name: uniqueName(), description: "x", category: "x" },
      });
      expect(res.status()).toBe(401);
    });

    test("PRM-092: 401 — no token: PUT update", async ({ api, adminApi }) => {
      const { id } = await createPermission(adminApi);
      try {
        expect(
          (
            await api.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
              data: { description: "x" },
            })
          ).status(),
        ).toBe(401);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-093: 401 — no token: DELETE", async ({ api, adminApi }) => {
      const { id } = await createPermission(adminApi);
      try {
        expect(
          (await api.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)).status(),
        ).toBe(401);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-094: 403 — partner role: GET list", async ({ partnerApi }) => {
      expect((await partnerApi.get(ENDPOINTS.ADMIN_PERMISSIONS)).status()).toBe(
        403,
      );
    });

    test("PRM-095: 403 — partner role: POST create", async ({ partnerApi }) => {
      const res = await partnerApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name: uniqueName(), description: "x", category: "x" },
      });
      expect(res.status()).toBe(403);
    });

    test("PRM-096: 401 — expired JWT returns 401 (not 500)", async ({
      api,
    }) => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      const res = await api.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      expect(res.status()).toBe(401);
    });

    test("PRM-097: 401 — tampered JWT signature returns 401", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.INVALID",
        },
      });
      expect(res.status()).toBe(401);
    });

    test("PRM-098: 401 — malformed Authorization header (no Bearer prefix)", async ({
      api,
    }) => {
      const res = await api.get(ENDPOINTS.ADMIN_PERMISSIONS, {
        headers: { Authorization: "just-a-random-token" },
      });
      expect(res.status()).toBe(401);
    });
  });

  test.describe("7. Security", () => {
    test("PRM-100: NoSQL injection in search param — no 500", async ({
      adminApi,
    }) => {
      const injections = [
        '{"$gt": ""}',
        '{"$where": "return true"}',
      ];
      for (const search of injections) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS, {
          params: { search },
        });
        expect(res.status()).not.toBe(500);
      }
    });

    test("PRM-101: XSS in name field on create → 422 (rejected by validation)", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { ...VALID_PERMISSION, name: "<script>alert(1)</script>" },
      });
      expect(res.status()).toBe(422);
    });

    test("PRM-102: XSS in description — stored safely or rejected", async ({
      adminApi,
    }) => {
      const xssPayload = "<img src=x onerror=alert(1)>";
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, description: xssPayload, category: "General" },
      });

      if (res.status() === 201) {
        const body = await res.json();
        const id = body.data._id;

        const getRes = await adminApi.get(
          `${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`,
        );
        const getText = await getRes.text();
        expect(getText).not.toContain("<img src=x onerror=alert(1)>");

        await deletePermission(adminApi, id);
      } else {
        expect(res.status()).toBe(422);
      }
    });

    test("PRM-103: no stack trace or DB internals in error responses", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      const text = await res.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("PRM-104: mass assignment — cannot set internal fields via POST", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: {
          name,
          description: "test",
          category: "General",
          _id: "000000000000000000000099",
          createdAt: "2000-01-01T00:00:00Z",
          isSystem: true,
        },
      });

      if (res.status() === 201) {
        const body = await res.json();
        expect(body.data._id).not.toBe("000000000000000000000099");
        expect(body.data.isSystem).not.toBe(true);
        await deletePermission(adminApi, body.data._id);
      } else {
        expect(res.status()).toBe(422);
      }
    });

    test("PRM-105: 413 or 400 — extremely large request body never causes 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: {
          name: uniqueName(),
          description: "x".repeat(1_000_000),
          category: "General",
        },
      });
      expect([413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("PRM-106: no X-Powered-By header in response", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS);
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

  });

  test.describe("8. Response Shape Contract", () => {
    test("PRM-110: postmodern 201 — response has permission object with _id", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, description: "shape check", category: "General" },
      });
      const body = await res.json();
      expect(res.status()).toBe(201);
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("_id");
      expect(body.data.name).toBe(name);
      await deletePermission(adminApi, body.data._id);
    });

    test("PRM-111: POST 201 — Content-Type is application/json", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name, description: "ct check", category: "General" },
      });
      expect(res.headers()["content-type"]).toContain("application/json");
      const body = await res.json();
      await deletePermission(adminApi, body.data._id);
    });

    test("PRM-112: PUT 200 — response reflects updated fields", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`, {
            data: { description: "shape test", category: "ShapeCat" },
          })
        ).json();

        expect(body.data.description).toBe("shape test");
        expect(body.data.category).toBe("ShapeCat");
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-113: 422 error response is JSON object with errors array", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
        data: { name: "" },
      });
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(typeof body).toBe("object");
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("PRM-114: 404 error response is JSON object with message", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`,
      );
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(body).toHaveProperty("message");
    });

    test("PRM-115: 409 duplicate error response has message", async ({
      adminApi,
    }) => {
      const { id, name } = await createPermission(adminApi);

      try {
        const res = await adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, {
          data: { ...VALID_PERMISSION, name },
        });
        const body = await res.json();
        expect(res.status()).toBe(409);
        expect(typeof body.message).toBe("string");
        expect(body.message.length).toBeGreaterThan(0);
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-116: GET list items have consistent shape", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      try {
        const body = await (
          await adminApi.get(ENDPOINTS.ADMIN_PERMISSIONS)
        ).json();
        for (const p of body.data) {
          expect(p).toHaveProperty("_id");
          expect(p).toHaveProperty("name");
          expect(p).toHaveProperty("category");
          expect(p).toHaveProperty("createdAt");
        }
      } finally {
        await deletePermission(adminApi, id);
      }
    });

    test("PRM-117: all error responses are JSON objects: never plain strings", async ({
      adminApi,
    }) => {
      const cases = [
        adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/bad-id`),
        adminApi.get(`${ENDPOINTS.ADMIN_PERMISSIONS}/000000000000000000000000`),
        adminApi.post(ENDPOINTS.ADMIN_PERMISSIONS, { data: { name: "" } }),
      ];
      for (const promise of cases) {
        const res = await promise;
        const body = await res.json().catch(() => null);
        expect(body).not.toBeNull();
        expect(typeof body).toBe("object");
        expect(Array.isArray(body)).toBe(false);
      }
    });

    test("PRM-118: DELETE 200 response confirms deletion with message or deleted object", async ({
      adminApi,
    }) => {
      const { id } = await createPermission(adminApi);

      const body = await (
        await adminApi.delete(`${ENDPOINTS.ADMIN_PERMISSIONS}/${id}`)
      ).json();

      const hasMessage = typeof body.message === "string";
      const hasDeletedId = body.data?._id === id || body._id === id;
      expect(
        hasMessage || hasDeletedId,
        "DELETE response must confirm what was deleted",
      ).toBe(true);
    });
  });
};
