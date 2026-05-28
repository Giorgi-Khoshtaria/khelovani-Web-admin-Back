import { test, expect } from "@playwright/test";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import {
  cardHolderNameScenarios,
  cardBrandScenarios,
  cardLast4Scenarios,
  cardExpMonthScenarios,
  cardExpYearScenarios,
  LIMITS,
} from "../../../../helpers/shared/validation.helper.js";
import { validCard, addCard } from "../cards.helpers.js";

export const cardsValidationSuites = () => {
  test.describe("2. Payment Cards — Field Validation", () => {
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
      await DbHelper.deleteCardsByUserId(user.id).catch(() => {});
      await deleteAuthedUser(user);
    });

    test.beforeEach(async () => {
      await DbHelper.deleteCardsByUserId(user.id);
    });

    const allScenarios = [
      ...cardHolderNameScenarios,
      ...cardBrandScenarios,
      ...cardLast4Scenarios,
      ...cardExpMonthScenarios,
      ...cardExpYearScenarios,
    ];

    for (const { id, field, value, note } of allScenarios) {
      test(`${id}: 422 — ${field}: ${note}`, async ({ request }) => {
        const res = await addCard(
          request,
          user.authHeaders,
          validCard({ [field]: value }),
        );
        expect(res.status(), `${id}: ${note}`).toBe(422);
      });
    }

    test("CARD-VAL-050: 422 — missing holderName entirely", async ({
      request,
    }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ holderName: undefined }),
      );
      expect(res.status()).toBe(422);
    });

    test("CARD-VAL-051: 422 — missing brand entirely", async ({ request }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ brand: undefined }),
      );
      expect(res.status()).toBe(422);
    });

    test("CARD-VAL-052: 422 — unknown extra field rejected (strict)", async ({
      request,
    }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ cvv: "123" }),
      );
      expect(res.status()).toBe(422);
    });

    test("CARD-VAL-053: 422 — card expired (current year, past month)", async ({
      request,
    }) => {
      const now = new Date();
      test.skip(now.getMonth() === 0, "No past month exists in January");
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ expYear: now.getFullYear(), expMonth: 1 }),
      );
      expect(res.status()).toBe(422);
    });

    test("CARD-VAL-054: 201 — holderName at max boundary (60 chars)", async ({
      request,
    }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ holderName: "a".repeat(LIMITS.card.holderName.max) }),
      );
      expect(res.status()).toBe(201);
    });

    test("CARD-VAL-055: 201 — expMonth at min boundary (1)", async ({
      request,
    }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ expMonth: 1, expYear: new Date().getFullYear() + 1 }),
      );
      expect(res.status()).toBe(201);
    });

    for (const brand of ["visa", "mastercard", "amex", "other"]) {
      test(`CARD-VAL-06X: 201 — brand "${brand}" accepted`, async ({
        request,
      }) => {
        const res = await addCard(
          request,
          user.authHeaders,
          validCard({ brand }),
        );
        expect(res.status()).toBe(201);
      });
    }
  });
};
