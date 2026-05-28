import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import { validAddress, addAddress, listAddresses, FAKE_ID } from "../addresses.helpers.js";

export const addressesSecuritySuites = () => {
  test.describe("3. Addresses — Security & Access Control", () => {
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
      await DbHelper.deleteAddressesByUserId(owner.id).catch(() => {});
      await DbHelper.deleteAddressesByUserId(attacker.id).catch(() => {});
      await deleteAuthedUser(owner);
      await deleteAuthedUser(attacker);
    });

    test.describe("Authentication required", () => {
      test("ADDR-SEC-001: 401 — add without token", async ({ request }) => {
        const res = await request.post(ENDPOINTS.ADDRESSES, {
          data: validAddress(),
        });
        expect(res.status()).toBe(401);
      });

      test("ADDR-SEC-002: 401 — list without token", async ({ request }) => {
        const res = await request.get(ENDPOINTS.ADDRESSES);
        expect(res.status()).toBe(401);
      });

      test("ADDR-SEC-003: 401 — update without token", async ({
        request,
      }) => {
        const res = await request.patch(`${ENDPOINTS.ADDRESSES}/${FAKE_ID}`, {
          data: validAddress(),
        });
        expect(res.status()).toBe(401);
      });

      test("ADDR-SEC-004: 401 — delete without token", async ({
        request,
      }) => {
        const res = await request.delete(`${ENDPOINTS.ADDRESSES}/${FAKE_ID}`);
        expect(res.status()).toBe(401);
      });

      test("ADDR-SEC-005: 401 — malformed bearer token", async ({
        request,
      }) => {
        const res = await request.get(ENDPOINTS.ADDRESSES, {
          headers: { Authorization: "Bearer garbage.token.value" },
        });
        expect(res.status()).toBe(401);
      });
    });

    test.describe("Cross-user isolation (IDOR)", () => {
      test("ADDR-SEC-010: a user only sees their own addresses", async ({
        request,
      }) => {
        await addAddress(
          request,
          attacker.authHeaders,
          validAddress({ label: "ATTACKER" }),
        );
        await addAddress(
          request,
          owner.authHeaders,
          validAddress({ label: "OWNER" }),
        );
        const body = await (
          await listAddresses(request, owner.authHeaders)
        ).json();
        expect(body.data.every((a: any) => a.label !== "ATTACKER")).toBe(true);
        await DbHelper.deleteAddressesByUserId(owner.id);
        await DbHelper.deleteAddressesByUserId(attacker.id);
      });

      test("ADDR-SEC-011: 404 — cannot update another user's address", async ({
        request,
      }) => {
        const created = await addAddress(
          request,
          attacker.authHeaders,
          validAddress(),
        );
        const foreignId = (await created.json()).data._id;
        const res = await request.patch(
          `${ENDPOINTS.ADDRESSES}/${foreignId}`,
          { headers: owner.authHeaders, data: validAddress() },
        );
        expect(res.status()).toBe(404);
        await DbHelper.deleteAddressesByUserId(attacker.id);
      });

      test("ADDR-SEC-012: 404 — cannot set another user's address default", async ({
        request,
      }) => {
        const created = await addAddress(
          request,
          attacker.authHeaders,
          validAddress(),
        );
        const foreignId = (await created.json()).data._id;
        const res = await request.patch(
          `${ENDPOINTS.ADDRESSES}/${foreignId}/default`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
        await DbHelper.deleteAddressesByUserId(attacker.id);
      });

      test("ADDR-SEC-013: 404 — cannot delete another user's address", async ({
        request,
      }) => {
        const created = await addAddress(
          request,
          attacker.authHeaders,
          validAddress(),
        );
        const foreignId = (await created.json()).data._id;
        const res = await request.delete(
          `${ENDPOINTS.ADDRESSES}/${foreignId}`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
        await DbHelper.deleteAddressesByUserId(attacker.id);
      });
    });

    test.describe("Non-existent resources", () => {
      test("ADDR-SEC-020: 404 — update a non-existent address", async ({
        request,
      }) => {
        const res = await request.patch(`${ENDPOINTS.ADDRESSES}/${FAKE_ID}`, {
          headers: owner.authHeaders,
          data: validAddress(),
        });
        expect(res.status()).toBe(404);
      });

      test("ADDR-SEC-021: 404 — set default on a non-existent address", async ({
        request,
      }) => {
        const res = await request.patch(
          `${ENDPOINTS.ADDRESSES}/${FAKE_ID}/default`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
      });

      test("ADDR-SEC-022: 404 — delete a non-existent address", async ({
        request,
      }) => {
        const res = await request.delete(
          `${ENDPOINTS.ADDRESSES}/${FAKE_ID}`,
          { headers: owner.authHeaders },
        );
        expect(res.status()).toBe(404);
      });
    });
  });
};
