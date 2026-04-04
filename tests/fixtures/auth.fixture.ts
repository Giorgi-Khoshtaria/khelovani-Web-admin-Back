import { test as base, APIRequestContext } from "@playwright/test";
import { DbHelper } from "../helpers/db/db.helper.js";
import { DEFAULT_USER, ENDPOINTS } from "../constants/endpoints.js";
import { randomId } from "../helpers/utils/generators.js";

export type CreatedUser = {
  email: string;
  password: string;
  idNumber: string;
};

export type CreatedPartner = {
  email: string;
  identificationCode: string;
  password?: string;
};

export type CreatedAdmin = {
  email: string;
  password: string;
};

export type UserFixtures = {
  api: APIRequestContext;
  createdUsers: CreatedUser[];
  createdPartners: CreatedPartner[];
  createdAdmins: CreatedAdmin[];
  createVerifiedUser: () => Promise<CreatedUser>;
  registerUnverifiedUser: (
    overrides?: Record<string, any>,
  ) => Promise<CreatedUser>;
  createAdminUser: () => Promise<CreatedAdmin>;
  createPartnerUser: () => Promise<CreatedPartner>;
  adminApi: APIRequestContext;
  partnerApi: APIRequestContext;
};

export const test = base.extend<UserFixtures>({
  api: async ({ request }, use) => {
    await use(request);
  },

  createdUsers: async ({}, use) => {
    const users: CreatedUser[] = [];
    await use(users);
  },

  createdPartners: async ({}, use) => {
    const partners: CreatedPartner[] = [];
    await use(partners);
  },

  createdAdmins: async ({}, use) => {
    const admins: CreatedAdmin[] = [];
    await use(admins);
  },

  createVerifiedUser: async ({ api, createdUsers }, use) => {
    await use(async () => {
      const email = `qa_verified_${randomId()}@test.com`;
      const idNumber = randomId();
      const password = DEFAULT_USER.password;

      // 1. Register
      const regRes = await api.post(ENDPOINTS.REGISTER, {
        data: { ...DEFAULT_USER, email, idNumber },
      });
      if (regRes.status() !== 201) {
        throw new Error(
          `Registration failed in fixture (status: ${regRes.status()})`,
        );
      }

      // 2. Directly verify in DB (much more reliable and faster than Mail.tm)
      const verified = await DbHelper.verifyUserByEmail(email);
      if (!verified) {
        throw new Error(`Failed to verify user ${email} in DB.`);
      }

      const user: CreatedUser = { email, password, idNumber };
      createdUsers.push(user);
      return user;
    });
  },

  registerUnverifiedUser: async ({ api, createdUsers }, use) => {
    await use(async (overrides = {}) => {
      const email = `qa_unverified_${randomId()}@test.com`;
      const idNumber = randomId();
      const password = DEFAULT_USER.password;

      const payload = { ...DEFAULT_USER, email, idNumber, ...overrides };
      const res = await api.post(ENDPOINTS.REGISTER, { data: payload });

      if (res.status() !== 201) {
        throw new Error(
          `Unverified registration failed (status: ${res.status()})`,
        );
      }

      const user: CreatedUser = {
        email,
        password,
        idNumber,
      };
      createdUsers.push(user);
      return user;
    });
  },

  createAdminUser: async ({ createdAdmins }, use) => {
    await use(async () => {
      const email = `qa_admin_${randomId()}@test.com`;
      const password = "admin123";

      // Create admin directly in DB
      const created = await DbHelper.createAdminUser(email, password);
      if (!created) {
        throw new Error(`Failed to create admin user ${email} in DB.`);
      }

      const admin: CreatedAdmin = { email, password };
      createdAdmins.push(admin);
      return admin;
    });
  },

  adminApi: async ({ playwright, createAdminUser }, use) => {
    const admin = await createAdminUser();
    const requestContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
    });

    // 1. Login to get token
    const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
      data: { email: admin.email, password: admin.password },
    });

    if (loginRes.status() !== 200) {
      throw new Error(
        `Admin login failed in fixture (status: ${loginRes.status()})`,
      );
    }

    const { token } = await loginRes.json();

    // 2. Create new context with Authorization header
    const authContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(authContext);
    await authContext.dispose();
    await requestContext.dispose();
  },

  createPartnerUser: async ({ createdPartners }, use) => {
    await use(async () => {
      const email = `qa_partner_${randomId()}@test.com`;
      const password = "partner123";

      const created = await DbHelper.createApprovedPartner(email, password);
      if (!created) {
        throw new Error(`Failed to create partner user ${email} in DB.`);
      }

      const partner = { email, password, identificationCode: "N/A" };
      createdPartners.push(partner);
      return partner;
    });
  },

  partnerApi: async ({ playwright, createPartnerUser }, use) => {
    const partner = await createPartnerUser();
    const requestContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
    });

    // Login using the common admin/partner login endpoint
    const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
      data: { email: partner.email, password: partner.password },
    });

    if (loginRes.status() !== 200) {
      throw new Error(
        `Partner login failed in fixture (status: ${loginRes.status()})`,
      );
    }

    const { token } = await loginRes.json();

    const authContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    await use(authContext);
    await authContext.dispose();
    await requestContext.dispose();
  },
});

export { expect } from "@playwright/test";

// Automatic cleanup
test.afterEach(
  async ({ api, createdUsers, createdPartners, createdAdmins }) => {
    // Clean up users
    for (const u of createdUsers) {
      await api.delete(ENDPOINTS.DELETE, { data: u }).catch(() => {});
    }
    createdUsers.length = 0;

    // Clean up partners
    for (const p of createdPartners) {
      await DbHelper.deletePartnerByEmail(p.email).catch(() => {});
    }
    createdPartners.length = 0;

    // Clean up admins
    for (const a of createdAdmins) {
      await DbHelper.deleteAdminUser(a.email).catch(() => {});
    }
    createdAdmins.length = 0;
  },
);
