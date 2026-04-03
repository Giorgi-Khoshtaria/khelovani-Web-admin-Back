/**
 * Shared test scenarios and helpers for common validations
 * Used across user and partner registration tests
 */

export interface ValidationScenario {
  id: string;
  field: string;
  value: any;
  note: string;
}

// ─── Email Validation Scenarios ─────────────────────────────────
export const emailValidationScenarios: ValidationScenario[] = [
  { id: "VAL-EMAIL-001", field: "email", value: "", note: "empty email" },
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

// ─── Phone Validation Scenarios ────────────────────────────────
export const phoneValidationScenarios: ValidationScenario[] = [
  { id: "VAL-PHONE-001", field: "phone", value: "", note: "empty phone" },
  {
    id: "VAL-PHONE-002",
    field: "phone",
    value: "59912345",
    note: "short phone",
  },
  {
    id: "VAL-PHONE-003",
    field: "phone",
    value: "59912345678",
    note: "long phone",
  },
  {
    id: "VAL-PHONE-004",
    field: "phone",
    value: "abc123456",
    note: "non-numeric phone",
  },
  {
    id: "VAL-PHONE-005",
    field: "phone",
    value: "499123456",
    note: "invalid prefix",
  },
];

// ─── City Validation Scenarios ─────────────────────────────────
export const cityValidationScenarios: ValidationScenario[] = [
  { id: "VAL-CITY-001", field: "city", value: "", note: "empty city" },
  {
    id: "VAL-CITY-002",
    field: "city",
    value: "invalidcity",
    note: "invalid city",
  },
];

// ─── Name Validation Scenarios (for user names) ────────────────
export const nameEnValidationScenarios: ValidationScenario[] = [
  { id: "VAL-NAME-EN-001", field: "nameEn", value: "", note: "empty nameEn" },
  {
    id: "VAL-NAME-EN-002",
    field: "nameEn",
    value: "A".repeat(51),
    note: "nameEn too long",
  },
  {
    id: "VAL-NAME-EN-003",
    field: "nameEn",
    value: "123",
    note: "nameEn with numbers",
  },
];

// ─── Password Validation Scenarios ─────────────────────────────
export const passwordValidationScenarios: ValidationScenario[] = [
  {
    id: "VAL-PWD-001",
    field: "password",
    value: "shrt1!A",
    note: "under min length",
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
    note: "missing special",
  },
  { id: "VAL-PWD-006", field: "password", value: "", note: "empty password" },
];

// ─── Address Validation Scenarios ──────────────────────────────
export const addressValidationScenarios: ValidationScenario[] = [
  { id: "VAL-ADDR-001", field: "address", value: "", note: "empty address" },
  {
    id: "VAL-ADDR-002",
    field: "address",
    value: "A".repeat(201),
    note: "address too long",
  },
];

// ─── Shared Test Helper Functions ──────────────────────────────

/**
 * Runs validation test scenarios for a given register function
 */
export function runValidationTests(
  scenarios: ValidationScenario[],
  registerFn: (overrides?: Record<string, any>) => Promise<any>,
  testFn: (id: string, field: string, value: any, note: string) => void,
) {
  for (const { id, field, value, note } of scenarios) {
    testFn(id, field, value, note);
  }
}

/**
 * Creates a test function for validation scenarios
 */
export function createValidationTest(
  api: any,
  registerFn: (api: any, overrides?: Record<string, any>) => Promise<any>,
) {
  return (id: string, field: string, value: any, note: string) => {
    // Note: This function should be used within a test context where 'test' is available
    // Example usage:
    // const validationTest = createValidationTest(api, registerFn);
    // runValidationTests(scenarios, registerFn, validationTest);
  };
}
