import mongoose from "mongoose";
import { ROLES } from "../../../middleware/role/permissions.js";

export const SYSTEM_ROLES: string[] = [ROLES.ADMIN];

/**
 * Validates ObjectIds in an array
 */
export const areValidObjectIds = (ids: any[]): boolean => {
  if (!Array.isArray(ids)) return false;
  return ids.every((id) => mongoose.Types.ObjectId.isValid(id));
};
