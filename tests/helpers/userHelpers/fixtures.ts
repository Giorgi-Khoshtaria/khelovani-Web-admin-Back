import { test as base, APIRequestContext } from "@playwright/test";
import { DbHelper } from "./db.helper.js";
import { DEFAULT_USER, ENDPOINTS } from "./constants.js";
import { randomId } from "./generators.js";

export type CreatedUser = {
  email: string;
  password: string;
  idNumber: string;
};

export type CreatedPartner = {
  email: string;
  identificationCode: string;
};

type UserFixtures = {
  api: APIRequestContext;
  createdUsers: CreatedUser[];
  createdPartners: CreatedPartner[];
  createVerifiedUser: () => Promise<CreatedUser>;
  registerUnverifiedUser: (
    overrides?: Record<string, any>,
  ) => Promise<CreatedUser>;
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
});

export { expect } from "@playwright/test";

// Automatic cleanup
test.afterEach(async ({ api, createdUsers }) => {
  for (const u of createdUsers) {
    // Attempt deletion
    await api.delete(ENDPOINTS.DELETE, { data: u }).catch(() => {});
  }
  createdUsers.length = 0;
});
