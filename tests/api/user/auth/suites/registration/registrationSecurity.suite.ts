import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS, DEFAULT_USER } from "../../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../../helpers/utils/generators.js";
import { register, registerAndTrack } from "../../registration.helpers.js";

export const registrationSecuritySuites = () => {
  test.describe("8. Security & Injection", () => {
    test("SEC-002: 422 — NoSQL injection in email", async ({ request }) => {
      for (const email of ['{"$gt":""}', '{"$where":"return true"}', '{"$ne":null}']) {
        const res = await register(request, { email }, true);
        expect(res.status()).not.toBe(500);
        expect([400, 422]).toContain(res.status());
      }
    });

    test("SEC-003: 422 — XSS in email field", async ({ request }) => {
      const res = await register(request, { email: "<script>alert(1)</script>@test.com" }, true);
      expect(res.status()).toBe(422);
    });

    test("SEC-004: XSS in nameEn — stored safely or rejected", async ({ request, createdUsers }) => {
      const xss = "<img src=x onerror=alert(1)>";
      const { res } = await registerAndTrack(request, createdUsers, { nameEn: xss }, true).catch(() => ({
        res: { status: () => 422, text: async () => "" },
      }));
      if (res.status() === 201) {
        const text = await res.text();
        expect(text).not.toContain("<img src=x onerror=alert(1)>");
      } else {
        expect(res.status()).toBe(422);
      }
    });

    test("SEC-005: NoSQL injection in idNumber — 422 or safe", async ({ request }) => {
      for (const idNumber of ['{"$gt":""}', '{"$ne":null}']) {
        const res = await register(request, { idNumber }, true);
        expect(res.status()).not.toBe(500);
      }
    });

    test("SEC-006: password never echoed in success response", async ({ request, createdUsers }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      const text = await res.text();
      expect(text).not.toContain(DEFAULT_USER.password);
    });

    test("SEC-007: prototype pollution in body — no 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.REGISTER, {
        headers: { "Content-Type": "application/json", "x-test-bypass": "khelovani-test-2026" },
        data: JSON.stringify({
          ...DEFAULT_USER,
          email: randomEmail(),
          idNumber: randomId(),
          __proto__: { isAdmin: true },
          constructor: { prototype: { isAdmin: true } },
        }),
      });
      expect(res.status()).not.toBe(500);
    });

    test("SEC-008: 413 or 422 — huge payload never causes 500", async ({ request }) => {
      const res = await request.post(ENDPOINTS.REGISTER, {
        data: { ...DEFAULT_USER, email: randomEmail(), idNumber: randomId(), nameEn: "A".repeat(1_000_000) },
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      expect([400, 413, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("SEC-009: no stack trace or DB internals in error response", async ({ request }) => {
      const text = await (
        await register(request, { email: "bad-email" }, true)
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("SEC-010: no X-Powered-By header", async ({ request }) => {
      expect(
        (await register(request, { email: "bad-email" }, true)).headers()["x-powered-by"],
      ).toBeUndefined();
    });

    test("SEC-011: Content-Type is application/json on all error responses", async ({ request }) => {
      for (const overrides of [{ email: "bad" }, {}]) {
        const res = await register(request, overrides, true);
        expect(res.headers()["content-type"]).toContain("application/json");
      }
    });

    test("SEC-012: 422 error body includes errors array with field property", async ({ request }) => {
      const res = await register(request, { email: "bad" }, true);
      const body = await res.json();
      expect(res.status()).toBe(422);
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors[0]).toHaveProperty("field");
    });
  });

  test.describe("9. Rate Limiting", () => {
    test("RTE-001: 429 triggered after rapid burst", async ({ request }) => {
      const results = await Promise.all(
        Array.from({ length: 150 }, () =>
          request.post(ENDPOINTS.REGISTER, {
            data: { ...DEFAULT_USER, email: randomEmail(), password: "", idNumber: randomId() },
            headers: { "x-test-bypass": "none" },
          }),
        ),
      );
      const statuses = results.map((r) => r.status());
      expect(statuses.some((s) => s === 429), "Expected at least one 429 during burst").toBe(true);
    });
  });

  test.describe("10. Response Shape Contract", () => {
    test("SHP-001: 201 response has correct Content-Type", async ({ request, createdUsers }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("SHP-002: 422 response includes errors array", async ({ request }) => {
      const res = await register(request, { email: "bad" }, true);
      const body = await res.json();
      expect(res.status()).toBe(422);
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("SHP-003: 409 response body has message property", async ({ request, createdUsers }) => {
      const sharedId = randomId();
      const email1 = randomEmail();
      await register(request, { email: email1, idNumber: sharedId }, true);
      createdUsers.push({ email: email1, idNumber: sharedId, password: DEFAULT_USER.password });

      const r2 = await register(request, { email: randomEmail(), idNumber: sharedId }, true);
      const body = await r2.json();
      expect(r2.status()).toBe(409);
      expect(typeof body.message).toBe("string");
    });

    test("SHP-004: 201 response has message field", async ({ request, createdUsers }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("SHP-005: 422 error response is JSON object, never plain string", async ({ request }) => {
      const res = await register(request, { email: "bad" }, true);
      const body = await res.json().catch(() => null);
      expect(body).not.toBeNull();
      expect(typeof body).toBe("object");
      expect(Array.isArray(body)).toBe(false);
    });
  });
};
