import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import { seedLog } from "../logs.helpers.js";

export const logsHappyPathSuites = () => {
  test.describe("1. Request Logs — Happy Path", () => {
    test("LOG-001: 200 — list returns data array and pagination meta", async ({
      adminApi,
    }) => {
      await seedLog();
      const res = await adminApi.get(ENDPOINTS.ADMIN_LOGS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toHaveProperty("totalCount");
      expect(body.meta).toHaveProperty("totalPages");
      expect(body.meta).toHaveProperty("currentPage");
    });

    test("LOG-002: 200 — respects page and limit query params", async ({
      adminApi,
    }) => {
      await seedLog();
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?page=1&limit=5`,
      );
      const body = await res.json();
      expect(body.meta.currentPage).toBe(1);
      expect(body.data.length).toBeLessThanOrEqual(5);
    });

    test("LOG-003: 200 — limit is capped at 100", async ({ adminApi }) => {
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_LOGS}?limit=10000`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeLessThanOrEqual(100);
    });

    test("LOG-004: 200 — filter status=error returns only >=400", async ({
      adminApi,
    }) => {
      const { url } = await seedLog({ statusCode: 500 });
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?status=error&search=${encodeURIComponent(url)}`,
      );
      const body = await res.json();
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data.every((l: any) => l.statusCode >= 400)).toBe(true);
    });

    test("LOG-005: 200 — filter status=ok returns only <400", async ({
      adminApi,
    }) => {
      const { url } = await seedLog({ statusCode: 200 });
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?status=ok&search=${encodeURIComponent(url)}`,
      );
      const body = await res.json();
      expect(body.data.every((l: any) => l.statusCode < 400)).toBe(true);
    });

    test("LOG-006: 200 — filter by source", async ({ adminApi }) => {
      const { url } = await seedLog({ source: "admin" });
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?source=admin&search=${encodeURIComponent(url)}`,
      );
      const body = await res.json();
      expect(body.data.every((l: any) => l.source === "admin")).toBe(true);
    });

    test("LOG-007: 200 — filter by HTTP method (case-insensitive)", async ({
      adminApi,
    }) => {
      const { url } = await seedLog({ method: "POST" });
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?method=post&search=${encodeURIComponent(url)}`,
      );
      const body = await res.json();
      expect(body.data.every((l: any) => l.method === "POST")).toBe(true);
    });

    test("LOG-008: 200 — search matches a unique URL", async ({
      adminApi,
    }) => {
      const { url } = await seedLog();
      const res = await adminApi.get(
        `${ENDPOINTS.ADMIN_LOGS}?search=${encodeURIComponent(url)}`,
      );
      const body = await res.json();
      expect(body.data.some((l: any) => l.url === url)).toBe(true);
    });

    test("LOG-010: 200 — get a single log by id", async ({ adminApi }) => {
      const { id, url } = await seedLog();
      const res = await adminApi.get(`${ENDPOINTS.ADMIN_LOGS}/${id}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data._id).toBe(id);
      expect(body.data.url).toBe(url);
    });

    test("LOG-020: 200 — delete a single log by id", async ({ adminApi }) => {
      const { id } = await seedLog();
      const res = await adminApi.delete(`${ENDPOINTS.ADMIN_LOGS}/${id}`);
      expect(res.status()).toBe(200);
      const after = await adminApi.get(`${ENDPOINTS.ADMIN_LOGS}/${id}`);
      expect(after.status()).toBe(404);
    });

    test("LOG-030: 200 — clear all logs", async ({ adminApi }) => {
      await seedLog();
      const res = await adminApi.delete(ENDPOINTS.ADMIN_LOGS);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.message).toMatch(/logs cleared/i);
    });
  });
};
