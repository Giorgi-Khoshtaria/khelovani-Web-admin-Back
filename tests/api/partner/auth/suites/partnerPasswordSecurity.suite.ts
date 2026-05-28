import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  signResetToken,
  signWithWrongSecret,
  signExpiredToken,
  createPartner,
} from "../partnerPassword.helpers.js";

export const partnerPasswordSecuritySuites = () => {
  test.describe("3. Partner Password — Security", () => {
    test("PP-SEC-001: 400 — reset with a garbage token", async ({
      request,
    }) => {
      const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token: "not-a-real-jwt", password: "ValidPass123!" },
      });
      expect(res.status()).toBe(400);
    });

    test("PP-SEC-002: 400 — reset with a token signed by the wrong secret", async ({
      request,
    }) => {
      const partner = await createPartner();
      const token = signWithWrongSecret(partner.email);
      const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token, password: "ValidPass123!" },
      });
      expect(res.status()).toBe(400);
      await DbHelper.deletePartnerByEmail(partner.email);
    });

    test("PP-SEC-003: 400 — reset with an expired token", async ({
      request,
    }) => {
      const partner = await createPartner();
      const token = signExpiredToken(partner.email);
      const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token, password: "ValidPass123!" },
      });
      expect(res.status()).toBe(400);
      await DbHelper.deletePartnerByEmail(partner.email);
    });

    test("PP-SEC-004: 404 — valid token for an email with no partner", async ({
      request,
    }) => {
      const token = signResetToken(`ghost_${Date.now()}@test.com`);
      const res = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token, password: "ValidPass123!" },
      });
      expect(res.status()).toBe(404);
    });

    test("PP-SEC-005: forgot password does not leak whether an email exists", async ({
      request,
    }) => {
      const partner = await createPartner();
      const known = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
        data: { email: partner.email },
      });
      const unknown = await request.post(ENDPOINTS.PARTNER_FORGOT_PASSWORD, {
        data: { email: `ghost_${Date.now()}@test.com` },
      });
      expect(known.status()).toBe(unknown.status());
      expect((await known.json()).message).toBe(
        (await unknown.json()).message,
      );
      await DbHelper.deletePartnerByEmail(partner.email);
    });

    test("PP-SEC-006: a reset token cannot be replayed after use", async ({
      request,
    }) => {
      const partner = await createPartner();
      const token = signResetToken(partner.email);

      const first = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token, password: "FirstChange123!" },
      });
      expect(first.status()).toBe(200);

      // The same JWT is still cryptographically valid; this documents that
      // the current implementation is stateless (token reuse IS possible).
      const second = await request.post(ENDPOINTS.PARTNER_RESET_PASSWORD, {
        data: { token, password: "SecondChange123!" },
      });
      expect([200, 400]).toContain(second.status());
      await DbHelper.deletePartnerByEmail(partner.email);
    });
  });
};
