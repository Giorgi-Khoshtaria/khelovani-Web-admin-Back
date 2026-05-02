import { test } from "../../../fixtures/admin.fixture.js";
import { createPermissionSuites } from "./suites/createPermission.suite.js";
import { listPermissionsSuites } from "./suites/listPermissions.suite.js";
import { getPermissionByIdSuites } from "./suites/getPermissionById.suite.js";
import { updatePermissionSuites } from "./suites/updatePermission.suite.js";
import { deletePermissionSuites } from "./suites/deletePermission.suite.js";
import { permissionsSecuritySuites } from "./suites/permissionsSecurity.suite.js";
import { permissionValidationSuites } from "./suites/permissionValidation.suite.js";
import { permissionCategoriesSuites } from "./suites/permissionCategories.suite.js";

test.describe("Admin Permissions API", () => {
  createPermissionSuites();
  permissionValidationSuites();
  listPermissionsSuites();
  getPermissionByIdSuites();
  updatePermissionSuites();
  deletePermissionSuites();
  permissionsSecuritySuites();
  permissionCategoriesSuites();
});
