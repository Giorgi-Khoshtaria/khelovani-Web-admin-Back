import { test, expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import { DbHelper } from "../../../../helpers/db/db.helper.js";
import {
  createAuthedUser,
  deleteAuthedUser,
  AuthedUser,
} from "../../../../helpers/shared/auth.helper.js";
import { validAddress, addAddress, listAddresses } from "../addresses.helpers.js";

export const addressesHappyPathSuites = () => {
  test.describe("1. Addresses — Happy Path", () => {
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

    test("ADDR-001: 201 — adds an address", async ({ request }) => {
      const res = await addAddress(request, user.authHeaders, validAddress());
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toMatchObject({ type: "home", label: "My Home" });
    });

    test("ADDR-002: 201 — first address is forced default", async ({
      request,
    }) => {
      const res = await addAddress(request, user.authHeaders, validAddress());
      expect((await res.json()).data.isDefault).toBe(true);
    });

    test("ADDR-003: 201 — second address not default unless requested", async ({
      request,
    }) => {
      await addAddress(request, user.authHeaders, validAddress());
      const res = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Office" }),
      );
      expect((await res.json()).data.isDefault).toBe(false);
    });

    test("ADDR-004: 201 — second address with isDefault demotes first", async ({
      request,
    }) => {
      await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Home A" }),
      );
      await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Home B", isDefault: true }),
      );
      const body = await (
        await listAddresses(request, user.authHeaders)
      ).json();
      const defaults = body.data.filter((a: any) => a.isDefault);
      expect(defaults).toHaveLength(1);
      expect(defaults[0].label).toBe("Home B");
    });

    test("ADDR-005: 200 — empty list for a fresh user", async ({
      request,
    }) => {
      const res = await listAddresses(request, user.authHeaders);
      expect(res.status()).toBe(200);
      expect((await res.json()).data).toEqual([]);
    });

    test("ADDR-006: 200 — default address listed first", async ({
      request,
    }) => {
      await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Address A" }),
      );
      await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Address B", isDefault: true }),
      );
      const body = await (
        await listAddresses(request, user.authHeaders)
      ).json();
      expect(body.data[0].isDefault).toBe(true);
      expect(body.data[0].label).toBe("Address B");
    });

    test("ADDR-007: 200 — updates an address", async ({ request }) => {
      const created = await addAddress(
        request,
        user.authHeaders,
        validAddress(),
      );
      const id = (await created.json()).data._id;
      const res = await request.patch(`${ENDPOINTS.ADDRESSES}/${id}`, {
        headers: user.authHeaders,
        data: validAddress({ label: "Updated Label", type: "work" }),
      });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.label).toBe("Updated Label");
      expect(body.data.type).toBe("work");
    });

    test("ADDR-008: 200 — set default promotes and demotes", async ({
      request,
    }) => {
      const a = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Address A" }),
      );
      const b = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Address B" }),
      );
      const firstId = (await a.json()).data._id;
      const secondId = (await b.json()).data._id;

      const res = await request.patch(
        `${ENDPOINTS.ADDRESSES}/${secondId}/default`,
        { headers: user.authHeaders },
      );
      expect(res.status()).toBe(200);
      const map = new Map(
        (await res.json()).data.map((x: any) => [x._id, x.isDefault]),
      );
      expect(map.get(secondId)).toBe(true);
      expect(map.get(firstId)).toBe(false);
    });

    test("ADDR-009: 200 — deletes an address", async ({ request }) => {
      const created = await addAddress(
        request,
        user.authHeaders,
        validAddress(),
      );
      const id = (await created.json()).data._id;
      const res = await request.delete(`${ENDPOINTS.ADDRESSES}/${id}`, {
        headers: user.authHeaders,
      });
      expect(res.status()).toBe(200);
    });

    test("ADDR-010: 200 — deleting default promotes another address", async ({
      request,
    }) => {
      const first = await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Default", isDefault: true }),
      );
      await addAddress(
        request,
        user.authHeaders,
        validAddress({ label: "Other" }),
      );
      const defaultId = (await first.json()).data._id;

      await request.delete(`${ENDPOINTS.ADDRESSES}/${defaultId}`, {
        headers: user.authHeaders,
      });

      const body = await (
        await listAddresses(request, user.authHeaders)
      ).json();
      expect(body.data).toHaveLength(1);
      expect(body.data[0].isDefault).toBe(true);
    });

    test("ADDR-011: 409 — rejects past the 20-address limit", async ({
      request,
    }) => {
      await DbHelper.seedAddresses(user.id, 20);
      const res = await addAddress(request, user.authHeaders, validAddress());
      expect(res.status()).toBe(409);
    });
  });
};
