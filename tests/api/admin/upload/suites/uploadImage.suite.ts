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
    test("UPL-001: 201/200 — successfully upload image", async ({
      adminApi,
    }) => {
      // Use a real image asset for the upload
      const assetPath = path.resolve(__dirname, "../../../../helpers/assets/3ADDP.jpg");
      const fileBuffer = fs.readFileSync(assetPath);
      
      const res = await adminApi.post(ENDPOINTS.ADMIN_UPLOAD, {
        multipart: {
          image: {
            name: "3ADDP.jpg",
            mimeType: "image/jpeg",
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
      expect(res.status()).toBe(422);
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
