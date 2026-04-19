import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS, DEFAULT_USER } from "../../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../../helpers/utils/generators.js";
import {
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
  nameEnValidationScenarios,
  passwordValidationScenarios,
  addressValidationScenarios,
} from "../../../../../helpers/shared/validation.helper.js";
import { register, registerAndTrack } from "../../registration.helpers.js";

export const registrationValidationSuites = () => {
  // ─── Conflict (409) ──────────────────────────────────────────────
  test.describe("3. Conflict Handling (409)", () => {
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

  // ─── Email Validation ────────────────────────────────────────────
  test.describe("4. Email Validation (422)", () => {
    for (const { id, field, value, note } of emailValidationScenarios) {
      test(`${id}: 422 — Email: ${note}`, async ({ request }) => {
        const res = await register(request, { [field]: value }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }

    test("VAL-EMAIL-010: 422 — email is null", async ({ request }) => {
      const res = await register(request, { email: null as any }, true);
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
    });

    test("VAL-EMAIL-011: 422 — email longer than 254 characters", async ({ request }) => {
      const res = await register(request, { email: "a".repeat(245) + "@test.com" }, true);
      expect(res.status()).toBe(422);
    });
  });

  // ─── Password Validation ─────────────────────────────────────────
  test.describe("5. Password Complexity (422)", () => {
    for (const { id, field, value, note } of passwordValidationScenarios) {
      test(`${id}: 422 — Password: ${note}`, async ({ request }) => {
        const res = await register(request, { password: value, email: randomEmail() }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
      });
    }

    test("VAL-PWD-010: 422 — password is null", async ({ request }) => {
      const res = await register(request, { password: null as any, email: randomEmail() }, true);
      expect(res.status()).toBe(422);
    });
  });

  // ─── Phone Validation ────────────────────────────────────────────
  test.describe("6. Phone Validation (422)", () => {
    for (const { id, field, value, note } of phoneValidationScenarios) {
      test(`${id}: 422 — Phone: ${note}`, async ({ request }) => {
        const res = await register(request, { [field]: value, email: randomEmail() }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── City Validation ─────────────────────────────────────────────
  test.describe("7. City Validation (422)", () => {
    for (const { id, field, value, note } of cityValidationScenarios) {
      test(`${id}: 422 — City: ${note}`, async ({ request }) => {
        const res = await register(request, { [field]: value, email: randomEmail() }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── Name Validation ─────────────────────────────────────────────
  test.describe("8. Name Validation (422)", () => {
    for (const { id, field, value, note } of nameEnValidationScenarios) {
      test(`${id}: 422 — nameEn: ${note}`, async ({ request }) => {
        const res = await register(request, { [field]: value, email: randomEmail() }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }

    test("VAL-NAME-GE-001: 422 — nameGe is empty string", async ({ request }) => {
      const res = await register(request, { nameGe: "", email: randomEmail() }, true);
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "nameGe" }));
    });

    test("VAL-NAME-GE-002: 422 — nameGe too long (>100 chars)", async ({ request }) => {
      const res = await register(request, { nameGe: "ა".repeat(101), email: randomEmail() }, true);
      expect(res.status()).toBe(422);
    });

    test("VAL-NAME-GE-003: 422 — nameGe is null", async ({ request }) => {
      const res = await register(request, { nameGe: null as any, email: randomEmail() }, true);
      expect(res.status()).toBe(422);
    });
  });

  // ─── Address Validation ──────────────────────────────────────────
  test.describe("9. Address Validation (422)", () => {
    for (const { id, field, value, note } of addressValidationScenarios) {
      test(`${id}: 422 — address: ${note}`, async ({ request }) => {
        const res = await register(request, { [field]: value, email: randomEmail() }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // ─── idNumber Validation ─────────────────────────────────────────
  test.describe("10. idNumber Validation (422)", () => {
    const idNumberScenarios = [
      { id: "VAL-ID-001", value: "", note: "empty string" },
      { id: "VAL-ID-002", value: "1234567890", note: "too short (10 digits)" },
      { id: "VAL-ID-003", value: "123456789012", note: "too long (12 digits)" },
      { id: "VAL-ID-004", value: null as any, note: "null" },
      { id: "VAL-ID-005", value: "1234567890a", note: "contains letter" },
      { id: "VAL-ID-006", value: "           ", note: "whitespace only" },
    ];

    for (const { id, value, note } of idNumberScenarios) {
      test(`${id}: 422 — idNumber ${note}`, async ({ request }) => {
        const res = await register(request, { idNumber: value, email: randomEmail() }, true);
        expect(res.status(), `${id}: ${note}`).toBe(422);
        const body = await res.json().catch(() => ({}));
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "idNumber" }));
      });
    }
  });

  // ─── Date of Birth Validation ────────────────────────────────────
  test.describe("11. Date of Birth Validation (422)", () => {
    test("VAL-DOB-001: 422 — dateOfBirth is null", async ({ request }) => {
      const res = await register(request, { dateOfBirth: null as any, email: randomEmail() }, true);
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.errors).toContainEqual(expect.objectContaining({ field: "dateOfBirth" }));
    });

    test("VAL-DOB-002: 422 — dateOfBirth in the future", async ({ request }) => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const res = await register(
        request,
        { dateOfBirth: future.toISOString().split("T")[0], email: randomEmail() },
        true,
      );
      expect(res.status()).toBe(422);
    });

    test("VAL-DOB-003: 422 — user is under 16 years old", async ({ request }) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 15);
      const res = await register(
        request,
        { dateOfBirth: d.toISOString().split("T")[0], email: randomEmail() },
        true,
      );
      expect(res.status()).toBe(422);
    });

    test("VAL-DOB-004: 201 — user exactly 16 years old is accepted", async ({
      request,
      createdUsers,
    }) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 16);
      const { res } = await registerAndTrack(
        request,
        createdUsers,
        { dateOfBirth: d.toISOString().split("T")[0] },
        true,
      );
      expect(res.status()).toBe(201);
    });

    test("VAL-DOB-005: 422 — invalid date format (not ISO)", async ({ request }) => {
      const res = await register(
        request,
        { dateOfBirth: "01-01-1990", email: randomEmail() },
        true,
      );
      expect(res.status()).toBe(422);
    });
  });

  // ─── Boundary Values ─────────────────────────────────────────────
  test.describe("12. Boundary Values", () => {
    test("BND-001: 201 — address exactly 200 chars accepted", async ({
      request,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(
        request,
        createdUsers,
        { address: "A".repeat(200) },
        true,
      );
      expect(res.status()).toBe(201);
    });

    test("BND-002: 422 — address 201 chars rejected", async ({ request }) => {
      const res = await register(
        request,
        { address: "A".repeat(201), email: randomEmail() },
        true,
      );
      expect(res.status()).toBe(422);
    });
  });

  // ─── Bad Request / Protocol ──────────────────────────────────────
  test.describe("13. Bad Request / Protocol (400)", () => {
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
