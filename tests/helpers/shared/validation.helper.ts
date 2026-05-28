/**
 * Shared validation scenario library.
 * Each export is a self-contained array of { id, field, value, note } used
 * in for-of loops inside test suites to keep test files DRY.
 *
 * LIMITS block mirrors schema constraints — update both when schema changes.
 */

export interface ValidationScenario {
  id: string;
  field: string;
  value: any;
  note: string;
}

// ─── Schema limits (must stay in sync with src/validations/schemas/) ──────────

export const LIMITS = {
  // register.schema.ts
  register: {
    nameGe: { min: 2, max: 100 },
    nameEn: { min: 2, max: 100 },
    email: { max: 150 },
    phone: { max: 40 },
    password: { min: 8, max: 64 },
  },
  // forgotPassword.schema.ts
  forgotPassword: {
    email: { max: 150 },
  },
  // resetPassword.schema.ts
  resetPassword: {
    token: { max: 512 },
    password: { min: 8, max: 64 },
  },
  // login.schema.ts
  login: {
    email: { max: 255 },
    password: { max: 100 },
  },
  // menu.schema.ts
  menu: {
    labelKa: { min: 2, max: 20 },
    labelEn: { min: 2, max: 20 },
    href: { min: 1, max: 20 },
  },
  // permission.schema.ts
  permission: {
    name: { min: 2, max: 100 },
    description: { max: 1000 },
  },
  // role.schema.ts
  role: {
    name: { min: 2, max: 100 },
    description: { max: 500 },
  },
  // product.schema.ts
  product: {
    titleGe: { min: 3, max: 100 },
    titleEn: { min: 3, max: 100 },
    descriptionGe: { min: 10, max: 2000 },
    descriptionEn: { min: 10, max: 2000 },
    tagItem: { min: 3, max: 30 },
    tags: { min: 1, max: 10 },
  },
  // orgPartner.schema.ts — partnerRegistrationSchema (self-registration, no regex on names)
  partner: {
    companyNameGe: { min: 1, max: 100 },
    companyNameEn: { min: 1, max: 100 },
    contactPerson: { min: 1, max: 100 },
    email: { max: 254 },
    address: { max: 200 }, // Georgian regex required
    addressEn: { max: 200 }, // English regex required
    description: { max: 500 },
  },
  // paymentCard.schema.ts
  card: {
    holderName: { min: 1, max: 60 },
    last4: { len: 4 },
    expMonth: { min: 1, max: 12 },
  },
  // address.schema.ts
  address: {
    label: { min: 2, max: 100 },
    addressLine: { min: 5, max: 200 },
    additionalComment: { max: 300 },
    lat: { min: -90, max: 90 },
    lng: { min: -180, max: 180 },
  },
} as const;

// ─── Email (shared across login, registration, partner) ───────────────────────

export const emailValidationScenarios: ValidationScenario[] = [
  { id: "VAL-EMAIL-001", field: "email", value: "", note: "empty string" },
  { id: "VAL-EMAIL-002", field: "email", value: "test.com", note: "missing @" },
  {
    id: "VAL-EMAIL-003",
    field: "email",
    value: "test@",
    note: "missing domain",
  },
  {
    id: "VAL-EMAIL-004",
    field: "email",
    value: "@test.com",
    note: "missing local part",
  },
  {
    id: "VAL-EMAIL-005",
    field: "email",
    value: "test@test.com@test",
    note: "multiple @",
  },
  {
    id: "VAL-EMAIL-006",
    field: "email",
    value: "test @test.com",
    note: "contains space",
  },
  {
    id: "VAL-EMAIL-007",
    field: "email",
    value: "test..test@test.com",
    note: "consecutive dots",
  },
  { id: "VAL-EMAIL-008", field: "email", value: "test@test", note: "no TLD" },
  {
    id: "VAL-EMAIL-009",
    field: "email",
    value: "test@test.",
    note: "trailing dot",
  },
];

