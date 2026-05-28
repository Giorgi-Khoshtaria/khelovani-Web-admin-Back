import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import { signResetToken, createPartner } from "../partnerPassword.helpers.js";

export const partnerPasswordHappyPathSuites = () => {
  test.describe("1. Partner Password — Happy Path", () => {
    test.describe("Forgot password", () => {
      test("PP-HP-001: 200 — forgot password for a registered partner", async ({
        request,
      }) => {
        const partner = await createPartner();
        const res = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: { email: partner.email },
        });
        expect(res.status()).toBe(200);
        await DbHelper.deletePartnerByEmail(partner.email);
      });

      test("PP-HP-002: 200 — forgot password for an unknown email (no enumeration)", async ({
        request,
      }) => {
        const res = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: { email: `nobody_${Date.now()}@test.com` },
        });
        expect(res.status()).toBe(200);
      });

      test("PP-HP-003: known and unknown emails return an identical message", async ({
        request,
      }) => {
        const partner = await createPartner();
        const known = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: { email: partner.email },
        });
        const unknown = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
          data: { email: `nobody_${Date.now()}@test.com` },
        });
        expect((await known.json()).message).toBe(
          (await unknown.json()).message,
        );
        await DbHelper.deletePartnerByEmail(partner.email);
      });
    });

    test.describe("Reset password", () => {
      test("PP-HP-010: 200 — resets password with a valid token", async ({
        request,
      }) => {
        const partner = await createPartner();
        const token = signResetToken(partner.email);
        const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token, password: "BrandNew123!" },
        });
        expect(res.status()).toBe(200);
        await DbHelper.deletePartnerByEmail(partner.email);
      });

      test("PP-HP-011: 200 — partner can log in with the new password", async ({
        request,
      }) => {
        const partner = await createPartner();
        const token = signResetToken(partner.email);
        const newPassword = "Changed456!";

        await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token, password: newPassword },
        });

        const login = await request.post(ENDPOINTS.ADMIN_LOGIN, {
          data: { email: partner.email, password: newPassword },
        });
        expect(login.status()).toBe(200);
        await DbHelper.deletePartnerByEmail(partner.email);
      });

      test("PP-HP-012: 200 — the old password no longer works after reset", async ({
        request,
      }) => {
        const partner = await createPartner();
        const token = signResetToken(partner.email);

        await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
          data: { token, password: "Replaced789!" },
        });

        const login = await request.post(ENDPOINTS.ADMIN_LOGIN, {
          data: { email: partner.email, password: partner.password },
        });
        expect(login.status()).not.toBe(200);
        await DbHelper.deletePartnerByEmail(partner.email);
      });
    });
  });
};
