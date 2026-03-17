import { Types } from "mongoose";

export interface UserTypes {
  idNumber: string;
  nameGe?: string;
  nameEn: string;
  dateOfBirth: Date;
  city: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
}

export interface PopulatedRole {
  _id: Types.ObjectId;
  name: string;
  permissions: string[];
  allowedPanels: string[];
  description: string;
  isActive: boolean;
}
