import { test, expect } from "@playwright/test";

test("get menu items", async ({ request }) => {
  const response = await request.get("/api/menu");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  // Basic check for success field if the API returns { success: true, ... }
  if (body.hasOwnProperty("success")) {
    expect(body.success).toBe(true);
  }
});
