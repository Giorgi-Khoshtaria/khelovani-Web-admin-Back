import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { getStatistics } from "../../../utils/statistics/statisticsService.js";
import { parseStatisticsQuery } from "../../../utils/statistics/parseStatisticsQuery.js";

const HEX24 = /^[a-fA-F0-9]{24}$/;

/**
 * @desc    Platform-wide statistics, or scoped to one partner via ?partner=<id>.
 * @route   GET /api/admin/statistics
 * @access  Private — admin (statistics.view)
 */
export const getAdminStatistics = asyncHandler(async (req, res) => {
  const params = parseStatisticsQuery(req);

  const partner = req.query.partner;
  if (typeof partner === "string" && HEX24.test(partner)) {
    params.partnerId = partner;
  }

  const stats = await getStatistics(params);
  sendResponse(res, 200, "Statistics retrieved successfully", stats);
});
