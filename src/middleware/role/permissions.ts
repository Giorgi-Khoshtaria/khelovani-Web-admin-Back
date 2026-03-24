export const PERMISSIONS = {
  USERS: {
    READ: "users:read",
    CREATE: "users:create",
    EDIT: "users:edit",
    SUSPEND: "users:suspend",
    DELETE: "users:delete",
  },
  ORGS: {
    MANAGE: "organisations:manage",
    READ: "organisations:read",
    CREATE: "organisations:create",
    EDIT: "organisations:edit",
    VERIFY: "organisations:verify",
    REJECT: "organisations:reject",
    SUSPEND: "organisations:suspend",
    DELETE: "organisations:delete",
  },
  ROLES: {
    READ: "roles:read",
    CREATE: "roles:create",
    EDIT: "roles:edit",
    DELETE: "roles:delete",
  },
  SETTINGS: {
    READ: "settings:read",
    EDIT: "settings:edit",
  },
  TRANSLATIONS: {
    READ: "translations:read",
    EDIT: "translations:edit",
    DELETE: "translations:delete",
  },
  REPORTS: {
    VIEW: "reports:view",
  },
} as const;

export const PANELS = {
  WEB: "admin-organization",
  ADMIN: "admin",
} as const;

// Role names — use these instead of hardcoded strings
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  ORGANISATION: "organisation",
} as const;
