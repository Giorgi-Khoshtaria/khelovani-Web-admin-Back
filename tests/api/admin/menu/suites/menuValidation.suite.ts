import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import {
  createMenuItem,
  deleteMenuItem,
  VALID_MENU_ITEM,
} from "../menu.helpers.js";
import {
  menuLabelKaScenarios,
  menuLabelEnScenarios,
  menuHrefScenarios,
  menuOrderScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";

export const menuValidationSuites = () => {
  test.describe("6. Menu Field Validation (create & update)", () => {
    // ── POST: label.ka ────────────────────────────────────────────────
    test.describe("POST — label.ka", () => {
      for (const { id, value, note } of menuLabelKaScenarios) {
        test(`${id}: 422 — label.ka: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
            data: {
              ...VALID_MENU_ITEM,
              label: { ...VALID_MENU_ITEM.label, ka: value },
            },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
        });
      }

      test("MNU-VAL-017: 422 — label.ka missing from label object", async ({
        adminApi,
      }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: { ...VALID_MENU_ITEM, label: { en: VALID_MENU_ITEM.label.en } },
        });
        expect(res.status()).toBe(422);
      });

      test("MNU-VAL-018: 201 — label.ka at min boundary (2 chars)", async ({
        adminApi,
      }) => {
        const { id } = await createMenuItem(adminApi, {
          label: { ...VALID_MENU_ITEM.label, ka: "მთ" },
        });
        await deleteMenuItem(adminApi, id);
      });

      test("MNU-VAL-019: 201 — label.ka at max boundary (20 chars)", async ({
        adminApi,
      }) => {
        const { id } = await createMenuItem(adminApi, {
          label: {
            ...VALID_MENU_ITEM.label,
            ka: "ა".repeat(LIMITS.menu.labelKa.max),
          },
        });
        await deleteMenuItem(adminApi, id);
      });
    });

    // ── POST: label.en ────────────────────────────────────────────────
    test.describe("POST — label.en", () => {
      for (const { id, value, note } of menuLabelEnScenarios) {
        test(`${id}: 422 — label.en: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
            data: {
              ...VALID_MENU_ITEM,
              label: { ...VALID_MENU_ITEM.label, en: value },
            },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
          const body = await res.json();
          expect(Array.isArray(body.errors)).toBe(true);
        });
      }

      test("MNU-VAL-020: 422 — label.en missing from label object", async ({
        adminApi,
      }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: { ...VALID_MENU_ITEM, label: { ka: VALID_MENU_ITEM.label.ka } },
        });
        expect(res.status()).toBe(422);
      });

      test("MNU-VAL-021: 201 — label.en at min boundary (2 chars)", async ({
        adminApi,
      }) => {
        const { id } = await createMenuItem(adminApi, {
          label: { ...VALID_MENU_ITEM.label, en: "Hi" },
        });
        await deleteMenuItem(adminApi, id);
      });

      test("MNU-VAL-022: 201 — label.en at max boundary (20 chars)", async ({
        adminApi,
      }) => {
        const { id } = await createMenuItem(adminApi, {
          label: {
            ...VALID_MENU_ITEM.label,
            en: "A".repeat(LIMITS.menu.labelEn.max),
          },
        });
        await deleteMenuItem(adminApi, id);
      });
    });

    // ── POST: href ────────────────────────────────────────────────────
    test.describe("POST — href", () => {
      for (const { id, value, note } of menuHrefScenarios) {
        test(`${id}: 422 — href: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
            data: { ...VALID_MENU_ITEM, href: value },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
        });
      }

      test("MNU-VAL-023: 422 — href missing", async ({ adminApi }) => {
        const { href, ...noHref } = VALID_MENU_ITEM;
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: noHref });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field === "href")).toBe(true);
      });

      test("MNU-VAL-024: 201 — href at max boundary", async ({ adminApi }) => {
        const { id } = await createMenuItem(adminApi, {
          href: "/" + "a".repeat(LIMITS.menu.href.max - 1),
        });
        await deleteMenuItem(adminApi, id);
      });
    });

    // ── POST: order ───────────────────────────────────────────────────
    test.describe("POST — order", () => {
      for (const { id, value, note } of menuOrderScenarios) {
        test(`${id}: 422 — order: ${note}`, async ({ adminApi }) => {
          const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
            data: { ...VALID_MENU_ITEM, order: value },
          });
          expect(res.status(), `${id}: ${note}`).toBe(422);
        });
      }

      test("MNU-VAL-025: 422 — order missing", async ({ adminApi }) => {
        const { order, ...noOrder } = VALID_MENU_ITEM;
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: noOrder,
        });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field === "order")).toBe(true);
      });

      test("MNU-VAL-026: 201 — order 0 accepted (min boundary)", async ({
        adminApi,
      }) => {
        const { id } = await createMenuItem(adminApi, { order: 0 });
        await deleteMenuItem(adminApi, id);
      });
    });

    // ── POST: isActive ────────────────────────────────────────────────
    test.describe("POST — isActive", () => {
      test("MNU-VAL-027: 422 — isActive is string 'true'", async ({
        adminApi,
      }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: { ...VALID_MENU_ITEM, isActive: "true" },
        });
        expect(res.status()).toBe(422);
      });

      test("MNU-VAL-028: 422 — isActive is number 1", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: { ...VALID_MENU_ITEM, isActive: 1 },
        });
        expect(res.status()).toBe(422);
      });
    });

    // ── POST: strict mode ─────────────────────────────────────────────
    test.describe("POST — strict mode", () => {
      test("MNU-VAL-029: 422 — unknown field rejected", async ({
        adminApi,
      }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: { ...VALID_MENU_ITEM, unknownField: "value" },
        });
        expect(res.status()).toBe(422);
      });

      test("MNU-VAL-030: 422 — empty body {}", async ({ adminApi }) => {
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, { data: {} });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(Array.isArray(body.errors)).toBe(true);
      });

      test("MNU-VAL-031: 422 — entire label object missing", async ({
        adminApi,
      }) => {
        const { label, ...noLabel } = VALID_MENU_ITEM;
        const res = await adminApi.post(ENDPOINTS.ADMIN_MENU, {
          data: noLabel,
        });
        expect(res.status()).toBe(422);
        const body = await res.json();
        expect(body.errors.some((e: any) => e.field === "label")).toBe(true);
      });
    });

    // ── PUT: field validation (updateMenuSchema is partial) ───────────
    test.describe("PUT — field validation on update", () => {
      for (const { id, value, note } of menuLabelKaScenarios) {
        test(`UPD-${id}: 422 — PUT label.ka: ${note}`, async ({ adminApi }) => {
          const { id: itemId } = await createMenuItem(adminApi);
          try {
            const res = await adminApi.put(
              `${ENDPOINTS.ADMIN_MENU}/${itemId}`,
              {
                data: { label: { ...VALID_MENU_ITEM.label, ka: value } },
              },
            );
            expect(res.status(), `UPD-${id}: ${note}`).toBe(422);
          } finally {
            await deleteMenuItem(adminApi, itemId);
          }
        });
      }

      for (const { id, value, note } of menuLabelEnScenarios) {
        test(`UPD-${id}: 422 — PUT label.en: ${note}`, async ({ adminApi }) => {
          const { id: itemId } = await createMenuItem(adminApi);
          try {
            const res = await adminApi.put(
              `${ENDPOINTS.ADMIN_MENU}/${itemId}`,
              {
                data: { label: { ...VALID_MENU_ITEM.label, en: value } },
              },
            );
            expect(res.status(), `UPD-${id}: ${note}`).toBe(422);
          } finally {
            await deleteMenuItem(adminApi, itemId);
          }
        });
      }

      for (const { id, value, note } of menuHrefScenarios) {
        test(`UPD-${id}: 422 — PUT href: ${note}`, async ({ adminApi }) => {
          const { id: itemId } = await createMenuItem(adminApi);
          try {
            const res = await adminApi.put(
              `${ENDPOINTS.ADMIN_MENU}/${itemId}`,
              {
                data: { href: value },
              },
            );
            expect(res.status(), `UPD-${id}: ${note}`).toBe(422);
          } finally {
            await deleteMenuItem(adminApi, itemId);
          }
        });
      }

      for (const { id, value, note } of menuOrderScenarios) {
        test(`UPD-${id}: 422 — PUT order: ${note}`, async ({ adminApi }) => {
          const { id: itemId } = await createMenuItem(adminApi);
          try {
            const res = await adminApi.put(
              `${ENDPOINTS.ADMIN_MENU}/${itemId}`,
              {
                data: { order: value },
              },
            );
            expect(res.status(), `UPD-${id}: ${note}`).toBe(422);
          } finally {
            await deleteMenuItem(adminApi, itemId);
          }
        });
      }

      test("MNU-VAL-040: 422 — PUT with unknown field rejected", async ({
        adminApi,
      }) => {
        const { id: itemId } = await createMenuItem(adminApi);
        try {
          const res = await adminApi.put(`${ENDPOINTS.ADMIN_MENU}/${itemId}`, {
            data: { unknownField: "value" },
          });
          expect(res.status()).toBe(422);
        } finally {
          await deleteMenuItem(adminApi, itemId);
        }
      });
    });
  });
};
