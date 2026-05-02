import { test } from "../../../fixtures/admin.fixture.js";
import { createCategorySuites } from "./suites/createCategory.suite.js";
import { listCategoriesSuites } from "./suites/listCategories.suite.js";
import { getCategoryByIdSuites } from "./suites/getCategoryById.suite.js";
import { updateCategorySuites } from "./suites/updateCategory.suite.js";
import { deleteCategorySuites } from "./suites/deleteCategory.suite.js";
import { categoriesSecuritySuites } from "./suites/categoriesSecurity.suite.js";

test.describe("Admin Categories API", () => {
  createCategorySuites();
  listCategoriesSuites();
  getCategoryByIdSuites();
  updateCategorySuites();
  deleteCategorySuites();
  categoriesSecuritySuites();
});
