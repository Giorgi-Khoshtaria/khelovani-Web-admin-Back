export type PartnerStatus = "pending" | "approved" | "rejected" | "banned";

export const PartnerStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  BANNED: "banned",
} as const;

export type PartnerStatusEnum =
  (typeof PartnerStatusEnum)[keyof typeof PartnerStatusEnum];
