export type PartnerStatus = "PENDING" | "APPROVED" | "BANNED";

export const PartnerStatusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  BANNED: "BANNED",
} as const;

export type PartnerStatusEnum =
  (typeof PartnerStatusEnum)[keyof typeof PartnerStatusEnum];
