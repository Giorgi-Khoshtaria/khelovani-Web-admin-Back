import { test as base, expect, APIRequestContext } from "@playwright/test";
import { DbHelper } from "../helpers/db/db.helper.js";
import { ENDPOINTS } from "../constants/endpoints.js";
import { randomId } from "../helpers/utils/generators.js";

export interface CreatedAdmin {
  email: string;
  password: string;
}

export interface AdminFixtures {
  createdAdmins: CreatedAdmin[];
  createAdminUser: () => Promise<CreatedAdmin>;
  adminUser: CreatedAdmin;
  adminApi: APIRequestContext;
  api: APIRequestContext;
  partnerUser: { email: string; password: string; id: string };
  partnerApi: APIRequestContext;
}

export const adminTest = base.extend<AdminFixtures>({
  createdAdmins: async ({}, use) => {
    const admins: CreatedAdmin[] = [];
    await use(admins);
  },

  createAdminUser: async ({ createdAdmins }, use) => {
    await use(async () => {
      const email = `qa_admin_${randomId()}@test.com`;
      const password = "admin123";

      const created = await DbHelper.createAdminUser(email, password);
      if (!created) {
        throw new Error(`Failed to create admin user ${email} in DB.`);
      }

      const admin: CreatedAdmin = { email, password };
      createdAdmins.push(admin);
      return admin;
    });
  },

  adminUser: async ({ createAdminUser }, use) => {
    const admin = await createAdminUser();
    await use(admin);
  },

  adminApi: async ({ playwright, adminUser }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: {
        "x-test-bypass": "khelovani-test-2026",
      },
    });

    const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
      data: { email: adminUser.email, password: adminUser.password },
    });

    if (loginRes.status() !== 200) {
      await requestContext.dispose();
      throw new Error(
        `Admin login failed in fixture (status: ${loginRes.status()})`,
      );
    }

    const { token } = await loginRes.json();

    const authContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
        "x-test-bypass": "khelovani-test-2026",
      },
    });

    await use(authContext);
    await authContext.dispose();
    await requestContext.dispose();
  },

  api: async ({ request }, use) => {
    await use(request);
  },

  partnerUser: async ({ api }, use) => {
    // Create a partner for security testing
    const email = `qa_sec_partner_${randomId()}@test.com`;
    const password = "partner123";
    await DbHelper.createApprovedPartner(email, password);
    const pDb = await DbHelper.getPartnerByEmail(email);
    const partner = { email, password, id: pDb._id.toString() };
    await use(partner);
    await DbHelper.deletePartnerByEmail(email).catch(() => {});
  },

  partnerApi: async ({ playwright, partnerUser }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: {
        "x-test-bypass": "khelovani-test-2026",
      },
    });
    const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
      data: { email: partnerUser.email, password: partnerUser.password },
    });
    const { token } = await loginRes.json();
    const authContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: { 
        Authorization: `Bearer ${token}`,
        "x-test-bypass": "khelovani-test-2026",
      },
    });
    await use(authContext);
    await authContext.dispose();
    await requestContext.dispose();
  },
});

adminTest.afterEach(async ({ createdAdmins }) => {
  for (const admin of createdAdmins) {
    await DbHelper.deleteAdminUser(admin.email).catch(() => {});
  }
  createdAdmins.length = 0;
});

export const test = adminTest;
