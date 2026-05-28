import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import {
  addressTypeScenarios,
  addressLabelScenarios,
  addressLineScenarios,
  addressLatScenarios,
  addressLngScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";
import { validAddress, addAddress } from "../addresses.helpers.js";

export const addressesValidationSuites = () => {
  test.describe("2. Addresses — Field Validation", () => {
    let user: AuthedUser;

    test.beforeAll(async ({ playwright }) => {
      const ctx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        extraHTTPHeaders: { "x-test-bypass": "khelovani-test-2026" },
      });
      user = await createAuthedUser(ctx);
      await ctx.dispose();
    });

    test.afterAll(async () => {
      await DbHelper.deleteAddressesByUserId(user.id).catch(() => {});
      await deleteAuthedUser(user);
    });

    test.beforeEach(async () => {
      await DbHelper.deleteAddressesByUserId(user.id);
    });

    const allScenarios = [
      ...addressTypeScenarios,
      ...addressLabelScenarios,
      ...addressLineScenarios,
      ...addressLatScenarios,
      ...addressLngScenarios,
    ];

    for (const { id, field, value, note } of allScenarios) {
      test(`${id}: 422 — ${field}: ${note}`, async ({ request }) => {
        const res = await addAddress(
          request,
          user.authHeaders,
          validAddress({ [field]: value }),
        );
        expect(res.status(), `${id}: ${note}`).toBe(422);
      });
    }

    test("ADDR-VAL-100: 422 — missing label entirely", async ({
      request,
    }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: undefined }),
      );
      expect(res.status()).toBe(422);
    });

    test("ADDR-VAL-101: 422 — missing type entirely", async ({ request }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ type: undefined }),
      );
      expect(res.status()).toBe(422);
    });

    test("ADDR-VAL-102: 422 — unknown extra field rejected (strict)", async ({
      request,
    }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ country: "GE" }),
      );
      expect(res.status()).toBe(422);
    });

    test("ADDR-VAL-103: 422 — additionalComment over 300 chars", async ({
      request,
    }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({
          additionalComment: "x".repeat(LIMITS.address.additionalComment.max + 1),
        }),
      );
      expect(res.status()).toBe(422);
    });

    test("ADDR-VAL-104: 422 — invalid body on update", async ({
      request,
    }) => {
      const created = await addAddress(
        request,
        user.authHeaders,
        validAddress(),
      );
      const id = (await created.json()).data._id;
      const res = await request.patch(`${ENDPOINTS.ADDRESSES}/${id}`, {
        headers: user.authHeaders,
        data: validAddress({ lat: 999 }),
      });
      expect(res.status()).toBe(422);
    });

    for (const type of ["home", "work", "other"]) {
      test(`ADDR-VAL-11X: 201 — type "${type}" accepted`, async ({
        request,
      }) => {
        const res = await addAddress(
          request,
          user.authHeaders,
          validAddress({ type }),
        );
        expect(res.status()).toBe(201);
      });
    }

    test("ADDR-VAL-120: 201 — label at min boundary (2 chars)", async ({
      request,
    }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "ab" }),
      );
      expect(res.status()).toBe(201);
    });

    test("ADDR-VAL-121: 201 — empty additionalComment allowed", async ({
      request,
    }) => {
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ additionalComment: "" }),
      );
      expect(res.status()).toBe(201);
    });
  });
};
