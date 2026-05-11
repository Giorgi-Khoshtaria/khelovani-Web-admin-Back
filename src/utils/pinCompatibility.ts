import type { PinSection } from "../types/productPin.js";
import type { IProduct } from "../modules/product.modules.js";

// A product can only be pinned to the section that matches its own condition.
export function isPinSectionCompatible(
  pinSection: PinSection,
  product: Pick<IProduct, "condition">,
): boolean {
  return product.condition === pinSection;
}
