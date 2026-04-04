import { test } from "../../../fixtures/auth.fixture.js";
import { createMenuItemSuites } from "./suites/createMenuItem.suite.js";
import { getMenuItemsSuites } from "./suites/getMenuItems.suite.js";
import { updateMenuItemSuites } from "./suites/updateMenuItem.suite.js";
import { deleteMenuItemSuites } from "./suites/deleteMenuItem.suite.js";
import { menuSecuritySuites } from "./suites/menuSecurity.suite.js";

/**
 * ============================================================
 *  Admin Menu API — Maximum Coverage
 * ============================================================
 */

test.describe("Admin Menu API", () => {
  createMenuItemSuites();
  getMenuItemsSuites();
  updateMenuItemSuites();
  deleteMenuItemSuites();
  menuSecuritySuites();
});
