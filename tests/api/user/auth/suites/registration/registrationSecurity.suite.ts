import { expect } from "@playwright/test";
import { test } from "../../../../../fixtures/user.fixture.js";

import { ENDPOINTS, DEFAULT_USER } from "../../../../../constants/endpoints.js";
import {
  randomId,
  randomEmail,
} from "../../../../../helpers/utils/generators.js";
import { register, registerAndTrack } from "../../registration.helpers.js";

export const registrationSecuritySuites = () => {
  test.describe("8. Security & Injection", () => {
    test("SEC-001: 422 — SQL injection in email", async ({ request }) => {
      for (const payload of ["' OR '1'='1", "'; DROP TABLE users; --"]) {
        const res = await register(request, { email: payload }, true);
        expect(res.status()).toBe(422);
      }
    });

    test(
      "SEC-006: password never echoed in success response",
      async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, {}, true);
        const text = await res.text();
        expect(text).not.toContain(DEFAULT_USER.password);
      },
    );
  });

  test.describe("9. Rate Limiting", () => {
    test(
      "RTE-001: 429 triggered after rapid burst",
      async ({ request }) => {
        const BURST = 150;
        const results = await Promise.all(
          Array.from({ length: BURST }, () =>
            request.post(ENDPOINTS.REGISTER, {
              data: {
                ...DEFAULT_USER,
                email: randomEmail(),
                password: "",
                idNumber: randomId(),
              },
              headers: { "x-test-bypass": "none" },
            }),
          ),
        );
        const statuses = results.map((r) => r.status());
        const has429 = statuses.some((s) => s === 429);
        expect(has429, "Expected at least one 429 status during burst").toBe(
          true,
        );
      },
    );
  });

  test.describe("10. Response Shape Contract", () => {
    test(
      "SHP-001: 201 response has correct Content-Type",
      async ({ request, createdUsers }) => {
        const { res } = await registerAndTrack(request, createdUsers, {}, true);
        expect(res.headers()["content-type"]).toContain("application/json");
      },
    );

    test(
      "SHP-002: 422 response includes errors array",
      async ({ request }) => {
        const res = await register(request, { email: "bad" }, true);
        const body = await res.json();
        expect(res.status()).toBe(422);
        expect(Array.isArray(body.errors)).toBe(true);
      },
    );

    test(
      "SHP-003: 409 response body has message property",
      async ({ request, createdUsers }) => {
        const sharedId = randomId();
        const email1 = randomEmail();
        await register(request, { email: email1, idNumber: sharedId }, true);
        createdUsers.push({
          email: email1,
          idNumber: sharedId,
          password: DEFAULT_USER.password,
        });

        const r2 = await register(request, {
          email: randomEmail(),
          idNumber: sharedId,
        }, true);
        const body = await r2.json();
        expect(r2.status()).toBe(409);
        expect(typeof body.message).toBe("string");
      },
    );
  });
};
