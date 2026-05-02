import { DbHelper } from "../db/db.helper.js";
import { randomId } from "../utils/generators.js";

export const uniqueEmail = () => `qa_user_${randomId()}@test.com`;

export async function createEndUser(
  overrides: { email?: string; password?: string } = {},
) {
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "TestPass123!";
  const id = await DbHelper.createEndUser(email, password);
  return { id, email, password };
}

export async function deleteEndUser(id: string, email: string) {
  await DbHelper.deleteEndUserByEmail(email).catch(() => {});
}
