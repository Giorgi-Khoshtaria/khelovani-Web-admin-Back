/**
 * Convert stringified arrays and booleans from FormData
 */
export const customParse = (val: any) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val === "true" ? true : val === "false" ? false : val;
    }
  }
  return val;
};
