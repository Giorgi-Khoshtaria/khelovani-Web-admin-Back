import { Types } from "mongoose";

export interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}