// ─── Phone (shared across user & partner registration) ────────────────────────

export const phoneValidationScenarios: ValidationScenario[] = [
  { id: "VAL-PHONE-001", field: "phone", value: "", note: "empty string" },
  {
    id: "VAL-PHONE-002",
    field: "phone",
    value: "59912345",
    note: "too short (8 digits)",
  },
  {
    id: "VAL-PHONE-003",
    field: "phone",
    value: "59912345678",
    note: "too long (11 digits)",
  },
  {
    id: "VAL-PHONE-004",
    field: "phone",
    value: "abc123456",
    note: "non-numeric",
  },
  {
    id: "VAL-PHONE-005",
    field: "phone",
    value: "499123456",
    note: "invalid prefix (not 5xx)",
  },
  {
    id: "VAL-PHONE-006",
    field: "phone",
    value: "a".repeat(41),
    note: "over max length",
  },
];

// ─── City (shared across user & partner registration) ─────────────────────────

export const cityValidationScenarios: ValidationScenario[] = [
  { id: "VAL-CITY-001", field: "city", value: "", note: "empty string" },
  {
    id: "VAL-CITY-002",
    field: "city",
    value: "invalidcity",
    note: "not in allowed list",
  },
  { id: "VAL-CITY-003", field: "city", value: "Tbilisi", note: "wrong case" },
  {
    id: "VAL-CITY-004",
    field: "city",
    value: 123,
    note: "number instead of string",
  },
];

// ─── Password complexity (registration only) ──────────────────────────────────

export const passwordValidationScenarios: ValidationScenario[] = [
  {
    id: "VAL-PWD-001",
    field: "password",
    value: "shrt1!A",
    note: "under min length (7 chars)",
  },
  {
    id: "VAL-PWD-002",
    field: "password",
    value: "nocaps123!",
    note: "missing uppercase",
  },
  {
    id: "VAL-PWD-003",
    field: "password",
    value: "NOLOWER123!",
    note: "missing lowercase",
  },
  {
    id: "VAL-PWD-004",
    field: "password",
    value: "NoDigit!AA",
    note: "missing digit",
  },
  {
    id: "VAL-PWD-005",
    field: "password",
    value: "NoSpecial1A",
    note: "missing special char",
  },
  { id: "VAL-PWD-006", field: "password", value: "", note: "empty string" },
  {
    id: "VAL-PWD-007",
    field: "password",
    value: "A".repeat(65) + "a1!",
    note: "over max length (65 chars)",
  },
];

// ─── User name (registration) ─────────────────────────────────────────────────

export const nameEnValidationScenarios: ValidationScenario[] = [
  { id: "VAL-NAME-EN-001", field: "nameEn", value: "", note: "empty string" },
  {
    id: "VAL-NAME-EN-002",
    field: "nameEn",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "VAL-NAME-EN-003",
    field: "nameEn",
    value: "123",
    note: "digits only (no letters)",
  },
  {
    id: "VAL-NAME-EN-004",
    field: "nameEn",
    value: "A",
    note: "too short (1 char)",
  },
];

export const nameGeValidationScenarios: ValidationScenario[] = [
  { id: "VAL-NAME-GE-001", field: "nameGe", value: "", note: "empty string" },
  {
    id: "VAL-NAME-GE-002",
    field: "nameGe",
    value: "ა",
    note: "too short (1 char)",
  },
  { id: "VAL-NAME-GE-003", field: "nameGe", value: null, note: "null value" },
  {
    id: "VAL-NAME-GE-004",
    field: "nameGe",
    value: "ა".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "VAL-NAME-GE-005",
    field: "nameGe",
    value: "John",
    note: "Latin chars rejected",
  },
  {
    id: "VAL-NAME-GE-006",
    field: "nameGe",
    value: "123",
    note: "digits only rejected",
  },
];

// ─── ID Number (user registration) ────────────────────────────────────────────

