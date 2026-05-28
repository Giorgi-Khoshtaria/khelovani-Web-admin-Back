import type { Request, Response, NextFunction } from "express";
import { ROLES } from "../role/permissions.js";
import { orgFolderRelative } from "../../utils/config/mediaFolders.js";

const HEX24 = /^[a-fA-F0-9]{24}$/;

/**
 * Resolve the destination organisation folder for an upload and stash it on
 * `req.cloudinaryFolder` so multer-storage-cloudinary picks it up.
 *
 * Must run BEFORE multer so the value is set when the storage engine resolves
 * the folder. The orgId is read from the query string (reliable pre-multer).
 *  - Admins  : ?orgId=<id> is required.
 *  - Org users: always locked to their own org, query is ignored.
 */
export const setMediaFolder = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let orgId: string | undefined;

  if (req.user?.role === ROLES.ADMIN) {
    orgId = (req.query.orgId as string) || undefined;
    if (!orgId) {
      res.status(422).json({ message: "orgId სავალდებულოა ატვირთვისთვის" });
      return;
    }
  } else {
    orgId = req.user?.id;
  }

  if (!orgId || !HEX24.test(orgId)) {
    res.status(400).json({ message: "არასწორი ორგანიზაციის ID" });
    return;
  }

  (req as any).cloudinaryFolder = orgFolderRelative(orgId);
  next();
};
