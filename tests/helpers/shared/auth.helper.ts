import type { APIRequestContext } from "@playwright/test";
import { DbHelper } from "../db/db.helper.js";
import { DEFAULT_USER, ENDPOINTS } from "../../constants/endpoints.js";
import { randomId } from "../utils/generators.js";

export interface AuthedUser {
  id: string;
  email: string;
  password: string;
  idNumber: string;
  token: string;
  authHeaders: { Authorization: string };
}

/**
 * Register a fresh user, verify them in the DB, log in, and return a
 * ready-to-use bearer token + Authorization header.
 */
export async function createAuthedUser(
  request: APIRequestContext,
): Promise<AuthedUser> {
  const email = `qa_authed_${randomId()}@test.com`;
  const idNumber = randomId();
  const password = DEFAULT_USER.password;

  const regRes = await request.post(ENDPOINTS.REGISTER, {
    data: { ...DEFAULT_USER, email, idNumber },
  });
  if (regRes.status() !== 201) {
    throw new Error(
      `createAuthedUser: registration failed (${regRes.status()})`,
    );
  }

  const verified = await DbHelper.verifyUserByEmail(email);
  if (!verified) throw new Error(`createAuthedUser: could not verify ${email}`);

  const loginRes = await request.post(ENDPOINTS.LOGIN, {
    data: { email, password },
  });
  if (loginRes.status() !== 200) {
    throw new Error(`createAuthedUser: login failed (${loginRes.status()})`);
  }
  const body = await loginRes.json();
  const token: string = body.data?.token ?? body.token;

  const dbUser = await DbHelper.getEndUserByEmail(email);
  if (!dbUser) throw new Error(`createAuthedUser: user ${email} not in DB`);

  return {
    id: dbUser._id.toString(),
    email,
    password,
    idNumber,
    token,
    authHeaders: { Authorization: `Bearer ${token}` },
  };
}

/** Delete a user created via createAuthedUser directly from the DB. */
export async function deleteAuthedUser(user: { email: string }): Promise<void> {
  await DbHelper.deleteEndUserByEmail(user.email).catch(() => {});
}
