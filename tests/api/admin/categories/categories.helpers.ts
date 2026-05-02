import { ENDPOINTS } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";

export const VALID_CATEGORY = {
  slug: "",      // always overridden per-test
  nameGe: "სამკაული",
  nameEn: "Jewelry",
};

export const uniqueSlug = (prefix = "qa") =>
  `${prefix}_${randomId()}`.toLowerCase();

const GE_CHARS = "ტესიაბგდვზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ";
const EN_CHARS = "abcdefghijklmnopqrstuvwxyz";

const randomLetters = (chars: string, len: number) =>
  Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

export const uniqueNameGe = () => randomLetters(GE_CHARS, 8);
export const uniqueNameEn = () => {
  const first = EN_CHARS[Math.floor(Math.random() * EN_CHARS.length)].toUpperCase();
  return first + randomLetters(EN_CHARS, 7);
};

export async function createCategory(
  adminApi: any,
  overrides: Record<string, any> = {},
): Promise<{ id: string; slug: string }> {
  const slug = overrides.slug ?? uniqueSlug();
  const res = await adminApi.post(ENDPOINTS.ADMIN_CATEGORIES, {
    data: {
      ...VALID_CATEGORY,
      slug,
      nameGe: overrides.nameGe ?? uniqueNameGe(),
      nameEn: overrides.nameEn ?? uniqueNameEn(),
      ...overrides,
    },
  });

  if (res.status() !== 201) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      `createCategory failed (${res.status()}): ${JSON.stringify(body)}`,
    );
  }

  const body = await res.json();
  const id = body.data?._id ?? body._id;
  if (!id) {
    throw new Error(`createCategory: no id in response: ${JSON.stringify(body)}`);
  }
  return { id, slug };
}

export async function deleteCategory(adminApi: any, id: string): Promise<void> {
  await adminApi.delete(`${ENDPOINTS.ADMIN_CATEGORIES}/${id}`).catch(() => {});
}
