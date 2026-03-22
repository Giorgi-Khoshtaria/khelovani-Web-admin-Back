export type PartnerStatus = "pending" | "approved" | "rejected";

export const PartnerStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PartnerStatusEnum =
  (typeof PartnerStatusEnum)[keyof typeof PartnerStatusEnum];
``;