export const idNumberValidationScenarios: ValidationScenario[] = [
  { id: "VAL-ID-001", field: "idNumber", value: "", note: "empty string" },
  {
    id: "VAL-ID-002",
    field: "idNumber",
    value: "1234567890",
    note: "too short (10 digits)",
  },
  {
    id: "VAL-ID-003",
    field: "idNumber",
    value: "123456789012",
    note: "too long (12 digits)",
  },
  { id: "VAL-ID-004", field: "idNumber", value: null, note: "null value" },
  {
    id: "VAL-ID-005",
    field: "idNumber",
    value: "1234567890a",
    note: "contains letter",
  },
  {
    id: "VAL-ID-006",
    field: "idNumber",
    value: "           ",
    note: "whitespace only",
  },
];

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginPasswordScenarios: ValidationScenario[] = [
  { id: "LGN-VAL-001", field: "password", value: "", note: "empty string" },
  {
    id: "LGN-VAL-002",
    field: "password",
    value: "a".repeat(101),
    note: "over max length (101 chars)",
  },
];

export const loginEmailScenarios: ValidationScenario[] =
  emailValidationScenarios.map((s) => ({
    ...s,
    id: s.id.replace("VAL-EMAIL", "LGN-EMAIL"),
  }));

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const menuLabelKaScenarios: ValidationScenario[] = [
  {
    id: "MNU-VAL-001",
    field: "label.ka",
    value: "ა",
    note: "too short (1 char)",
  },
  {
    id: "MNU-VAL-002",
    field: "label.ka",
    value: "ა".repeat(LIMITS.menu.labelKa.max + 1),
    note: `over max (${LIMITS.menu.labelKa.max + 1} chars)`,
  },
  {
    id: "MNU-VAL-003",
    field: "label.ka",
    value: "Home",
    note: "Latin chars rejected",
  },
  {
    id: "MNU-VAL-004",
    field: "label.ka",
    value: "მ<script>",
    note: "special chars rejected",
  },
];

export const menuLabelEnScenarios: ValidationScenario[] = [
  {
    id: "MNU-VAL-005",
    field: "label.en",
    value: "H",
    note: "too short (1 char)",
  },
  {
    id: "MNU-VAL-006",
    field: "label.en",
    value: "A".repeat(LIMITS.menu.labelEn.max + 1),
    note: `over max (${LIMITS.menu.labelEn.max + 1} chars)`,
  },
  {
    id: "MNU-VAL-007",
    field: "label.en",
    value: "მთავ",
    note: "Georgian chars rejected",
  },
  {
    id: "MNU-VAL-008",
    field: "label.en",
    value: "home<>",
    note: "special chars rejected",
  },
];

export const menuHrefScenarios: ValidationScenario[] = [
  { id: "MNU-VAL-009", field: "href", value: "", note: "empty string" },
  {
    id: "MNU-VAL-010",
    field: "href",
    value: "home",
    note: "missing leading /",
  },
  {
    id: "MNU-VAL-011",
    field: "href",
    value: "/".padEnd(LIMITS.menu.href.max + 2, "a"),
    note: `over max (${LIMITS.menu.href.max + 1} chars)`,
  },
  {
    id: "MNU-VAL-012",
    field: "href",
    value: "/my path",
    note: "contains space",
  },
  {
    id: "MNU-VAL-013",
    field: "href",
    value: "/invalid<>path",
    note: "contains < >",
  },
];

export const menuOrderScenarios: ValidationScenario[] = [
  { id: "MNU-VAL-014", field: "order", value: -1, note: "negative number" },
  {
    id: "MNU-VAL-015",
    field: "order",
    value: "1",
    note: "string instead of number",
  },
  { id: "MNU-VAL-016", field: "order", value: null, note: "null" },
];

// ─── Permission ───────────────────────────────────────────────────────────────

