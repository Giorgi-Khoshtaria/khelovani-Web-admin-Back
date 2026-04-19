import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS } from "../../../../../constants/endpoints.js";

const BYPASS = { "x-test-bypass": "khelovani-test-2026" };
const VALID_PASSWORD = "NewStrongPassword123!";
const DUMMY_TOKEN = "dummy_token";

export const resetPasswordValidationSuites = () => {
  test.describe("1. Validation (422)", () => {
    test("RST-010: 422 — empty body {}", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: {},
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("RST-011: 422 — missing token field", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "token" }));
    });

    test("RST-012: 422 — missing password field", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-013: 422 — empty token string", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "", password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "token" }));
    });

    test("RST-014: 422 — null token", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: null, password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
    });

    test("RST-015: 422 — token over 512 characters", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: "a".repeat(513), password: VALID_PASSWORD },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "token" }));
    });

    test("RST-016: 422 — password too short (< 8 chars)", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "Sh1!" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-017: 422 — password over 64 characters", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "A".repeat(62) + "a1!" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-018: 422 — password missing uppercase", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "nouppercase123!" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-019: 422 — password missing lowercase", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "NOLOWER123!" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-020: 422 — password missing digit", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "NoDigit!AA" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
    });

    test("RST-021: 422 — password missing special character", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: "NoSpecial123" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
    });

    test("RST-022: 422 — unknown extra field rejected (strict mode)", async ({ request }) => {
      const res = await request.post(ENDPOINTS.RESET_PASSWORD, {
        data: { token: DUMMY_TOKEN, password: VALID_PASSWORD, unknown: "field" },
        headers: BYPASS,
      });
      expect([400, 422]).toContain(res.status());
    });
  });
};
