import { DbHelper } from "../../../helpers/db/db.helper.js";
import { randomId } from "../../../helpers/utils/generators.js";

/** A non-existent but well-formed Mongo ObjectId. */
export const FAKE_ID = "64b2f0000000000000000000";

/** Seed a request log with a unique, searchable URL; returns { id, url }. */
export async function seedLog(
  overrides: Record<string, unknown> = {},
): Promise<{ id: string; url: string }> {
  const url = `/api/qa-log-${randomId()}`;
  const id = await DbHelper.insertRequestLog({ url, ...overrides });
  return { id, url };
}
