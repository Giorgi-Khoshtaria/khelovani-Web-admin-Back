import { test } from "../../../fixtures/admin.fixture.js";
import { createRoleSuites } from "./suites/createRole.suite.js";
import { listRolesSuites } from "./suites/listRoles.suite.js";
import { getRoleByIdSuites } from "./suites/getRoleById.suite.js";
import { updateRoleSuites } from "./suites/updateRole.suite.js";
import { deleteRoleSuites } from "./suites/deleteRole.suite.js";
import { rolePermissionsSuites } from "./suites/rolePermissions.suite.js";
import { systemRoleProtectionSuites } from "./suites/systemRoleProtection.suite.js";
import { rolesSecuritySuites } from "./suites/rolesSecurity.suite.js";
import { roleResponseContractSuites } from "./suites/roleResponseContract.suite.js";

/**
 * ============================================================
 *  Admin Roles API — Maximum Coverage Edition
 * ============================================================
 */

test.describe("Admin Roles API", () => {
  createRoleSuites();
  listRolesSuites();
  getRoleByIdSuites();
  updateRoleSuites();
  deleteRoleSuites();
  rolePermissionsSuites();
  systemRoleProtectionSuites();
  rolesSecuritySuites();
  roleResponseContractSuites();
});
