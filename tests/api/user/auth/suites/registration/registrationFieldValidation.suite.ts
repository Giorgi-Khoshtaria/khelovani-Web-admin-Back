import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { randomEmail } from "../../../../../helpers/utils/generators.js";
import { register, registerAndTrack } from "../../registration.helpers.js";
import {
  nameGeValidationScenarios,
  nameEnValidationScenarios,
  dateOfBirthValidationScenarios,
  idNumberValidationScenarios,
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
  passwordValidationScenarios,
  addressValidationScenarios,
  LIMITS,
} from "../../../../../helpers/shared/validation.helper.js";

export const registrationFieldValidationSuites = () => {
  test.describe("14. Registration Field Validation (format & length)", () => {
    // ── nameEn ────────────────────────────────────────────────────────
    test.describe("nameEn field", () => {
      for (const { id, value, note } of nameEnValidationScenarios) {
        test(`${id}: 422 — nameEn: ${note}`, async ({ request }) => {
          const res = await register(request, { nameEn: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "nameEn" }));
        });
      }

      test("REG-VAL-001: 422 — nameEn is null", async ({ request }) => {
        const res = await register(request, { nameEn: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "nameEn" }));
      });

      test("REG-VAL-002: 422 — nameEn missing entirely", async ({ request }) => {
        const res = await register(request, { nameEn: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-003: 201 — nameEn at min boundary (2 chars)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, { nameEn: "Ab" }, true);
        expect(res.status()).toBe(201);
      });

      test("REG-VAL-004: 201 — nameEn at max boundary (100 chars)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { nameEn: "A".repeat(LIMITS.register.nameEn.max) },
          true,
        );
        expect(res.status()).toBe(201);
      });

      test("REG-VAL-005: 422 — nameEn with Georgian characters", async ({ request }) => {
        const res = await register(request, { nameEn: "გიორგი", email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "nameEn" }));
      });
    });

    // ── nameGe ────────────────────────────────────────────────────────
    test.describe("nameGe field", () => {
      for (const { id, value, note } of nameGeValidationScenarios) {
        test(`${id}: 422 — nameGe: ${note}`, async ({ request }) => {
          const res = await register(request, { nameGe: value as any, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "nameGe" }));
        });
      }

      test("REG-VAL-010: 201 — nameGe at min boundary (2 chars)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, { nameGe: "ქა" }, true);
        expect(res.status()).toBe(201);
      });

      test("REG-VAL-011: 201 — nameGe at max boundary (100 chars)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { nameGe: "ა".repeat(LIMITS.register.nameGe.max) },
          true,
        );
        expect(res.status()).toBe(201);
      });

      test("REG-VAL-012: 201 — nameGe omitted (optional field)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, {}, true);
        expect(res.status()).toBe(201);
      });
    });

    // ── email ─────────────────────────────────────────────────────────
    test.describe("email field", () => {
      for (const { id, value, note } of emailValidationScenarios) {
        test(`${id}: 422 — email: ${note}`, async ({ request }) => {
          const res = await register(request, { email: value }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
        });
      }

      test("REG-VAL-040: 422 — email too long (over max)", async ({ request }) => {
        const longEmail = "a".repeat(LIMITS.register.email.max - 8) + "@test.com";
        const res = await register(request, { email: longEmail }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-041: 422 — email is null", async ({ request }) => {
        const res = await register(request, { email: null }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "email" }));
      });

      test("REG-VAL-042: 422 — email missing entirely", async ({ request }) => {
        const res = await register(request, { email: undefined }, true);
        expect(res.status()).toBe(422);
      });
    });

    // ── phone ─────────────────────────────────────────────────────────
    test.describe("phone field", () => {
      for (const { id, value, note } of phoneValidationScenarios) {
        test(`${id}: 422 — phone: ${note}`, async ({ request }) => {
          const res = await register(request, { phone: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "phone" }));
        });
      }

      test("REG-VAL-050: 422 — phone is null", async ({ request }) => {
        const res = await register(request, { phone: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "phone" }));
      });

      test("REG-VAL-051: 422 — phone missing entirely", async ({ request }) => {
        const res = await register(request, { phone: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-052: 201 — phone with spaces (valid format)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { phone: "599 123 456" },
          true,
        );
        expect(res.status()).toBe(201);
      });
    });

    // ── city ──────────────────────────────────────────────────────────
    test.describe("city field", () => {
      for (const { id, value, note } of cityValidationScenarios) {
        test(`${id}: 422 — city: ${note}`, async ({ request }) => {
          const res = await register(request, { city: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "city" }));
        });
      }

      test("REG-VAL-060: 422 — city is null", async ({ request }) => {
        const res = await register(request, { city: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "city" }));
      });

      test("REG-VAL-061: 422 — city missing entirely", async ({ request }) => {
        const res = await register(request, { city: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-062: 201 — all valid city values accepted", async ({ request, createdUsers }) => {
        for (const city of ["tbilisi", "batumi", "kutaisi", "rustavi", "gori", "zugdidi"]) {
          const { res } = await registerAndTrack(request, createdUsers, { city }, true);
          expect(res.status(), `city '${city}' should be accepted`).toBe(201);
        }
      });
    });

    // ── address ───────────────────────────────────────────────────────
    test.describe("address field", () => {
      for (const { id, value, note } of addressValidationScenarios) {
        test(`${id}: 422 — address: ${note}`, async ({ request }) => {
          const res = await register(request, { address: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
        });
      }

      test("REG-VAL-070: 422 — address is null", async ({ request }) => {
        const res = await register(request, { address: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "address" }));
      });

      test("REG-VAL-071: 422 — address missing entirely", async ({ request }) => {
        const res = await register(request, { address: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-072: 201 — address at max boundary (200 chars)", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { address: "A".repeat(LIMITS.register.address.max) },
          true,
        );
        expect(res.status()).toBe(201);
      });
    });

    // ── password ──────────────────────────────────────────────────────
    test.describe("password field", () => {
      for (const { id, value, note } of passwordValidationScenarios) {
        test(`${id}: 422 — password: ${note}`, async ({ request }) => {
          const res = await register(request, { password: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
        });
      }

      test("REG-VAL-080: 422 — password is null", async ({ request }) => {
        const res = await register(request, { password: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "password" }));
      });

      test("REG-VAL-081: 422 — password missing entirely", async ({ request }) => {
        const res = await register(request, { password: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-082: 201 — password at min boundary (8 chars with complexity)", async ({
        request,
        createdUsers,
      }) => {
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { password: "Abcd12!!" },
          true,
        );
        expect(res.status()).toBe(201);
      });

      test("REG-VAL-083: 201 — password at max boundary (64 chars)", async ({ request, createdUsers }) => {
        const base = "Aa1!";
        const { res } = await registerAndTrack(
          request,
          createdUsers,
          { password: base.repeat(Math.floor(LIMITS.register.password.max / base.length)) },
          true,
        );
        expect(res.status()).toBe(201);
      });
    });

    // ── dateOfBirth ───────────────────────────────────────────────────
    test.describe("dateOfBirth field", () => {
      for (const { id, value, note } of dateOfBirthValidationScenarios) {
        test(`${id}: 422 — dateOfBirth: ${note}`, async ({ request }) => {
          const res = await register(request, { dateOfBirth: value, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "dateOfBirth" }));
        });
      }

      test("REG-VAL-020: 422 — user under 16 years old", async ({ request }) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 15);
        const res = await register(request, { dateOfBirth: d.toISOString().split("T")[0], email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-021: 422 — age over 120 years", async ({ request }) => {
        const res = await register(request, { dateOfBirth: "1900-01-01", email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-022: 422 — dateOfBirth is null", async ({ request }) => {
        const res = await register(request, { dateOfBirth: null, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors).toContainEqual(expect.objectContaining({ field: "dateOfBirth" }));
      });

      test("REG-VAL-023: 422 — dateOfBirth missing entirely", async ({ request }) => {
        const res = await register(request, { dateOfBirth: undefined, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-024: 201 — user exactly 16 years old accepted", async ({ request, createdUsers }) => {
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
    });

    // ── idNumber ──────────────────────────────────────────────────────
    test.describe("idNumber field", () => {
      for (const { id, value, note } of idNumberValidationScenarios) {
        test(`${id}: 422 — idNumber: ${note}`, async ({ request }) => {
          const res = await register(request, { idNumber: value as any, email: randomEmail() }, true);
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(expect.objectContaining({ field: "idNumber" }));
        });
      }

      test("REG-VAL-031: 422 — idNumber missing entirely", async ({ request }) => {
        const res = await register(request, { idNumber: undefined as any, email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-032: 201 — valid 11-digit idNumber accepted", async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, {}, true);
        expect(res.status()).toBe(201);
      });
    });

    // ── strict mode ───────────────────────────────────────────────────
    test.describe("strict mode", () => {
      test("REG-VAL-090: 422 — unknown field in body rejected", async ({ request }) => {
        const res = await register(request, { unknownField: "value", email: randomEmail() }, true);
        expect(res.status()).toBe(422);
      });

      test("REG-VAL-091: 422 — empty body {}", async ({ request }) => {
        const res = await register(request, { email: undefined }, true);
        expect(res.status()).toBe(422);
      });
    });
  });
};