export const permissionNameScenarios: ValidationScenario[] = [
  { id: "PRM-VAL-001", field: "name", value: "", note: "empty string" },
  { id: "PRM-VAL-002", field: "name", value: "A", note: "too short (1 char)" },
  {
    id: "PRM-VAL-003",
    field: "name",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRM-VAL-004",
    field: "name",
    value: "name<script>",
    note: "invalid characters",
  },
];

export const permissionDescriptionScenarios: ValidationScenario[] = [
  {
    id: "PRM-VAL-005",
    field: "description",
    value: "a".repeat(1001),
    note: "over max length (1001 chars)",
  },
  {
    id: "PRM-VAL-006",
    field: "description",
    value: "<b>html</b>",
    note: "HTML tags rejected",
  },
];

// ─── Role ─────────────────────────────────────────────────────────────────────

export const roleNameScenarios: ValidationScenario[] = [
  { id: "ROL-VAL-001", field: "name", value: "", note: "empty string" },
  { id: "ROL-VAL-002", field: "name", value: "A", note: "too short (1 char)" },
  {
    id: "ROL-VAL-003",
    field: "name",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "ROL-VAL-004",
    field: "name",
    value: "role<>name",
    note: "invalid characters",
  },
];

export const roleDescriptionScenarios: ValidationScenario[] = [
  {
    id: "ROL-VAL-005",
    field: "description",
    value: "a".repeat(501),
    note: "over max length (501 chars)",
  },
  {
    id: "ROL-VAL-006",
    field: "description",
    value: "<script>",
    note: "HTML tags rejected",
  },
];

export const roleAllowedPanelsScenarios: ValidationScenario[] = [
  { id: "ROL-VAL-007", field: "allowedPanels", value: [], note: "empty array" },
  {
    id: "ROL-VAL-008",
    field: "allowedPanels",
    value: ["invalid-panel"],
    note: "unknown panel value",
  },
  {
    id: "ROL-VAL-009",
    field: "allowedPanels",
    value: "admin",
    note: "string instead of array",
  },
];

// ─── Product ──────────────────────────────────────────────────────────────────

export const productTitleGeScenarios: ValidationScenario[] = [
  { id: "PRD-VAL-001", field: "titleGe", value: "", note: "empty string" },
  {
    id: "PRD-VAL-002",
    field: "titleGe",
    value: "ა".repeat(2),
    note: "too short (<3 chars)",
  },
  {
    id: "PRD-VAL-003",
    field: "titleGe",
    value: "ა".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRD-VAL-004",
    field: "titleGe",
    value: "Hello",
    note: "Latin chars rejected",
  },
];

export const productTitleEnScenarios: ValidationScenario[] = [
  { id: "PRD-VAL-005", field: "titleEn", value: "", note: "empty string" },
  {
    id: "PRD-VAL-006",
    field: "titleEn",
    value: "AB",
    note: "too short (<3 chars)",
  },
  {
    id: "PRD-VAL-007",
    field: "titleEn",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRD-VAL-008",
    field: "titleEn",
    value: "მთავარი",
    note: "Georgian chars rejected",
  },
];

export const productPriceScenarios: ValidationScenario[] = [
  { id: "PRD-VAL-009", field: "price", value: 0, note: "zero (not positive)" },
  { id: "PRD-VAL-010", field: "price", value: -1, note: "negative price" },
  {
    id: "PRD-VAL-011",
    field: "price",
    value: "abc",
    note: "non-numeric string (cannot coerce)",
  },
];

export const productStockScenarios: ValidationScenario[] = [
  {
    id: "PRD-VAL-012",
    field: "stockQuantity",
    value: -1,
    note: "negative stock",
  },
  {
    id: "PRD-VAL-013",
    field: "stockQuantity",
    value: "abc",
    note: "non-numeric string (cannot coerce)",
  },
];

