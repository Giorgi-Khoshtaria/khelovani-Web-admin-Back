import { test } from "../../../../fixtures/admin.fixture.js";
import { expect } from "@playwright/test";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImageSuites = () => {
  test.describe("1. POST /api/admin/upload — Upload Image", () => {
    // ─── Happy Path ───────────────────────────────────────────────
    test("UPL-001: 200 or 201 — successfully upload valid image", async ({ adminApi }) => {
      const assetPath = path.resolve(__dirname, "../../../../helpers/assets/3ADDP.jpg");
      const fileBuffer = fs.readFileSync(assetPath);

      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "3ADDP.jpg", mimeType: "image/jpeg", buffer: fileBuffer },
        },
      });

      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body.data?.url ?? body.url).toBeDefined();
    });

    test("UPL-005: 200 or 201 — response url is a non-empty string", async ({ adminApi }) => {
      const assetPath = path.resolve(__dirname, "../../../../helpers/assets/3ADDP.jpg");
      const fileBuffer = fs.readFileSync(assetPath);

      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "3ADDP.jpg", mimeType: "image/jpeg", buffer: fileBuffer },
        },
      });

      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      const url = body.data?.url ?? body.url;
      expect(typeof url).toBe("string");
      expect(url.length).toBeGreaterThan(5);
    });

    // ─── Validation ───────────────────────────────────────────────
    test("UPL-002: 422 — missing image file", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: { otherField: "test" },
      });
      expect(res.status()).toBe(422);
    });

    test("UPL-006: 400 or 422 — empty multipart body", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, { multipart: {} });
      expect([400, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("UPL-007: 415 or 422 — wrong field name (file instead of image)", async ({ adminApi }) => {
      const assetPath = path.resolve(__dirname, "../../../../helpers/assets/3ADDP.jpg");
      const fileBuffer = fs.readFileSync(assetPath);

      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: { file: { name: "3ADDP.jpg", mimeType: "image/jpeg", buffer: fileBuffer } },
      });
      expect([400, 415, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    // ─── Authorization ────────────────────────────────────────────
    test("UPL-003: 401 or 403 — no token", async ({ api }) => {
      const fileBuffer = Buffer.from("dummy");
      const res = await api.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "test.png", mimeType: "image/png", buffer: fileBuffer },
        },
      });
      expect([401, 403]).toContain(res.status());
    });

    test("UPL-010: 403 — partner role cannot upload via admin endpoint", async ({ partnerApi }) => {
      const fileBuffer = Buffer.from("dummy");
      const res = await partnerApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "test.png", mimeType: "image/png", buffer: fileBuffer },
        },
      });
      expect([401, 403]).toContain(res.status());
    });

    test("UPL-011: 401 — expired JWT returns 401", async ({ api }) => {
      const expired =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
        ".eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9" +
        ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const res = await api.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: { image: { name: "x.jpg", mimeType: "image/jpeg", buffer: Buffer.from("x") } },
        headers: { Authorization: `Bearer ${expired}` },
      });
      expect(res.status()).toBe(401);
    });

    // ─── Security ─────────────────────────────────────────────────
    test("UPL-015: 400 or 422 — binary garbage as image file — no 500", async ({ adminApi }) => {
      const garbageBuffer = Buffer.from(Array.from({ length: 1024 }, () => Math.floor(Math.random() * 256)));
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "garbage.jpg", mimeType: "image/jpeg", buffer: garbageBuffer },
        },
      });
      expect([200, 201, 400, 415, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("UPL-016: 400 or 422 — SVG with embedded script is rejected or sanitized", async ({ adminApi }) => {
      const svgBuffer = Buffer.from('<svg><script>alert(1)</script></svg>');
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "evil.svg", mimeType: "image/svg+xml", buffer: svgBuffer },
        },
      });
      expect([400, 415, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("UPL-017: 413 or 422 — oversized file never causes 500", async ({ adminApi }) => {
      const bigBuffer = Buffer.alloc(20 * 1024 * 1024, 0xff);
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "huge.jpg", mimeType: "image/jpeg", buffer: bigBuffer },
        },
      });
      expect([400, 413, 415, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("UPL-018: path traversal in filename — no 500", async ({ adminApi }) => {
      const fileBuffer = Buffer.from("x");
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: { name: "../../etc/passwd.jpg", mimeType: "image/jpeg", buffer: fileBuffer },
        },
      });
      expect([200, 201, 400, 415, 422]).toContain(res.status());
      expect(res.status()).not.toBe(500);
    });

    test("UPL-019: no stack trace or DB internals in error response", async ({ adminApi }) => {
      const text = await (
        await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, { multipart: {} })
      ).text();
      expect(text).not.toMatch(/mongodb/i);
      expect(text).not.toMatch(/mongoose/i);
      expect(text).not.toMatch(/at Object\./);
      expect(text).not.toMatch(/\.js:\d+:\d+/);
    });

    test("UPL-020: no X-Powered-By header", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, { multipart: {} });
      expect(res.headers()["x-powered-by"]).toBeUndefined();
    });

    test("UPL-021: Content-Type is application/json on error response", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, { multipart: {} });
      expect(res.headers()["content-type"]).toContain("application/json");
    });
  });
};
