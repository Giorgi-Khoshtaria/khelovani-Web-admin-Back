import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };

export const forgotPasswordValidationSuites = () => {
  test.describe("2. Validation (422)", () => {
    test("FPW-010: 422 — empty body {}", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: {},
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("FPW-011: 422 — empty string email", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("FPW-012: 422 — null email", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: null },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("FPW-013: 422 — number instead of email", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: 12345 },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
    });

    test("FPW-014: 422 — missing @ symbol", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "invalid-email" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("FPW-015: 422 — missing domain part", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "user@" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
    });

    test("FPW-016: 422 — missing local part", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "@test.com" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
    });

    test("FPW-017: 422 — email over 150 characters", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "a".repeat(142) + "@test.com" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("FPW-018: 422 — unknown extra field rejected (strict mode)", async ({ request }) => {
      const res = await request.post(ENDPOINTS.FORGOT_PASSWORD, {
        data: { email: "valid@example.com", unknown: "field" },
        headers: BYPASS,
      });
      expect(res.status()).toBe(422);
    });
  });
};