export const productConditionScenarios: ValidationScenario[] = [
  { id: "PRD-VAL-014", field: "condition", value: "", note: "empty string" },
  {
    id: "PRD-VAL-015",
    field: "condition",
    value: "broken",
    note: "invalid condition value",
  },
  { id: "PRD-VAL-016", field: "condition", value: "New", note: "wrong case" },
];

// ─── Partner Registration ─────────────────────────────────────────────────────
// Based on partnerRegistrationSchema — names have min:1 and NO regex restriction

export const partnerCompanyNameGeScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-001",
    field: "companyNameGe",
    value: "",
    note: "empty string (min 1)",
  },
  {
    id: "PRT-VAL-002",
    field: "companyNameGe",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRT-VAL-003",
    field: "companyNameGe",
    value: null,
    note: "null value",
  },
];

export const partnerCompanyNameEnScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-004",
    field: "companyNameEn",
    value: "",
    note: "empty string (min 1)",
  },
  {
    id: "PRT-VAL-005",
    field: "companyNameEn",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRT-VAL-006",
    field: "companyNameEn",
    value: null,
    note: "null value",
  },
];

export const partnerIdCodeScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-007",
    field: "identificationCode",
    value: "",
    note: "empty string",
  },
  {
    id: "PRT-VAL-008",
    field: "identificationCode",
    value: "12345678",
    note: "too short (8 digits)",
  },
  {
    id: "PRT-VAL-009",
    field: "identificationCode",
    value: "1234567890",
    note: "too long (10 digits)",
  },
  {
    id: "PRT-VAL-010",
    field: "identificationCode",
    value: "12345678a",
    note: "contains letter",
  },
  {
    id: "PRT-VAL-011",
    field: "identificationCode",
    value: "123456789 1",
    note: "contains space",
  },
];

export const partnerContactPersonScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-012",
    field: "contactPerson",
    value: "",
    note: "empty string (min 1)",
  },
  {
    id: "PRT-VAL-013",
    field: "contactPerson",
    value: "A".repeat(101),
    note: "over max length (101 chars)",
  },
  {
    id: "PRT-VAL-014",
    field: "contactPerson",
    value: null,
    note: "null value",
  },
];

// Georgian address — regex: /^[ა-ჰ0-9\s.,/\\-()]+$/  max: 200
export const partnerAddressScenarios: ValidationScenario[] = [
  { id: "PRT-VAL-020", field: "address", value: "", note: "empty string" },
  {
    id: "PRT-VAL-021",
    field: "address",
    value: "A".repeat(201),
    note: "over max length (201 chars)",
  },
  {
    id: "PRT-VAL-022",
    field: "address",
    value: "123 Main Street",
    note: "Latin chars — Georgian regex required",
  },
  { id: "PRT-VAL-023", field: "address", value: null, note: "null value" },
];

// English addressEn — regex: /^[a-zA-Z0-9\s.,/\\-()]+$/  max: 200
export const partnerAddressEnScenarios: ValidationScenario[] = [
  { id: "PRT-VAL-025", field: "addressEn", value: "", note: "empty string" },
  {
    id: "PRT-VAL-026",
    field: "addressEn",
    value: "A".repeat(201),
    note: "over max length (201 chars)",
  },
  {
    id: "PRT-VAL-027",
    field: "addressEn",
    value: "თბილისი 123",
    note: "Georgian chars — English regex required",
  },
  { id: "PRT-VAL-028", field: "addressEn", value: null, note: "null value" },
];

// URL fields (website/facebook/instagram/tiktok) — must be valid URL
export const partnerUrlScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-030",
    field: "website",
    value: "not-a-url",
    note: "invalid URL format",
  },
  {
    id: "PRT-VAL-031",
    field: "website",
    value: "ftp://example.com",
    note: "non-http scheme (ftp)",
  },
  {
    id: "PRT-VAL-032",
    field: "facebook",
    value: "not-a-url",
    note: "invalid URL format",
  },
  {
    id: "PRT-VAL-033",
    field: "instagram",
    value: "not-a-url",
    note: "invalid URL format",
  },
  {
    id: "PRT-VAL-034",
    field: "tiktok",
    value: "not-a-url",
    note: "invalid URL format",
  },
];

