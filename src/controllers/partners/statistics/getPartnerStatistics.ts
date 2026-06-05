import { asyncHandler } from "../../../utils/asyncHandler.js";
import { sendResponse } from "../../../utils/apiResponse.js";
import { AppError } from "../../../utils/errors/AppError.js";
import { getStatistics } from "../../../utils/statistics/statisticsService.js";
import { parseStatisticsQuery } from "../../../utils/statistics/parseStatisticsQuery.js";

/**
 * @desc    Statistics for the authenticated partner only.
 * @route   GET /api/partner/statistics
 * @access  Private — partner (organization.analytics.view)
 */
export const getPartnerStatistics = asyncHandler(async (req, res) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const params = parseStatisticsQuery(req);
  params.partnerId = req.user.id; // always locked to own org

  const stats = await getStatistics(params);
  sendResponse(res, 200, "Statistics retrieved successfully", stats);
});
