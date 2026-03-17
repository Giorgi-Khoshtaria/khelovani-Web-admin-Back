export const PERMISSIONS = {
  USERS: {
    READ: "users:read",
    WRITE: "users:write",
    DELETE: "users:delete",
  },
  ORGS: {
    READ: "organisations:read",
    MANAGE: "organisations:manage",
  },
  ROLES: {
    MANAGE: "roles:manage",
  },
  SETTINGS: {
    MANAGE: "settings:manage",
  },
  REPORTS: {
    VIEW: "reports:view",
  },
} as const;

export const PANELS = {
  WEB: "web",
  ADMIN: "admin",
} as const;

// Role names — use these instead of hardcoded strings
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  ORGANISATION: "organisation",
} as const;
