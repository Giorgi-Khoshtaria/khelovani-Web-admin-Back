export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED" | "BANNED";

export const PartnerStatusEnum = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  BANNED: "BANNED",
} as const;

export type PartnerStatusEnum =
  (typeof PartnerStatusEnum)[keyof typeof PartnerStatusEnum];
