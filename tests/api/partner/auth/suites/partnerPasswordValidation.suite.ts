import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  emailValidationScenarios,
  passwordValidationScenarios,
} from "../../../../helpers/shared/validation.helper.js";
import { signResetToken, createPartner } from "../partnerPassword.helpers.js";

export const partnerPasswordValidationSuites = () => {
  test.describe("2. Partner Password — Field Validation", () => {
    test.describe("Forgot password — email", () => {
      for (const { id, value, note } of emailValidationScenarios) {
        test(`PP-VAL-${id}: 422 — email: ${note}`, async ({ request }) => {
          const res = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
            data: { email: value },
          });
          expect(res.status(), note).toBe(422);
        });
      }

      test("PP-VAL-001: 422 — missing email", async ({ request }) => {
        const res = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: {},
        });
        expect(res.status()).toBe(422);
      });

      test("PP-VAL-002: 422 — unknown extra field rejected (strict)", async ({
        request,
      }) => {
        const res = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: { email: "valid@test.com", role: "admin" },
        });
        expect(res.status()).toBe(422);
      });
    });

    test.describe("Reset password — password", () => {
      for (const { id, value, note } of passwordValidationScenarios) {
        test(`PP-VAL-${id}: 422 — password: ${note}`, async ({ request }) => {
          const partner = await createPartner();
          const token = signResetToken(partner.email);
          const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
            data: { token, password: value },
          });
          expect(res.status(), note).toBe(422);
          await DbHelper.deletePartnerByEmail(partner.email);
        });
      }
    });

    test.describe("Reset password — token", () => {
      test("PP-VAL-010: 422 — missing token", async ({ request }) => {
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { password: "ValidPass123!" },
        });
        expect(res.status()).toBe(422);
      });

      test("PP-VAL-011: 422 — empty token", async ({ request }) => {
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token: "", password: "ValidPass123!" },
        });
        expect(res.status()).toBe(422);
      });

      test("PP-VAL-012: 422 — token over max length (513 chars)", async ({
        request,
      }) => {
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token: "a".repeat(513), password: "ValidPass123!" },
        });
        expect(res.status()).toBe(422);
      });

      test("PP-VAL-013: 422 — missing password", async ({ request }) => {
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token: "some-token" },
        });
        expect(res.status()).toBe(422);
      });

      test("PP-VAL-014: 422 — unknown extra field rejected (strict)", async ({
        request,
      }) => {
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: {
            token: "some-token",
            password: "ValidPass123!",
            email: "x@test.com",
          },
        });
        expect(res.status()).toBe(422);
      });
    });
  });
};
