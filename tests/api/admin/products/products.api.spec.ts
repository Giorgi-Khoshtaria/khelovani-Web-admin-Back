import { test } from "../../../fixtures/admin.fixture.js";
import { listProductsSuites } from "./suites/listProducts.suite.js";
import { createProductSuites } from "./suites/createProduct.suite.js";
import { updateProductSuites } from "./suites/updateProduct.suite.js";
import { deleteProductSuites } from "./suites/deleteProduct.suite.js";
import { productsSecuritySuites } from "./suites/productsSecurity.suite.js";
import { productsContractSuites } from "./suites/productsContract.suite.js";
import { getProductByIdSuites } from "./suites/getProductById.suite.js";
import { productValidationSuites } from "./suites/productValidation.suite.js";
import { pinProductSuites } from "./suites/pinProduct.suite.js";
import { loadCategorySlugs } from "./products.helpers.js";

/**
 * ============================================================
 *  Admin Product API — Maximum Coverage Edition
 * ============================================================
 */

test.describe("Admin Products API", () => {
  test.beforeAll(async ({ request }) => {
    await loadCategorySlugs(request);
  });

  listProductsSuites();
  getProductByIdSuites();
  createProductSuites();
  productValidationSuites();
  updateProductSuites();
  deleteProductSuites();
  productsSecuritySuites();
  productsContractSuites();
  pinProductSuites();
});
