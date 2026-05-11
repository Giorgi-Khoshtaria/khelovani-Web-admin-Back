export const PartnerTypeEnum = {
  ORGANIZATION: "organization",
  INDIVIDUAL: "individual",
} as const;

export type PartnerType = (typeof PartnerTypeEnum)[keyof typeof PartnerTypeEnum];

export interface PartnerRegisterData {
  partnerType: PartnerType;
  companyNameGe: string;
  companyNameEn: string;
  identificationCode?: string;
  personalNumber?: string;
  contactPerson?: string;
  phone: string;
  city: string;
  email: string;
  address: string;
  addressEn: string;
  description?: string;
  descriptionEn?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  terms: boolean;
}