// personalNumber (INDIVIDUAL only) — must be exactly 11 digits
export const partnerPersonalNumberScenarios: ValidationScenario[] = [
  {
    id: "PRT-VAL-015",
    field: "personalNumber",
    value: "",
    note: "empty string",
  },
  {
    id: "PRT-VAL-016",
    field: "personalNumber",
    value: "1234567890",
    note: "too short (10 digits)",
  },
  {
    id: "PRT-VAL-017",
    field: "personalNumber",
    value: "123456789012",
    note: "too long (12 digits)",
  },
  {
    id: "PRT-VAL-018",
    field: "personalNumber",
    value: "1234567890a",
    note: "contains letter",
  },
  {
    id: "PRT-VAL-019",
    field: "personalNumber",
    value: null,
    note: "null value",
  },
];

// Required field scenarios for ORGANIZATION registration
export const partnerOrgRequiredFieldScenarios: ValidationScenario[] = [
  {
    id: "PRT-REQ-001",
    field: "companyNameGe",
    value: "",
    note: "empty companyNameGe",
  },
  {
    id: "PRT-REQ-002",
    field: "companyNameEn",
    value: "",
    note: "empty companyNameEn",
  },
  {
    id: "PRT-REQ-003",
    field: "identificationCode",
    value: "",
    note: "empty identificationCode",
  },
  {
    id: "PRT-REQ-004",
    field: "contactPerson",
    value: "",
    note: "empty contactPerson",
  },
  {
    id: "PRT-REQ-005",
    field: "categories",
    value: [],
    note: "empty categories array",
  },
  {
    id: "PRT-REQ-006",
    field: "terms",
    value: false,
    note: "terms not accepted",
  },
  { id: "PRT-REQ-007", field: "terms", value: null, note: "terms = null" },
];

// Required field scenarios for INDIVIDUAL registration
export const partnerIndRequiredFieldScenarios: ValidationScenario[] = [
  {
    id: "PRT-IND-REQ-001",
    field: "companyNameGe",
    value: "",
    note: "empty companyNameGe",
  },
  {
    id: "PRT-IND-REQ-002",
    field: "companyNameEn",
    value: "",
    note: "empty companyNameEn",
  },
  {
    id: "PRT-IND-REQ-003",
    field: "personalNumber",
    value: "",
    note: "empty personalNumber",
  },
  {
    id: "PRT-IND-REQ-004",
    field: "categories",
    value: [],
    note: "empty categories array",
  },
  {
    id: "PRT-IND-REQ-005",
    field: "terms",
    value: false,
    note: "terms not accepted",
  },
  { id: "PRT-IND-REQ-006", field: "terms", value: null, note: "terms = null" },
];

// ─── Payment Card (paymentCard.schema.ts) ─────────────────────────────────────

export const cardHolderNameScenarios: ValidationScenario[] = [
  { id: "CARD-VAL-001", field: "holderName", value: "", note: "empty string" },
  { id: "CARD-VAL-002", field: "holderName", value: null, note: "null value" },
  {
    id: "CARD-VAL-003",
    field: "holderName",
    value: "A".repeat(LIMITS.card.holderName.max + 1),
    note: "over max length (61 chars)",
  },
];

export const cardBrandScenarios: ValidationScenario[] = [
  { id: "CARD-VAL-010", field: "brand", value: "", note: "empty string" },
  {
    id: "CARD-VAL-011",
    field: "brand",
    value: "discover",
    note: "brand not in allowed list",
  },
  { id: "CARD-VAL-012", field: "brand", value: "VISA", note: "wrong case" },
  {
    id: "CARD-VAL-013",
    field: "brand",
    value: 123,
    note: "number instead of string",
  },
];

