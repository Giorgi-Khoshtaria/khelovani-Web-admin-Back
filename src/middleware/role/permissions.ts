export const PERMISSIONS = {
  ADMIN: {
    USER_LIST: "users.list",
    USER_BLOCK: "users.block",
    USER_DELETE: "users.delete",
    ORG_APPROVE: "organizations.approve",
    ORG_REJECT: "organizations.reject",
    ORG_DELETE: "organizations.delete",
    ORDER_VIEW_ALL: "orders.viewAll",
    PRODUCT_CREATE: "products.create",
    PRODUCT_EDIT: "products.edit",
    PRODUCT_DELETE: "products.delete",
    CATEGORY_CREATE: "categories.create",
    CATEGORY_EDIT: "categories.edit",
    CATEGORY_DELETE: "categories.delete",
    PAYMENT_VIEW: "payments.view",
    STATISTICS_VIEW: "statistics.view",
    ROLE_ASSIGN: "roles.assign",
    ROLE_READ: "roles.read",
    ROLE_CREATE: "roles.create",
    ROLE_EDIT: "roles.edit",
    ROLE_DELETE: "roles.delete",
    TRANSLATION_READ: "translations.read",
    TRANSLATION_EDIT: "translations.edit",
    TRANSLATION_DELETE: "translations.delete",
    MENU_MANAGE: "menu.manage",
    SETTINGS_EDIT: "settings.edit",
  },
  PARTNER: {
    PROFILE_EDIT: "organization.profile.edit",
    PRODUCT_CREATE: "organization.products.create",
    PRODUCT_EDIT: "organization.products.edit",
    PRODUCT_DELETE: "organization.products.delete",
    ORDER_VIEW: "organization.orders.view",
    ORDER_UPDATE: "organization.orders.update",
    SERVICE_CREATE: "organization.services.create",
    SERVICE_EDIT: "organization.services.edit",
    SERVICE_DELETE: "organization.services.delete",
    PRICE_EDIT: "organization.prices.edit",
    ANALYTICS_VIEW: "organization.analytics.view",
  },
} as const;

export const PANELS = {
  ORGANIZATION: "admin-organization",
  ADMIN: "admin",
} as const;

// Role names — only for administrative/partner levels
export const ROLES = {
  ADMIN: "admin",
  ORGANISATION: "organisation",
} as const;
