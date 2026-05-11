import { ProductCondition, PRODUCT_CONDITIONS } from "./productCondition.enum.js";

export type PinSection = ProductCondition;

export { ProductCondition as PinSectionEnum };

export const PIN_SECTIONS = PRODUCT_CONDITIONS as PinSection[];

export const PIN_CAP_PER_SECTION = 4;
