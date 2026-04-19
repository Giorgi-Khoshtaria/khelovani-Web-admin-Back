import { test as base, APIRequestContext, expect } from "@playwright/test";
import { DbHelper } from "../helpers/db/db.helper.js";
import { ENDPOINTS } from "../constants/endpoints.js";
import { randomId } from "../helpers/utils/generators.js";

export interface CreatedPartner {
  email: string;
  identificationCode: string;
  password?: string;
  id?: string;
}

export interface PartnerFixtures {
  createdPartners: CreatedPartner[];
  createPartnerUser: () => Promise<CreatedPartner>;
  partnerApi: APIRequestContext;
  partnerUser: CreatedPartner;
  api: APIRequestContext;
}

export const partnerTest = base.extend<PartnerFixtures>({
  createdPartners: async ({}, use) => {
    const partners: CreatedPartner[] = [];
    await use(partners);
  },

  createPartnerUser: async ({ createdPartners }, use) => {
    await use(async () => {
      const email = `qa_partner_${randomId()}@test.com`;
      const password = "partner123";

      const created = await DbHelper.createApprovedPartner(email, password);
      if (!created) {
        throw new Error(`Failed to create partner user ${email} in DB.`);
      }

      const partnerDb = await DbHelper.getPartnerByEmail(email);
      const partner = {
        email,
        password,
        identificationCode: "N/A",
        id: partnerDb._id.toString(),
      };
      createdPartners.push(partner);
      return partner;
    });
  },

  partnerApi: async ({ playwright, partnerUser }, use) => {
    const partner = partnerUser;
    const requestContext = await playwright.request.newContext({
      baseURL: "http://localhost:3001",
    });

    const loginRes = await requestContext.post(ENDPOINTS.ADMIN_LOGIN, {
      data: { email: partner.email, password: partner.password },
    });

    if (loginRes.status() !== 200) {
      throw new Error(
        `Partner login failed in fixture (status: ${loginRes.status()})`,
      );
    }

    const loginBody = await loginRes.json();
    const token = loginBody.data?.token ?? loginBody.token;

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

  partnerUser: async ({ createPartnerUser }, use) => {
    const partner = await createPartnerUser();
    await use(partner);
  },

  api: async ({ request }, use) => {
    await use(request);
  },
});

export const test = partnerTest;

partnerTest.afterEach(async ({ createdPartners }) => {
  for (const p of createdPartners) {
    await DbHelper.deletePartnerByEmail(p.email).catch(() => {});
  }
  createdPartners.length = 0;
});
