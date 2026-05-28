import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import { validCard, addCard, listCards, FAKE_ID } from "../cards.helpers.js";

export const cardsSecuritySuites = () => {
  test.describe("3. Payment Cards — Security & Access Control", () => {
    let owner: AuthedUser;
    let attacker: AuthedUser;

    test.beforeAll(async ({ playwright }) => {
      const ctx = await playwright.request.newContext({
        baseURL: "http://localhost:3001",
        extraHTTPHeaders: { "x-test-bypass": "khelovani-test-2026" },
      });
      owner = await createAuthedUser(ctx);
      attacker = await createAuthedUser(ctx);
      await ctx.dispose();
    });

    test.afterAll(async () => {
      await DbHelper.deleteCardsByUserId(owner.id).catch(() => {});
      await DbHelper.deleteCardsByUserId(attacker.id).catch(() => {});
      await deleteAuthedUser(owner);
      await deleteAuthedUser(attacker);
    });

    test.describe("Authentication required", () => {
      test("CARD-SEC-001: 401 — add card without token", async ({
        request,
      }) => {
        const res = await request.post(ENDPOINTS.CARDS, { data: validCard() });
        expect(res.status()).toBe(401);
      });

      test("CARD-SEC-002: 401 — list cards without token", async ({
        request,
      }) => {
        const res = await request.get(ENDPOINTS.CARDS);
        expect(res.status()).toBe(401);
      });

      test("CARD-SEC-003: 401 — set default without token", async ({
        request,
      }) => {
        const res = await request.patch(
          `${ENDPOINTS.CARDS}/${FAKE_ID}/default`,
        );
        expect(res.status()).toBe(401);
      });

      test("CARD-SEC-004: 401 — delete without token", async ({ request }) => {
        const res = await request.delete(`${ENDPOINTS.CARDS}/${FAKE_ID}`);
        expect(res.status()).toBe(401);
      });

      test("CARD-SEC-005: 401 — malformed bearer token", async ({
        request,
      }) => {
        const res = await request.get(ENDPOINTS.CARDS, {
          headers: { Authorization: "Bearer not.a.real.jwt" },
        });
        expect(res.status()).toBe(401);
      });
    });

    test.describe("Cross-user isolation (IDOR)", () => {
      test("CARD-SEC-010: a user only sees their own cards", async ({
        request,
      }) => {
        await addCard(
          request,
          attacker.authHeaders,
          validCard({ last4: "9999" }),
        );
        await addCard(request, owner.authHeaders, validCard({ last4: "1234" }));
        const body = await (await listCards(request, owner.authHeaders)).json();
        expect(body.data.every((c: any) => c.last4 !== "9999")).toBe(true);
        await DbHelper.deleteCardsByUserId(owner.id);
        await DbHelper.deleteCardsByUserId(attacker.id);
      });

      test("CARD-SEC-011: 404 — cannot set another user's card as default", async ({
        request,
      }) => {
        const created = await addCard(
          request,
          attacker.authHeaders,
          validCard({ last4: "7777" }),
        );
        const foreignId = (await created.json()).data._id;
        const res = await request.patch(
          `${ENDPOINTS.CARDS}/${foreignId}/default`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
        await DbHelper.deleteCardsByUserId(attacker.id);
      });

      test("CARD-SEC-012: 404 — cannot delete another user's card", async ({
        request,
      }) => {
        const created = await addCard(
          request,
          attacker.authHeaders,
          validCard({ last4: "8888" }),
        );
        const foreignId = (await created.json()).data._id;
        const res = await request.delete(`${ENDPOINTS.CARDS}/${foreignId}`, {
          headers: owner.authHeaders,
        });
        expect(res.status()).toBe(404);
        await DbHelper.deleteCardsByUserId(attacker.id);
      });
    });

    test.describe("Non-existent resources", () => {
      test("CARD-SEC-020: 404 — set default on non-existent card", async ({
        request,
      }) => {
        const res = await request.patch(
          `${ENDPOINTS.CARDS}/${FAKE_ID}/default`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
      });

      test("CARD-SEC-021: 404 — delete a non-existent card", async ({
        request,
      }) => {
        const res = await request.delete(`${ENDPOINTS.CARDS}/${FAKE_ID}`, {
          headers: owner.authHeaders,
        });
        expect(res.status()).toBe(404);
      });
    });
  });
};
