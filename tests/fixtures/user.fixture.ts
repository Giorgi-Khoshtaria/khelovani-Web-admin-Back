import { test as base, APIRequestContext, expect } from "@playwright/test";
import { DbHelper } from "../helpers/db/db.helper.js";
import { DEFAULT_USER, ENDPOINTS } from "../constants/endpoints.js";
import { randomId } from "../helpers/utils/generators.js";

export interface CreatedUser {
  email: string;
  password: string;
  idNumber: string;
}

export interface UserFixtures {
  createdUsers: CreatedUser[];
  createVerifiedUser: () => Promise<CreatedUser>;
  registerUnverifiedUser: (
    overrides?: Record<string, any>,
  ) => Promise<CreatedUser>;
  api: APIRequestContext;
}

export const userTest = base.extend<UserFixtures>({
  createdUsers: async ({}, use) => {
    const users: CreatedUser[] = [];
    await use(users);
  },

  createVerifiedUser: async ({ request, createdUsers }, use) => {
    await use(async () => {
      const email = `qa_verified_${randomId()}@test.com`;
      const idNumber = randomId();
      const password = DEFAULT_USER.password;

      const regRes = await request.post(ENDPOINTS.REGISTER, {
        data: { ...DEFAULT_USER, email, idNumber },
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });
      if (regRes.status() !== 201) {
        throw new Error(
          `Registration failed in fixture (status: ${regRes.status()})`,
        );
      }

      const verified = await DbHelper.verifyUserByEmail(email);
      if (!verified) {
        throw new Error(`Failed to verify user ${email} in DB.`);
      }

      const user: CreatedUser = { email, password, idNumber };
      createdUsers.push(user);
      return user;
    });
  },

  registerUnverifiedUser: async ({ request, createdUsers }, use) => {
    await use(async (overrides = {}) => {
      const email = `qa_unverified_${randomId()}@test.com`;
      const idNumber = randomId();
      const password = DEFAULT_USER.password;

      const payload = { ...DEFAULT_USER, email, idNumber, ...overrides };
      const res = await request.post(ENDPOINTS.REGISTER, {
        data: payload,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      });

      if (res.status() !== 201) {
        throw new Error(
          `Unverified registration failed (status: ${res.status()})`,
        );
      }

      const user: CreatedUser = { email, password, idNumber };
      createdUsers.push(user);
      return user;
    });
  },

  api: async ({ request }, use) => {
    await use(request);
  },
});

userTest.afterEach(async ({ request, createdUsers }) => {
  for (const u of createdUsers) {
    await request
      .delete(ENDPOINTS.DELETE, {
        data: u,
        headers: { "x-test-bypass": "khelovani-test-2026" },
      })
      .catch(() => {});
  }
  createdUsers.length = 0;
});

export const test = userTest;
