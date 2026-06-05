import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/apiResponse.js";
import cloudinary from "../../utils/config/cloudinary.js";
import {
  buildSearchExpression,
  matchesSearchTerm,
  resolveOrgScope,
  toMediaItem,
  type MediaItem,
} from "./mediaHelpers.js";

const MAX_LIMIT = 60;
// When a search term is active we over-fetch from Cloudinary so the
// post-filter has enough candidates to fill the requested page.
const SEARCH_FETCH_SIZE = 200;

/**
 * @desc    List media assets (cursor-paginated, filterable).
 * @route   GET /api/admin/media
 * @access  Admin (all orgs) / Organisation (own folder only)
 *
 * The Cloudinary search index does not support leading wildcards
 * (`filename:*term*` errors), so substring search is done here in JS:
 * we fetch a page (over-fetching if a search term is set) and filter
 * locally before returning.
 */
export const listMedia = asyncHandler(async (req, res) => {
  const { orgId: requestedOrgId, folder: rawFolder, search, dateFrom, dateTo, cursor } =
    req.query as Record<string, string | undefined>;

  const { orgId } = resolveOrgScope(req, requestedOrgId);

  // Top-level folder filter (e.g. "general"). Only honoured for admins viewing
  // across orgs; org users stay locked to their own folder. Sanitised to a safe
  // folder-name charset to keep it out of the search expression unescaped.
  const folder =
    !orgId && rawFolder && /^[a-z0-9_-]+$/i.test(rawFolder)
      ? rawFolder
      : null;

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(req.query.limit) || 30),
  );

  const expression = buildSearchExpression({ orgId, folder, dateFrom, dateTo });
  const fetchSize = search?.trim() ? SEARCH_FETCH_SIZE : limit;

  let searchQuery = cloudinary.search
    .expression(expression)
    .sort_by("created_at", "desc")
    .max_results(fetchSize);

  if (cursor) {
    searchQuery = searchQuery.next_cursor(cursor);
  }

  const result = await searchQuery.execute();

  const allItems: MediaItem[] = (result.resources || []).map(toMediaItem);
  const filtered = allItems.filter((it: MediaItem) =>
    matchesSearchTerm(it, search),
  );
  const pageItems = filtered.slice(0, limit);

  // When searching, totalCount is the Cloudinary unfiltered total for the
  // folder/date scope — an upper bound only. The client uses it just for
  // a rough page indicator.
  sendResponse(res, 200, "მედია წარმატებით ჩაიტვირთა", {
    items: pageItems,
    nextCursor: result.next_cursor || null,
    totalCount: result.total_count || 0,
  });
});