export const cardLast4Scenarios: ValidationScenario[] = [
  { id: "CARD-VAL-020", field: "last4", value: "", note: "empty string" },
  {
    id: "CARD-VAL-021",
    field: "last4",
    value: "abcd",
    note: "non-numeric characters",
  },
  {
    id: "CARD-VAL-022",
    field: "last4",
    value: "123",
    note: "too short (3 digits)",
  },
  {
    id: "CARD-VAL-023",
    field: "last4",
    value: "12345",
    note: "too long (5 digits)",
  },
  {
    id: "CARD-VAL-024",
    field: "last4",
    value: "12 4",
    note: "contains a space",
  },
];

export const cardExpMonthScenarios: ValidationScenario[] = [
  { id: "CARD-VAL-030", field: "expMonth", value: 0, note: "below min (0)" },
  { id: "CARD-VAL-031", field: "expMonth", value: 13, note: "above max (13)" },
  {
    id: "CARD-VAL-032",
    field: "expMonth",
    value: "12",
    note: "string instead of number",
  },
  {
    id: "CARD-VAL-033",
    field: "expMonth",
    value: 6.5,
    note: "non-integer value",
  },
];

export const cardExpYearScenarios: ValidationScenario[] = [
  {
    id: "CARD-VAL-040",
    field: "expYear",
    value: 2000,
    note: "year in the past",
  },
  {
    id: "CARD-VAL-041",
    field: "expYear",
    value: new Date().getFullYear() + 50,
    note: "year too far ahead",
  },
  {
    id: "CARD-VAL-042",
    field: "expYear",
    value: "2030",
    note: "string instead of number",
  },
];

// ─── Address (address.schema.ts) ──────────────────────────────────────────────

export const addressTypeScenarios: ValidationScenario[] = [
  { id: "ADDR-VAL-001", field: "type", value: "", note: "empty string" },
  {
    id: "ADDR-VAL-002",
    field: "type",
    value: "garage",
    note: "type not in allowed list",
  },
  { id: "ADDR-VAL-003", field: "type", value: "Home", note: "wrong case" },
];

export const addressLabelScenarios: ValidationScenario[] = [
  { id: "ADDR-VAL-010", field: "label", value: "", note: "empty string" },
  {
    id: "ADDR-VAL-011",
    field: "label",
    value: "x",
    note: "too short (1 char)",
  },
  {
    id: "ADDR-VAL-012",
    field: "label",
    value: "x".repeat(LIMITS.address.label.max + 1),
    note: "over max length (101 chars)",
  },
  { id: "ADDR-VAL-013", field: "label", value: null, note: "null value" },
];

export const addressLineScenarios: ValidationScenario[] = [
  { id: "ADDR-VAL-020", field: "addressLine", value: "", note: "empty string" },
  {
    id: "ADDR-VAL-021",
    field: "addressLine",
    value: "abc",
    note: "too short (<5 chars)",
  },
  {
    id: "ADDR-VAL-022",
    field: "addressLine",
    value: "x".repeat(LIMITS.address.addressLine.max + 1),
    note: "over max length (201 chars)",
  },
];

export const addressLatScenarios: ValidationScenario[] = [
  { id: "ADDR-VAL-030", field: "lat", value: 200, note: "above max (90)" },
  { id: "ADDR-VAL-031", field: "lat", value: -91, note: "below min (-90)" },
  {
    id: "ADDR-VAL-032",
    field: "lat",
    value: "41.7",
    note: "string instead of number",
  },
  { id: "ADDR-VAL-033", field: "lat", value: null, note: "null value" },
];

export const addressLngScenarios: ValidationScenario[] = [
  { id: "ADDR-VAL-040", field: "lng", value: 200, note: "above max (180)" },
  { id: "ADDR-VAL-041", field: "lng", value: -181, note: "below min (-180)" },
  {
    id: "ADDR-VAL-042",
    field: "lng",
    value: "44.8",
    note: "string instead of number",
  },
];
