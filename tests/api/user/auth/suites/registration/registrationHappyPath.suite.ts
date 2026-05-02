import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";
import { ENDPOINTS, REAL_EMAILS, DEFAULT_USER } from "../../../../../constants/endpoints.js";
import { randomId, randomEmail } from "../../../../../helpers/utils/generators.js";
import { register, registerAndTrack } from "../../registration.helpers.js";
import { DbHelper } from "../../../../../helpers/db/db.helper.js";

export const registrationHappyPathSuites = () => {
  test.describe("1. Happy Path & Localization", () => {
    test("REG-001: 201 — real email registers successfully", async ({ request, createdUsers }) => {
      const email = REAL_EMAILS[0];
      // Delete any previous run so we always start clean
      await DbHelper.deleteEndUserByEmail(email);
      const idNumber = randomId();
      const { res } = await registerAndTrack(request, createdUsers, { email, idNumber });
      expect(res.status()).toBe(201);
    });

    test("REG-002: 201 — response body contract with real email", async ({
      request,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[1];
      await DbHelper.deleteEndUserByEmail(email);
      const idNumber = randomId();
      const { res } = await registerAndTrack(request, createdUsers, { email, idNumber });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(typeof body.message).toBe("string");
      expect(body.message.length).toBeGreaterThan(0);
    });

    test("REG-003: 201 — lang=ge returns Georgian Unicode message", async ({
      request,
      createdUsers,
    }) => {
      const email = randomEmail();
      const idNumber = randomId();
      const res = await request.post(`${ENDPOINTS.REGISTER}?lang=ge`, {
        data: { ...DEFAULT_USER, email, idNumber },
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.message, "Expected Georgian characters in lang=ge response").toMatch(/[ა-ჿ]/);
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
    });

    test("REG-004: 201 — lang=en returns English message", async ({
      request,
      createdUsers,
    }) => {
      const email = randomEmail();
      const idNumber = randomId();
      const res = await request.post(`${ENDPOINTS.REGISTER}?lang=en`, {
        data: { ...DEFAULT_USER, email, idNumber },
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      const body = await res.json();
      expect(res.status()).toBe(201);
      expect(body.message).toMatch(/[a-zA-Z]/);
      if (res.status() === 201) {
        createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });
      }
    });

    test("REG-005: 201 — Content-Type is application/json", async ({
      request,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      expect(res.status()).toBe(201);
      expect(res.headers()["content-type"]).toContain("application/json");
    });

    test("REG-006: 201 — password never echoed in response body", async ({
      request,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      const text = await res.text();
      expect(text).not.toContain(DEFAULT_USER.password);
    });

    test("REG-007: 201 — response does not expose idNumber or sensitive fields", async ({
      request,
      createdUsers,
    }) => {
      const idNumber = randomId();
      const { res } = await registerAndTrack(request, createdUsers, { idNumber }, true);
      const body = await res.json();
      expect(body.data).toBeUndefined();
      expect(body).not.toHaveProperty("idNumber");
      expect(body).not.toHaveProperty("password");
    });

    test("REG-008: 201 — random disposable address accepted", async ({
      request,
      createdUsers,
    }) => {
      const { res } = await registerAndTrack(request, createdUsers, {}, true);
      expect(res.status()).toBe(201);
    });
  });

  test.describe("2. Resend / Unverified Flow", () => {
    test("RSN-001: 200 — re-registering a real unverified address resends verification", async ({
      request,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[2];
      await DbHelper.deleteEndUserByEmail(email);
      const idNumber = randomId();
      const payload = { ...DEFAULT_USER, email, idNumber };

      await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });

      const r2 = await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      expect(r2.status()).toBe(200);
      const body = await r2.json();
      expect(typeof body.message).toBe("string");
      expect(body.message.trim().length).toBeGreaterThan(0);
    });

    test("RSN-002: 200 — resend response has success: true (real email)", async ({
      request,
      createdUsers,
    }) => {
      const email = REAL_EMAILS[3];
      await DbHelper.deleteEndUserByEmail(email);
      const idNumber = randomId();
      const payload = { ...DEFAULT_USER, email, idNumber };

      await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });

      const r2 = await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      const body = await r2.json();
      expect(body.success).toBe(true);
    });

    test("RSN-003: 200 — same idNumber second unverified registration returns 200 not 409", async ({
      request,
      createdUsers,
    }) => {
      const email = randomEmail();
      const idNumber = randomId();
      const payload = { ...DEFAULT_USER, email, idNumber };

      await register(request, { email, idNumber }, true);
      createdUsers.push({ email, idNumber, password: DEFAULT_USER.password });

      const r2 = await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      expect(r2.status()).toBe(200);
    });
  });
};
