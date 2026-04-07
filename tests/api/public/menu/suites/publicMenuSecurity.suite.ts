import { test } from "../../../../fixtures/user.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";

export const publicMenuSecuritySuites = () => {
    test.describe("2. Security & Public Access — Public Menu", () => {
        test("PMN-070: 200 — Accessible without authentication", async ({ api }) => {
            const res = await api.get(ENDPOINTS.PUBLIC_MENU);
            expect(res.status()).toBe(200);
        });

        test("PMN-071: 200 — Accessible even with provided token", async ({ api }) => {
            // We can try to send some arbitrary token
            const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
                headers: { Authorization: "Bearer some_dummy_token" }
            });
            expect(res.status()).toBe(200);
        });

        test("PMN-072: Robustness — ignores unexpected query parameters", async ({ api }) => {
            const res = await api.get(ENDPOINTS.PUBLIC_MENU, {
                params: { unknown: "parameter", injection: "{$gt: ''}" }
            });
            expect(res.status()).toBe(200);
        });

        test("PMN-073: Method Not Allowed — POST /api/menu should fail (405 or 404)", async ({ api }) => {
            const res = await api.post(ENDPOINTS.PUBLIC_MENU, { data: {} });
            // Express returns 404 for undefined methods by default, unless handled
            expect([404, 405]).toContain(res.status());
        });
    });
};
