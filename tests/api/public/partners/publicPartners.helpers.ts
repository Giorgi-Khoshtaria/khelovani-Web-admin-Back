import { APIRequestContext } from "@playwright/test";
import { ENDPOINTS, DEFAULT_PARTNER } from "../../../constants/endpoints.js";
import { randomId } from "../../../helpers/utils/generators.js";
import { PartnerStatusEnum } from "../../../../src/types/partnerStatus.js";

export const setupTestPartners = async (
  api: APIRequestContext,
  adminApi: APIRequestContext,
) => {
  // Create Approved Partner
  const approvedEmail = `qa_approved_${randomId()}@test.com`;
  const approvedIdCode = randomId().slice(0, 9);

  const reg1 = await api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: {
      ...DEFAULT_PARTNER,
      email: approvedEmail,
      identificationCode: approvedIdCode,
    },
  });

  const regBody1 = await reg1.json();
  const approvedPartnerId =
    regBody1.partner?._id || regBody1._id || regBody1.data?._id;

  // Approve via Admin
  await adminApi.patch(
    `${ENDPOINTS.ADMIN_PARTNERS}/${approvedPartnerId}/status`,
    { data: { status: PartnerStatusEnum.APPROVED } },
  );

  // Create Pending Partner
  const pendingEmail = `qa_pending_${randomId()}@test.com`;
  const pendingIdCode = randomId().slice(0, 9);

  const reg2 = await api.post(ENDPOINTS.PARTNER_REGISTER, {
    data: {
      ...DEFAULT_PARTNER,
      email: pendingEmail,
      identificationCode: pendingIdCode,
    },
  });

  const regBody2 = await reg2.json();
  const pendingPartnerId =
    regBody2.partner?._id || regBody2._id || regBody2.data?._id;

  return {
    approvedPartnerId,
    approvedPartnerEmail: approvedEmail,
    pendingPartnerId,
  };
};

export const cleanupTestPartners = async (
  adminApi: APIRequestContext,
  approvedPartnerId: string,
  pendingPartnerId: string,
) => {
  if (approvedPartnerId) {
    await adminApi
      .delete(`${ENDPOINTS.ADMIN_PARTNERS}/${approvedPartnerId}`)
      .catch(() => {});
  }
  if (pendingPartnerId) {
    await adminApi
      .delete(`${ENDPOINTS.ADMIN_PARTNERS}/${pendingPartnerId}`)
      .catch(() => {});
  }
};
