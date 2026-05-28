import type { Request } from "express";
import { ROLES } from "../../middleware/role/permissions.js";
import {
  orgIdFromPath,
  orgFolderAbsolute,
} from "../../utils/config/mediaFolders.js";
import { AppError } from "../../utils/errors/AppError.js";

/** A single media item returned to the client. */
export interface MediaItem {
  publicId: string;
  url: string;
  name: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  orgId: string | null;
  createdAt: string;
}

/** Normalise a raw Cloudinary search/upload resource into a MediaItem. */
export const toMediaItem = (r: any): MediaItem => {
  const publicId: string = r.public_id;
  const name = publicId.split("/").pop() || publicId;
  return {
    publicId,
    url: r.secure_url || r.url,
    name,
    format: r.format || "",
    bytes: r.bytes || 0,
    width: r.width || 0,
    height: r.height || 0,
    folder: r.folder || r.asset_folder || "",
    orgId: orgIdFromPath(publicId),
    createdAt: r.created_at || new Date().toISOString(),
  };
};

const HEX24 = /^[a-fA-F0-9]{24}$/;

/**
 * Resolve which organisation a request is scoped to.
 * - Admins may target any org (via `orgId`), or null for "all orgs".
 * - Organisation users are always locked to their own org.
 */
export const resolveOrgScope = (
  req: Request,
  requestedOrgId?: string,
): { orgId: string | null } => {
  const role = req.user?.role;

  if (role === ROLES.ADMIN) {
    if (requestedOrgId) {
      if (!HEX24.test(requestedOrgId)) {
        throw new AppError("არასწორი ორგანიზაციის ID", 400);
      }
      return { orgId: requestedOrgId };
    }
    return { orgId: null };
  }

  // Organisation users — locked to their own folder.
  const ownId = req.user?.id;
  if (!ownId || !HEX24.test(ownId)) {
    throw new AppError("წვდომა აკრძალულია", 403);
  }
  return { orgId: ownId };
};

/**
 * Ensure the caller is allowed to mutate (delete/rename) the given asset.
 * Admins may touch anything; org users only assets inside their own folder.
 */
export const assertCanMutate = (req: Request, publicId: string): void => {
  if (req.user?.role === ROLES.ADMIN) return;

  const ownerOrgId = orgIdFromPath(publicId);
  if (!ownerOrgId || ownerOrgId !== req.user?.id) {
    throw new AppError("ამ ფაილის მართვის უფლება არ გაქვთ", 403);
  }
};

/**
 * Build a Cloudinary search expression from the resolved scope + filters.
 *
 * Note: substring search (`filename`) is NOT pushed into the expression —
 * Cloudinary's search index doesn't support leading wildcards
 * (`filename:*term*` errors out), so true "contains" matching is impossible
 * server-side. The controller post-filters fetched pages instead — see
 * `matchesSearchTerm` below.
 */
export const buildSearchExpression = (opts: {
  orgId: string | null;
  dateFrom?: string;
  dateTo?: string;
}): string => {
  const parts: string[] = ["resource_type:image"];

  if (opts.orgId) {
    parts.push(`folder="${orgFolderAbsolute(opts.orgId)}"`);
  } else {
    // Admin "all orgs" view — everything under khelovani except user avatars.
    parts.push(`folder:khelovani/* AND -folder="khelovani/users"`);
  }

  if (opts.dateFrom || opts.dateTo) {
    const from = opts.dateFrom ? `${opts.dateFrom}` : "*";
    const to = opts.dateTo ? `${opts.dateTo}` : "*";
    parts.push(`created_at:[${from} TO ${to}]`);
  }

  return parts.join(" AND ");
};

/** Case-insensitive substring match used to post-filter search results. */
export const matchesSearchTerm = (
  item: MediaItem,
  rawTerm: string | undefined,
): boolean => {
  if (!rawTerm) return true;
  const needle = rawTerm.trim().toLowerCase();
  if (!needle) return true;
  return (
    item.name.toLowerCase().includes(needle) ||
    item.publicId.toLowerCase().includes(needle)
  );
};
