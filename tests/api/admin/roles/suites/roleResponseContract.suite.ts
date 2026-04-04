import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createRole,
  deleteRole,
  uniqueName,
  VALID_ROLE,
} from "../roles.helpers.js";

export const roleResponseContractSuites = () => {
  test.describe("10. Response Shape Contract", () => {
    test("ROL-180: POST 201 — response has role object with _id", async ({
      adminApi,
    }) => {
      const name = uniqueName();
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: {
          name,
          description: "shape",
          allowedPanels: ["admin"],
          permissions: [],
        },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toHaveProperty("role");
      expect(body.role).toHaveProperty("_id");
      expect(body.role.name).toBe(name);
      await deleteRole(adminApi, body.role._id);
    });

    test("ROL-181: GET list items have consistent shape", async ({
      adminApi,
    }) => {
      const body = await (await adminApi.get(ENDPOINTS.ADMIN_ROLES)).json();
      for (const r of body) {
        expect(r).toHaveProperty("_id");
        expect(r).toHaveProperty("name");
        expect(r).toHaveProperty("allowedPanels");
        expect(r).toHaveProperty("permissions");
        expect(r).toHaveProperty("createdAt");
      }
    });

    test("ROL-182: GET by id — response has all required fields", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(body).toHaveProperty("_id");
        expect(body).toHaveProperty("name");
        expect(body).toHaveProperty("description");
        expect(body).toHaveProperty("allowedPanels");
        expect(body).toHaveProperty("permissions");
        expect(body).toHaveProperty("createdAt");
        expect(body).toHaveProperty("updatedAt");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-183: PUT 200 — response reflects updated fields inline", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.put(`${ENDPOINTS.ADMIN_ROLES}/${id}`, {
            data: {
              description: "shape PUT",
              allowedPanels: ["admin-organization"],
            },
          })
        ).json();
        expect(body.role.description).toBe("shape PUT");
        expect(body.role.allowedPanels).toContain("admin-organization");
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-184: 400 error response is JSON object with message field", async ({
      adminApi,
    }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
        data: { name: "" },
      });
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(typeof body).toBe("object");
      expect(body).toHaveProperty("message");
    });

    test("ROL-185: 404 error response is JSON object with message field", async ({
      adminApi,
    }) => {
      const body = await (
        await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`)
      )
        .json()
        .catch(() => null);
      expect(body).not.toBeNull();
      expect(body).toHaveProperty("message");
    });

    test("ROL-186: 409 duplicate error response has non-empty message", async ({
      adminApi,
    }) => {
      const { id, name } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.post(ENDPOINTS.ADMIN_ROLES, {
            data: { ...VALID_ROLE, name },
          })
        ).json();
        expect(typeof body.message).toBe("string");
        expect(body.message.length).toBeGreaterThan(0);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-187: Content-Type is application/json on all responses", async ({
      adminApi,
    }) => {
      const cases = [
        adminApi.get(ENDPOINTS.ADMIN_ROLES),
        adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`),
        adminApi.post(ENDPOINTS.ADMIN_ROLES, { data: { name: "" } }),
      ];
      for (const promise of cases) {
        const res = await promise;
        expect(res.headers()["content-type"]).toContain("application/json");
      }
    });

    test("ROL-188: all error responses are JSON objects — never plain strings", async ({
      adminApi,
    }) => {
      const cases = [
        adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/bad-id`),
        adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/000000000000000000000000`),
        adminApi.post(ENDPOINTS.ADMIN_ROLES, { data: {} }),
      ];
      for (const promise of cases) {
        const res = await promise;
        const body = await res.json().catch(() => null);
        expect(body).not.toBeNull();
        expect(typeof body).toBe("object");
        expect(Array.isArray(body)).toBe(false);
      }
    });

    test("ROL-189: GET by id — permissions field is an array", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(Array.isArray(body.permissions)).toBe(true);
      } finally {
        await deleteRole(adminApi, id);
      }
    });

    test("ROL-190: GET by id — allowedPanels field is an array", async ({
      adminApi,
    }) => {
      const { id } = await createRole(adminApi);
      try {
        const body = await (
          await adminApi.get(`${ENDPOINTS.ADMIN_ROLES}/${id}`)
        ).json();
        expect(Array.isArray(body.allowedPanels)).toBe(true);
      } finally {
        await deleteRole(adminApi, id);
      }
    });
  });
};
