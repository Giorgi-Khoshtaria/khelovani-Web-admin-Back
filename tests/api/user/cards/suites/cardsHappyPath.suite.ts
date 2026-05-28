import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import { validCard, addCard, listCards } from "../cards.helpers.js";

export const cardsHappyPathSuites = () => {
  test.describe("1. Payment Cards — Happy Path", () => {
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

    test("CARD-001: 201 — adds a card successfully", async ({ request }) => {
      const res = await addCard(request, user.authHeaders, validCard());
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({ brand: "visa", last4: "4242" });
    });

    test("CARD-002: 201 — first card is forced default", async ({
      request,
    }) => {
      const res = await addCard(request, user.authHeaders, validCard());
      expect((await res.json()).data.isDefault).toBe(true);
    });

    test("CARD-003: 201 — second card is not default by default", async ({
      request,
    }) => {
      await addCard(request, user.authHeaders, validCard());
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "1111" }),
      );
      expect((await res.json()).data.isDefault).toBe(false);
    });

    test("CARD-004: 201 — second card with isDefault demotes the first", async ({
      request,
    }) => {
      await addCard(request, user.authHeaders, validCard({ last4: "0001" }));
      await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "0002", isDefault: true }),
      );
      const body = await (await listCards(request, user.authHeaders)).json();
      const defaults = body.data.filter((c: any) => c.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].last4).toBe("0002");
    });

    test("CARD-005: 201 — holderName is stored uppercased", async ({
      request,
    }) => {
      const res = await addCard(
        request,
        user.authHeaders,
        validCard({ holderName: "jane smith" }),
      );
      expect((await res.json()).data.holderName).toBe("JANE SMITH");
    });

    test("CARD-006: 200 — list is empty for a card-less user", async ({
      request,
    }) => {
      const res = await listCards(request, user.authHeaders);
      expect(res.status()).toBe(200);
      expect((await res.json()).data).toEqual([]);
    });

    test("CARD-007: 200 — default card is listed first", async ({
      request,
    }) => {
      await addCard(request, user.authHeaders, validCard({ last4: "1000" }));
      await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "2000", isDefault: true }),
      );
      const body = await (await listCards(request, user.authHeaders)).json();
      expect(body.data[0].isDefault).toBe(true);
      expect(body.data[0].last4).toBe("2000");
    });

    test("CARD-008: 200 — set default promotes one and demotes others", async ({
      request,
    }) => {
      const a = await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "0011" }),
      );
      const b = await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "0022" }),
      );
      const firstId = (await a.json()).data._id;
      const secondId = (await b.json()).data._id;

      const res = await request.patch(
        `${ENDPOINTS.CARDS}/${secondId}/default`,
        { headers: user.authHeaders },
      );
      expect(res.status()).toBe(200);
      const map = new Map(
        (await res.json()).data.map((c: any) => [c._id, c.isDefault]),
      );
      expect(map.get(secondId)).toBe(true);
      expect(map.get(firstId)).toBe(false);
    });

    test("CARD-009: 200 — deletes a card", async ({ request }) => {
      const created = await addCard(request, user.authHeaders, validCard());
      const id = (await created.json()).data._id;
      const res = await request.delete(`${ENDPOINTS.CARDS}/${id}`, {
        headers: user.authHeaders,
      });
      expect(res.status()).toBe(200);
      const body = await (await listCards(request, user.authHeaders)).json();
      expect(body.data).toHaveLength(0);
    });

    test("CARD-010: 200 — deleting the default promotes another card", async ({
      request,
    }) => {
      const first = await addCard(
        request,
        user.authHeaders,
        validCard({ last4: "0100", isDefault: true }),
      );
      await addCard(request, user.authHeaders, validCard({ last4: "0200" }));
      const defaultId = (await first.json()).data._id;

      await request.delete(`${ENDPOINTS.CARDS}/${defaultId}`, {
        headers: user.authHeaders,
      });

      const body = await (await listCards(request, user.authHeaders)).json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].isDefault).toBe(true);
    });
  });
};
