// Centralised Cloudinary folder layout for the Media Manager.
//
// New layout: every organisation owns a single folder that holds *all* of its
// media (organisation images + product images), e.g.
//   khelovani/organizations/<orgId>
//
// `users` stays as-is for profile photos.

export const CLOUDINARY_ROOT = "khelovani";

/** Sub-path (without the khelovani/ root) for an organisation's media folder. */
export const orgFolderRelative = (orgId: string): string =>
  `organizations/${orgId}`;

/** Absolute Cloudinary folder for an organisation's media. */
export const orgFolderAbsolute = (orgId: string): string =>
  `${CLOUDINARY_ROOT}/${orgFolderRelative(orgId)}`;

/** True when a relative folder string is a valid organisation media folder. */
export const isOrgFolder = (relativeFolder: string): boolean =>
  /^organizations\/[a-fA-F0-9]{24}$/.test(relativeFolder);

/** Extract the orgId from an absolute folder/public_id, or null. */
export const orgIdFromPath = (path: string): string | null => {
  const match = path.match(/organizations\/([a-fA-F0-9]{24})/);
  return match ? match[1]! : null;
};
