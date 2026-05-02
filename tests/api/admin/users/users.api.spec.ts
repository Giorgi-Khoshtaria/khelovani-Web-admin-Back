import { test } from "../../../fixtures/admin.fixture.js";
import { deleteUserSuites } from "./suites/deleteUser.suite.js";
import { bulkDeleteUsersSuites } from "./suites/bulkDeleteUsers.suite.js";

test.describe("Admin Users API", () => {
  deleteUserSuites();
  bulkDeleteUsersSuites();
});
