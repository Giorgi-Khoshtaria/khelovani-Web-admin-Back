import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { DEFAULT_USER } from "../../../../../constants/endpoints.js";
import {
  randomId,
  randomEmail,
} from "../../../../../helpers/utils/generators.js";
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
  test.describe("3. Conflict Handling (409)", () => {
    test(
      "DUP-001: 409 — duplicate idNumber with different email",
      async ({ request, createdUsers }) => {
        const sharedId = randomId();
        const email1 = randomEmail();

        await register(request, { email: email1, idNumber: sharedId }, true);
        createdUsers.push({
          email: email1,
          idNumber: sharedId,
          password: DEFAULT_USER.password,
        });

        const r2 = await register(request, {
          email: randomEmail(),
          idNumber: sharedId,
        }, true);
        expect(r2.status()).toBe(409);
        const body = await r2.json();
        expect(body).toHaveProperty("message");
      },
    );

    test(
      "DUP-002: 409 response body must include a message",
      async ({ request, createdUsers }) => {
        const sharedId = randomId();
        const email1 = randomEmail();

        await register(request, { email: email1, idNumber: sharedId }, true);
        createdUsers.push({
          email: email1,
          idNumber: sharedId,
          password: DEFAULT_USER.password,
        });

        const r2 = await register(request, {
          email: randomEmail(),
          idNumber: sharedId,
        }, true);
        const body = await r2.json();
        expect(typeof body.message).toBe("string");
        expect(body.message.length).toBeGreaterThan(0);
      },
    );
  });

  test.describe("4. Field Validation (422)", () => {
    const userSpecificScenarios = [
      { id: "VAL-001", field: "idNumber", value: "", note: "empty string" },
      { id: "VAL-002", field: "idNumber", value: "1234567890", note: "short" },
      { id: "VAL-003", field: "idNumber", value: "123456789012", note: "long" },
      { id: "VAL-005", field: "idNumber", value: null as any, note: "null" },
      { id: "VAL-015", field: "dateOfBirth", value: null as any, note: "null" },
    ];

    const allScenarios = [
      ...userSpecificScenarios,
      ...nameEnValidationScenarios,
      ...cityValidationScenarios,
      ...addressValidationScenarios,
      ...emailValidationScenarios,
      ...phoneValidationScenarios,
    ];

    for (const { id, field, value, note } of allScenarios) {
      test(
        `${id}: expected 422 for field '${field}' (${note})`,
        async ({ request }) => {
          const res = await register(request, { [field]: value }, true);
          const body = await res.json().catch(() => ({}));
          expect(res.status(), `${id}: ${note}`).toBe(422);
          expect(Array.isArray(body.errors)).toBe(true);
          expect(body.errors).toContainEqual(
            expect.objectContaining({ field }),
          );
        },
      );
    }
  });

  test.describe("5. Password Complexity (422)", () => {
    for (const { id, field, value, note } of passwordValidationScenarios) {
      test(`${id}: password '${note}' → 422`, async ({ request }) => {
        const res = await register(request, {
          password: value,
          email: randomEmail(),
        }, true);
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(body.errors).toContainEqual(
          expect.objectContaining({ field: "password" }),
        );
      });
    }
  });

  test.describe("6. Boundary Values", () => {
    test(
      "BND-001: 201 — address exactly 200 chars",
      async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, {
          address: "A".repeat(200),
        }, true);
        expect(res.status()).toBe(201);
      },
    );

    test(
      "BND-005: 201 — age exactly 16 years",
      async ({ request, createdUsers }) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 16);
        const dob = d.toISOString().split("T")[0];
        const { res } = await registerAndTrack(request, createdUsers, {
          dateOfBirth: dob,
        }, true);
        expect(res.status()).toBe(201);
      },
    );
  });

  test.describe("7. Bad Request / Protocol (400)", () => {
    test("ERR-001: 400 — empty object body {}", async ({ request }) => {
      const res = await register(request, { data: {} });
      expect([400, 422]).toContain(res.status());
    });

    test("ERR-003: 400 — malformed JSON", async ({ request }) => {
      const res = await request.post("/api/user/auth/register", {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ',
      });
      expect(res.status()).toBe(400);
    });
  });
};
