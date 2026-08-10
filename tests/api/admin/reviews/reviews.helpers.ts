import type { APIRequestContext, PlaywrightWorkerArgs } from "@playwright/test";
import { DbHelper } from "../../../helpers/db/db.helper.js";
import {
  DEFAULT_REVIEW,
  DEFAULT_USER,
  ENDPOINTS,
  partnerReviewsUrl,
} from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

type Playwright = PlaywrightWorkerArgs["playwright"];

const BASE = "http://localhost:3001";
const TEST_HEADERS = { "x-test-bypass": "khelovani-test-2026" };

export interface SeededPartner {
  id: string;
  email: string;
  password: string;
}

export interface Reviewer {
  id: string;
  email: string;
  /** Own request context — end-user auth is a cookie, so it must not be shared. */
  api: APIRequestContext;
}

/** A context with no identity at all — for the public/anonymous assertions. */
export async function anonContext(
  playwright: Playwright,
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: TEST_HEADERS,
  });
}

/** Create an extra approved partner (the fixtures only give you one). */
export async function createApprovedPartner(
  partnerType: "organization" | "individual" = "organization",
): Promise<SeededPartner> {
  const email = `qa_rv_partner_${randomId()}@test.com`;
  const password = "partner123";
  await DbHelper.createApprovedPartner(email, password);
  const db = await DbHelper.getPartnerByEmail(email);
  const id = db._id.toString();
  if (partnerType !== "organization") {
    await DbHelper.setPartnerFields(id, { partnerType });
  }
  return { id, email, password };
}

export async function deletePartner(partner: { email: string; id: string }) {
  await DbHelper.deleteReviewsByPartnerIds([partner.id]).catch(() => {});
  await DbHelper.deletePartnerByEmail(partner.email).catch(() => {});
}

/** Log a partner in through the admin login endpoint and return a bearer ctx. */
export async function loginPartnerContext(
  playwright: Playwright,
  partner: SeededPartner,
): Promise<APIRequestContext> {
  const anon = await anonContext(playwright);
  const res = await anon.post(ENDPOINTS.ADMIN_LOGIN, {
    data: { email: partner.email, password: partner.password },
  });
  const body = await res.json();
  const token = body.data?.token ?? body.token;
  await anon.dispose();

  return playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: { ...TEST_HEADERS, Authorization: `Bearer ${token}` },
  });
}

/**
 * Create a verified end user straight in the DB and log them in on a context
 * of their own.
 *
 * Two deliberate choices:
 *  - not `createAuthedUser` from the shared helper: that goes through
 *    POST /api/user/register, which sends a verification email and so fails
 *    whenever the mail provider rejects the runner's IP. Reviews don't
 *    exercise registration.
 *  - one context per reviewer: end-user login returns no bearer token, it sets
 *    an httpOnly `access-token` cookie. Sharing a context between reviewers
 *    would make the last login win and silently attribute every review to the
 *    same person.
 */
export async function createReviewer(
  playwright: Playwright,
): Promise<Reviewer> {
  const idNumber = randomId();
  const email = `qa_reviewer_${idNumber}@test.com`;
  const password = DEFAULT_USER.password;

  const id = await DbHelper.createEndUser(email, password, idNumber);

  const api = await playwright.request.newContext({
    baseURL: BASE,
    extraHTTPHeaders: TEST_HEADERS,
  });

  const loginRes = await api.post(ENDPOINTS.LOGIN, {
    data: { email, password },
  });
  if (loginRes.status() !== 200) {
    throw new Error(`createReviewer: login failed (${loginRes.status()})`);
  }

  return { id, email, api };
}

export async function deleteReviewer(reviewer: Reviewer): Promise<void> {
  await reviewer.api.dispose().catch(() => {});
  await DbHelper.deleteEndUserByEmail(reviewer.email).catch(() => {});
}

/** Leave a review as the given end user; returns the raw response. */
export async function leaveReview(
  reviewer: Reviewer,
  partnerId: string,
  overrides: Partial<{ rating: number; comment: string }> = {},
) {
  return reviewer.api.post(partnerReviewsUrl(partnerId), {
    data: { ...DEFAULT_REVIEW, ...overrides },
  });
}
