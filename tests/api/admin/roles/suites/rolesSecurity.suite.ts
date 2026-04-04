import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createRole,
  deleteRole,
  uniqueName,
  VALID_ROLE,
} from "../roles.helpers.js";

export const rolesSecuritySuites = () => {
  test.describe("8. Authorization & Role Checks", () => {
    test("ROL-150: 401 — no token: GET list", async ({ api }) => {
      expect((await api.get(ENDPOINTS.ADMIN_ROLES)).status()).toBe(401);
    });

    test("ROL-151: 401 — no token: POST create", async ({ api }) => {
      expect(
        (
          await api.post(ENDPOINTS.ADMIN_ROLES, {
            data: { name: uniqueName() },
          })
        ).status(),
      ).toBe(401);
    });

    test("ROL-152: 401 — no token: PUT update", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (
            await api.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
              data: { description: "x" },
            })
          ).status(),
        ).toBe(401);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-153: 401 — no token: DELETE", async ({ api, adminApi }) => {
      const { id } = await createRole(adminApi);
      try {
        expect(
          (await api.delete(`${ENDPOINTS.ADMIN_ROLES}/${id}`)).status(),
        ).toBe(401);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-154: 403 — partner role: GET list", async ({ partnerApi }) => {
      expect((await partnerApi.get(ENDPOINTS.ADMIN_ROLES)).status()).toBe(403);
    });

    test("ROL-155: 403 — partner role: POST create", async ({ partnerApi }) => {
      expect(
        (
          await partnerApi.post(ENDPOINTS.ADMIN_ROLES, {
            data: { name: uniqueName() },
          })
        ).status(),
      ).toBe(403);
    });

    test("ROL-156: 401 — expired JWT returns 401", async ({ api }) => {
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      expect(
        (
          await api.get(ENDPOINTS.ADMIN_ROLES, {
            headers: { Authorization: `Bearer ${expired}` },
          })
        ).status(),
      ).toBe(401);
    });

    test("ROL-157: 401 — tampered JWT signature returns 401", async ({
      api,
    }) => {
      expect(
        (
          await api.get(ENDPOINTS.ADMIN_ROLES, {
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.INVALID",
            },
          })
        ).status(),
      ).toBe(401);
    });

    test("ROL-158: 401 — malformed Authorization header (no Bearer prefix)", async ({
      api,
    }) => {
      expect(
        (
          await api.get(ENDPOINTS.ADMIN_ROLES, {
            headers: { Authorization: "just-a-token" },
          })
        ).status(),
      ).toBe(401);
    });
  });

  test.describe("9. Security", () => {
    test("ROL-160: NoSQL injection in search param — no 500", async ({
      adminApi,
    }) => {
      for (const search of [
        '{"$gt":""}',
        '{"$where":"return true"}',
        "'; DROP TABLE roles;--",
      ]) {
        const res = await adminApi.get(ENDPOINTS.ADMIN_ROLES, {
          params: { search },
        });
        expect(res.status()).not.toBe(500);
      }
    });

    test("ROL-161: SQL injection in role name on create → 400", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "'; DROP TABLE roles; --" },
      });
      expect(res.status()).toBe(400);
    });

    test("ROL-162: XSS in name field on create → 400", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { ...VALID_ROLE, name: "<script>alert(1)</script>" },
      });
      expect(res.status()).toBe(400);
    });

    test("ROL-163: XSS in description — stored safely or rejected", async ({
      adminApi,
    }) => {
      const xss = "<img src=x onerror=alert(1)>";
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { name, description: xss, allowedPanels: ["admin"] },
      });
      if (res.status() === 201) {
        const body = await res.json();
        const text = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${body.role._id}`)
        ).text();
        expect(text).not.toContain("<img src=x onerror=alert(1)>");
        await deleteRole(adminApi, body.role._id);
      } else {
        expect([400, 422]).toContain(res.status());
      }
    });

    test("ROL-164: mass assignment — cannot spoof _id on create", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name,
          _id: "000000000000000000000099",
          isSystem: true,
        },
      });
      if (res.status() === 201) {
        const body = await res.json();
        expect(body.role._id).not.toBe("000000000000000000000099");
        expect(body.role.isSystem).not.toBe(true);
        await deleteRole(adminApi, body.role._id);
      } else {
        expect([400, 422]).toContain(res.status());
      }
    });

    test("ROL-165: no stack trace or DB internals in error responses", async ({
      adminApi,
    }) => {
      const text = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("ROL-166: 413 or 400 — extremely large request body never causes 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name: uniqueName(),
          description: "x".repeat(1_000_000),
        },
      });
      expect([400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("ROL-167: no X-Powered-By header in response", async ({
      adminApi,
    }) => {
      expect(
        (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).headers()["x-powered-by"],
      ).toBeUndefined();
    });

    test("ROL-168: prototype pollution in body — no 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          name: uniqueName(),
          allowedPanels: ["admin"],
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("ROL-169: path traversal in id on GET — 400 or 404, never 500", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_ROLES}/../../etc/passwd`,
      );
      expect([400, 404]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("ROL-170: permissions array cannot inject code via stringified object", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          ...VALID_ROLE,
          name: uniqueName(),
          permissions: ['{"$where": "return true"}'],
        },
      });
      expect([400, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });
  });
};
