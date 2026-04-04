import {
  test,
  expect,
  UserFixtures,
} from "../../../../../fixtures/auth.fixture.js";
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
    test("DUP-001: 409 — duplicate idNumber with different email", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
      const sharedId = randomId();
      const email1 = randomEmail();

      await register(api, { email: email1, idNumber: sharedId });
      createdUsers.push({
        email: email1,
        idNumber: sharedId,
        password: DEFAULT_USER.password,
      });

      const r2 = await register(api, {
        email: randomEmail(),
        idNumber: sharedId,
      });
      expect(r2.status()).toBe(409);
      const body = await r2.json();
      expect(body).toHaveProperty("message");
    });

    test("DUP-002: 409 response body must include a message", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
      const sharedId = randomId();
      const email1 = randomEmail();

      await register(api, { email: email1, idNumber: sharedId });
      createdUsers.push({
        email: email1,
        idNumber: sharedId,
        password: DEFAULT_USER.password,
      });

      const r2 = await register(api, {
        email: randomEmail(),
        idNumber: sharedId,
      });
      const body = await r2.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });
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
      test(`${id}: expected 422 for field '${field}' (${note})`, async ({
        api,
      }: UserFixtures) => {
        const res = await register(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  test.describe("5. Password Complexity (422)", () => {
    for (const { id, field, value, note } of passwordValidationScenarios) {
      test(`${id}: password '${note}' → 422`, async ({ api }: UserFixtures) => {
        const res = await register(api, {
          password: value,
          email: randomEmail(),
        });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(body.errors).toContainEqual(
          expect.objectContaining({ field: "password" }),
        );
      });
    }
  });

  test.describe("6. Boundary Values", () => {
    test("BND-001: 201 — address exactly 200 chars", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
      const { res } = await registerAndTrack(api, createdUsers, {
        address: "A".repeat(200),
      });
      expect(res.status()).toBe(201);
    });

    test("BND-005: 201 — age exactly 16 years", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 16);
      const dob = d.toISOString().split("T")[0];
      const { res } = await registerAndTrack(api, createdUsers, {
        dateOfBirth: dob,
      });
      expect(res.status()).toBe(201);
    });
  });

  test.describe("7. Bad Request / Protocol (400)", () => {
    test("ERR-001: 400 — empty object body {}", async ({
      api,
    }: UserFixtures) => {
      const res = await register(api, { data: {} });
      expect(res.status()).toBe(400);
    });

    test("ERR-003: 400 — malformed JSON", async ({ api }: UserFixtures) => {
      const res = await api.post("/api/user/auth/register", {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ',
      });
      expect(res.status()).toBe(400);
    });
  });
};
