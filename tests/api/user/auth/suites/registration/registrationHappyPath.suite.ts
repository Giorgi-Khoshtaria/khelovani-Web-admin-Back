import {
  test,
  expect,
  UserFixtures,
} from "../../../../../fixtures/auth.fixture.js";
import {
  ENDPOINTS,
  REAL_EMAILS,
  DEFAULT_USER,
} from "../../../../../constants/endpoints.js";
import { randomId } from "../../../../../helpers/utils/generators.js";
import { registerAndTrack } from "../../registration.helpers.js";

export const registrationHappyPathSuites = () => {
  test.describe("1. Happy Path & Localization", () => {
    test("REG-001: 201 — new user with real email", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
      const email = REAL_EMAILS[0];
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
    }: UserFixtures) => {
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
    }: UserFixtures) => {
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
    }: UserFixtures) => {
      const { res } = await registerAndTrack(api, createdUsers);
      expect(res.status()).toBe(201);
    });
  });

  test.describe("2. Resend / Unverified Flow", () => {
    test("RSN-001: 200 — re-registering an unverified address resends email", async ({
      api,
      createdUsers,
    }: UserFixtures) => {
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
    }: UserFixtures) => {
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
};
