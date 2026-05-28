import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { FAKE_ID } from "../logs.helpers.js";

export const logsSecuritySuites = () => {
  test.describe("3. Request Logs — Security & Access Control", () => {
    test.describe("Authentication required", () => {
      test("LOG-SEC-001: 401 — list logs without token", async ({
        request,
      }) => {
        const res = await request.get(ENDPOINTS.ADMIN_LOGS);
        expect(res.status()).toBe(401);
      });

      test("LOG-SEC-002: 401 — get log by id without token", async ({
        request,
      }) => {
        const res = await request.get(`${ENDPOINTS.ADMIN_LOGS}/${FAKE_ID}`);
        expect(res.status()).toBe(401);
      });

      test("LOG-SEC-003: 401 — delete log without token", async ({
        request,
      }) => {
        const res = await request.delete(`${ENDPOINTS.ADMIN_LOGS}/${FAKE_ID}`);
        expect(res.status()).toBe(401);
      });

      test("LOG-SEC-004: 401 — clear all logs without token", async ({
        request,
      }) => {
        const res = await request.delete(ENDPOINTS.ADMIN_LOGS);
        expect(res.status()).toBe(401);
      });

      test("LOG-SEC-005: 401 — malformed bearer token", async ({
        request,
      }) => {
        const res = await request.get(ENDPOINTS.ADMIN_LOGS, {
          headers: { Authorization: "Bearer not.a.jwt" },
        });
        expect(res.status()).toBe(401);
      });
    });

    test.describe("Permission required", () => {
      test("LOG-SEC-010: 403 — partner cannot view logs (no logs.view)", async ({
        partnerApi,
      }) => {
        const res = await partnerApi.get(ENDPOINTS.ADMIN_LOGS);
        expect(res.status()).toBe(403);
      });

      test("LOG-SEC-011: 403 — partner cannot delete a log (no logs.delete)", async ({
        partnerApi,
      }) => {
        const res = await partnerApi.delete(
          `${ENDPOINTS.ADMIN_LOGS}/${FAKE_ID}`,
        );
        expect(res.status()).toBe(403);
      });

      test("LOG-SEC-012: 403 — partner cannot clear all logs", async ({
        partnerApi,
      }) => {
        const res = await partnerApi.delete(ENDPOINTS.ADMIN_LOGS);
        expect(res.status()).toBe(403);
      });
    });
  });
};
