import { test, expect } from "../../helpers/userHelpers/fixtures.js";
import {
  ENDPOINTS,
  DEFAULT_USER,
  REAL_EMAILS,
} from "../../helpers/userHelpers/constants.js";
import { randomId, randomEmail } from "../../helpers/userHelpers/generators.js";
import {
  emailValidationScenarios,
  phoneValidationScenarios,
  cityValidationScenarios,
  nameEnValidationScenarios,
  passwordValidationScenarios,
  addressValidationScenarios,
} from "../../helpers/shared/sharedTestHelpers.js";

/**
 * ============================================================
 *  User Registration API — Refactored Edition
 *  All original tests preserved (REG-001 → SHP-003)
 * ============================================================
 */

test.describe("User Registration API", () => {
  // ─── Fixture Helpers ─────────────────────────────────────────

  const register = (api: any, overrides: Record<string, any> = {}) =>
    api.post(ENDPOINTS.REGISTER, { data: { ...DEFAULT_USER, ...overrides } });

  const registerAndTrack = async (
    api: any,
    createdUsers: any[],
    overrides: Record<string, any> = {},
  ) => {
    const email = overrides.email ?? randomEmail();
    const idNumber = overrides.idNumber ?? randomId();
    const res = await register(api, { ...overrides, email, idNumber });

    if (res.status() === 201 || res.status() === 200) {
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
    }
    return { res, email, idNumber };
  };

  // 1. Happy Path & Localization (using real emails)
  test.describe("1. Happy Path & Localization", () => {
    test("REG-001: 201 — new user with real email", async ({
      api,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[0]; // xoshtagio@gmail.com
      const idNumber = randomId();
      const { res } = await registerAndTrack(api, createdUsers, {
        email,
        idNumber,
      });
      expect(res.status()).toBe(201);
    });

    test("REG-002: 201 — response body contains a message string", async ({
      api,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[1];
      const idNumber = randomId();
      const { res } = await registerAndTrack(api, createdUsers, {
        email,
        idNumber,
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("REG-003: 201 — lang=ge returns Georgian Unicode message", async ({
      api,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[2];
      const idNumber = randomId();
      const res = await api.post(`${ENDPOINTS.REGISTER}?lang=ge`, {
        data: { ...DEFAULT_USER, email, idNumber },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(
        body.message,
        "Expected Georgian characters in lang=ge response",
      ).toMatch(/[\u10D0-\u10FF]/);
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
    });

    test("REG-004: 201 — real Mail.tm disposable address accepted", async ({
      api,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(api, createdUsers);
      expect(res.status()).toBe(201);
    });
  });

  // 2. Resend / Unverified Flow
  test.describe("2. Resend / Unverified Flow", () => {
    test("RSN-001: 200 — re-registering an unverified address resends email", async ({
      api,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[3];
      const idNumber = randomId();
      const payload = { ...DEFAULT_USER, email, idNumber };

      await api.post(ENDPOINTS.REGISTER, { data: payload });
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });

      const r2 = await api.post(ENDPOINTS.REGISTER, { data: payload });
      expect(r2.status()).toBe(200);

      const body = await r2.json();
      expect(typeof body.message).toBe("string");
    });

    test("RSN-002: 200 — resend response message is non-empty string", async ({
      api,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[4];
      const idNumber = randomId();
      const payload = { ...DEFAULT_USER, email, idNumber };

      await api.post(ENDPOINTS.REGISTER, { data: payload });
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });

      const r2 = await api.post(ENDPOINTS.REGISTER, { data: payload });
      const body = await r2.json();

      expect(body.message.trim().length).toBeGreaterThan(0);
    });
  });

  // 3. Conflict Handling (409)
  test.describe("3. Conflict Handling (409)", () => {
    test("DUP-001: 409 — duplicate idNumber with different email", async ({
      api,
      createdUsers,
    }) => {
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
    }) => {
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

  // 4. Field Validation (422)
  test.describe("4. Field Validation (422)", () => {
    const userSpecificScenarios = [
      { id: "VAL-001", field: "idNumber", value: "", note: "empty string" },
      { id: "VAL-002", field: "idNumber", value: "1234567890", note: "short" },
      { id: "VAL-003", field: "idNumber", value: "123456789012", note: "long" },
      { id: "VAL-005", field: "idNumber", value: null, note: "null" },
      { id: "VAL-015", field: "dateOfBirth", value: null, note: "null" },
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
      }) => {
        const res = await register(api, { [field]: value });
        const body = await res.json().catch(() => ({}));
        expect(res.status(), `${id}: ${note}`).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
        expect(body.errors).toContainEqual(expect.objectContaining({ field }));
      });
    }
  });

  // 5. Password Complexity
  test.describe("5. Password Complexity (422)", () => {
    for (const { id, field, value, note } of passwordValidationScenarios) {
      test(`${id}: password '${note}' → 422`, async ({ api }) => {
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

  // 6. Boundary Values
  test.describe("6. Boundary Values", () => {
    test("BND-001: 201 — address exactly 200 chars", async ({
      api,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(api, createdUsers, {
        address: "A".repeat(200),
      });
      expect(res.status()).toBe(201);
    });

    test("BND-005: 201 — age exactly 16 years", async ({
      api,
      createdUsers,
    }) => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 16);
      const dob = d.toISOString().split("T")[0];
      const { res } = await registerAndTrack(api, createdUsers, {
        dateOfBirth: dob,
      });
      expect(res.status()).toBe(201);
    });
  });

  // 7. Bad Request / Protocol (400)
  test.describe("7. Bad Request / Protocol (400)", () => {
    test("ERR-001: 400 — empty object body {}", async ({ api }) => {
      const res = await api.post(ENDPOINTS.REGISTER, { data: {} });
      expect(res.status()).toBe(400);
    });

    test("ERR-003: 400 — malformed JSON", async ({ api }) => {
      const res = await api.post(ENDPOINTS.REGISTER, {
        headers: { "Content-Type": "application/json" },
        data: '{ "email": "broken" ',
      });
      expect(res.status()).toBe(400);
    });
  });

  // 8. Security & Injection
  test.describe("8. Security & Injection", () => {
    test("SEC-001: 422 — SQL injection in email", async ({ api }) => {
      for (const payload of ["' OR '1'='1", "'; DROP TABLE users; --"]) {
        const res = await register(api, { email: payload });
        expect(res.status()).toBe(422);
      }
    });

    test("SEC-006: password never echoed in success response", async ({
      api,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(api, createdUsers);
      const text = await res.text();
      expect(text).not.toContain(DEFAULT_USER.password);
    });
  });

  // 9. Rate Limiting
  test.describe("9. Rate Limiting", () => {
    test("RTE-001: 429 triggered after rapid burst", async ({ api }) => {
      const BURST = 100; // test limit of 100
      const results = await Promise.all(
        Array.from({ length: BURST }, () =>
          api.post(ENDPOINTS.REGISTER, {
            data: {
              ...DEFAULT_USER,
              email: randomEmail(),
              password: "", // ❌ Missing/Empty password = Invalid (counts as 422, not skipped)
              idNumber: randomId(),
            },
          }),
        ),
      );
      const statuses = results.map((r) => r.status());
      const has429 = statuses.some((s) => s === 429);
      expect(has429, "Expected at least one 429 status during burst").toBe(
        true,
      );
    });
  });

  // 10. Response Shape Contract
  test.describe("10. Response Shape Contract", () => {
    test("SHP-001: 201 response has correct Content-Type", async ({
      api,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(api, createdUsers);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("SHP-002: 422 response includes errors array", async ({ api }) => {
      const res = await register(api, { email: "bad" });
      const body = await res.json();
      expect(res.status()).toBe(422);
      expect(Array.isArray(body.errors)).toBe(true);
    });

    test("SHP-003: 409 response body has message property", async ({
      api,
      createdUsers,
    }) => {
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
      expect(r2.status()).toBe(409);
      expect(typeof body.message).toBe("string");
    });
  });
});
