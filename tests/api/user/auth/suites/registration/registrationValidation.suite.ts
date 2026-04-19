import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS, DEFAULT_USER } from "../../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../../helpers/utils/generators.js";
import { register } from "../../registration.helpers.js";

export const registrationValidationSuites = () => {
  // ─── Conflict (409) ──────────────────────────────────────────────
  test.describe("1. Conflict Handling (409)", () => {
    test("DUP-001: 409 — duplicate idNumber with different email", async ({
      request,
      createdUsers,
    }) => {
      const sharedId = randomId();
      const email1 = randomEmail();

      await register(request, { email: email1, idNumber: sharedId }, true);
      createdUsers.push({ email: email1, idNumber: sharedId, password: DEFAULT_USER.password });

      const r2 = await register(request, { email: randomEmail(), idNumber: sharedId }, true);
      expect(r2.status()).toBe(409);
      const body = await r2.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("DUP-002: 409 — duplicate idNumber response has no stack trace", async ({
      request,
      createdUsers,
    }) => {
      const sharedId = randomId();
      const email1 = randomEmail();

      await register(request, { email: email1, idNumber: sharedId }, true);
      createdUsers.push({ email: email1, idNumber: sharedId, password: DEFAULT_USER.password });

      const r2 = await register(request, { email: randomEmail(), idNumber: sharedId }, true);
      const text = await r2.text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/at Object\./);
    });
  });

  // ─── Bad Request / Protocol ──────────────────────────────────────
  test.describe("2. Bad Request / Protocol (400)", () => {
    test("ERR-001: 422 — empty object body {}", async ({ request }) => {
      const res = await request.post(ENDPOINTS.REGISTER, {
        data: {},
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json().catch(() => ({}));
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("ERR-002: 400 — malformed JSON body", async ({ request }) => {
      const res = await request.post(ENDPOINTS.REGISTER, {
        headers: {
          "Content-Type": "application/json",
          "x-test-bypass": "khelovani-test-2026",
        },
        data: '{ "email": "broken" ',
      });
      expect(res.status()).toBe(400);
    });

    test("ERR-003: 422 — all required fields missing individually produce field errors", async ({
      request,
    }) => {
      for (const field of ["email", "password", "idNumber", "nameEn", "phone", "city", "address", "dateOfBirth"]) {
        const overrides: Record<string, any> = { [field]: undefined };
        const res = await register(request, overrides, true);
        expect(res.status(), `Missing field: ${field}`).toBe(422);
      }
    });
  });
};
