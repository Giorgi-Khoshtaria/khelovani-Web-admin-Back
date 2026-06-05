import type { Request } from "express";
import type { Granularity, StatisticsParams } from "./statisticsService.js";

const GRANULARITIES: Granularity[] = ["week", "month", "year"];

/**
 * Parse + sanitise the shared statistics query string
 * (`granularity`, `dateFrom`, `dateTo`, `topLimit`) into StatisticsParams.
 * The caller is responsible for setting `partnerId` (admin filter vs. the
 * authenticated partner).
 */
export const parseStatisticsQuery = (req: Request): StatisticsParams => {
  const { granularity, dateFrom, dateTo, topLimit } = req.query;

  const params: StatisticsParams = {};

  if (
    typeof granularity === "string" &&
    (GRANULARITIES as string[]).includes(granularity)
  ) {
    params.granularity = granularity as Granularity;
  }

  if (typeof dateFrom === "string" && dateFrom) {
    const d = new Date(dateFrom);
    if (!Number.isNaN(d.getTime())) params.dateFrom = d;
  }

  if (typeof dateTo === "string" && dateTo) {
    const d = new Date(dateTo);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      params.dateTo = d;
    }
  }

  if (typeof topLimit === "string") {
    const n = parseInt(topLimit, 10);
    if (!Number.isNaN(n)) params.topLimit = Math.min(Math.max(n, 1), 50);
  }

  return params;
};
