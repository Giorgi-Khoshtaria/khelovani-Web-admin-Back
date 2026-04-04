import { test, expect } from "../../../../fixtures/auth.fixture.js";
import { ENDPOINTS } from "../../../../constants/endpoints.js";
import path from "path";
import fs from "fs";

export const uploadImageSuites = () => {
  test.describe("1. POST /api/admin/upload — Upload Image", () => {
    test("UPL-001: 201/200 — successfully upload image", async ({
      adminApi,
    }) => {
      // Create a dummy file in memory or use a small text string as a buffer
      const fileBuffer = Buffer.from("dummy image content");

      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: {
            name: "test-image.png",
            mimeType: "image/png",
            buffer: fileBuffer,
          },
        },
      });

      // Based on common implementations, it either returns 200 or 201
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      expect(body).toHaveProperty("url"); // Assuming the backend returns the uploaded URL
    });

    test("UPL-002: 400 — missing image file", async ({ adminApi }) => {
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          otherField: "test",
        },
      });
      expect([400, 422]).toContain(res.status());
    });

    test("UPL-003: 401 — unauthorized upload", async ({ api }) => {
      // api instead of adminApi to simulate unauthorized/non-admin user
      const fileBuffer = Buffer.from("dummy");
      const res = await api.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: {
            name: "test-image.png",
            mimeType: "image/png",
            buffer: fileBuffer,
          },
        },
      });
      expect([401, 403]).toContain(res.status());
    });
  });
};
