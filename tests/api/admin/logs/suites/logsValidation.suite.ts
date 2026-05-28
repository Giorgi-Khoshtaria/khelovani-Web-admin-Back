import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { FAKE_ID } from "../logs.helpers.js";

export const logsValidationSuites = () => {
  test.describe("2. Request Logs — Validation & Not Found", () => {
    const malformedIds = [
      ["too short", "123"],
      ["non-hex characters", "zzzzzzzzzzzzzzzzzzzzzzzz"],
      ["contains a space", "64b2f0000000000000000 00"],
    ] as const;

    for (const [note, badId] of malformedIds) {
      test(`LOG-VAL-00X: 422 — get log by id (${note})`, async ({
        adminApi,
      }) => {
        const res = await adminApi.get(
          `${ENDPOINTS.ADMIN_LOGS}/${encodeURIComponent(badId)}`,
        );
        expect(res.status()).toBe(422);
      });

      test(`LOG-VAL-01X: 422 — delete log by id (${note})`, async ({
        adminApi,
      }) => {
        const res = await adminApi.delete(
          `${ENDPOINTS.ADMIN_LOGS}/${encodeURIComponent(badId)}`,
        );
        expect(res.status()).toBe(422);
      });
    }

    test("LOG-VAL-020: 404 — get a non-existent (well-formed) log id", async ({
      adminApi,
    }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_LOGS}/${FAKE_ID}`);
      expect(res.status()).toBe(404);
    });

    test("LOG-VAL-021: 404 — delete a non-existent (well-formed) log id", async ({
      adminApi,
    }) => {
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_LOGS}/${FAKE_ID}`);
      expect(res.status()).toBe(404);
    });
  });
};
