# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/user/auth/login.api.spec.ts >> User Login API >> 2. ECP — Credential Errors >> LGN-016: anti-enumeration — non-existent vs wrong password return same message
- Location: tests/api/user/auth/suites/loginValidation.suite.ts:42:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 500
Received: 422
```

# Test source

```ts
  1   | import { test, expect, CreatedUser, UserFixtures } from "../../../../fixtures/auth.fixture.js";
  2   | import { ENDPOINTS } from "../../../../constants/endpoints.js";
  3   | 
  4   | export const loginValidationSuites = () => {
  5   |   test.describe("2. ECP — Credential Errors", () => {
  6   |     let sharedUser: CreatedUser;
  7   | 
  8   |     test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
  9   |       sharedUser = await createVerifiedUser();
  10  |     });
  11  | 
  12  |     test("LGN-010: 422 — email does not exist in system", async ({ api }: UserFixtures) => {
  13  |       const res = await api.post(ENDPOINTS.LOGIN, {
  14  |         data: {
  15  |           email: "ghost_never_registered_xyz@example.com",
  16  |           password: "SomePass123!",
  17  |         },
  18  |       });
  19  |       expect(res.status()).toBe(422);
  20  |     });
  21  | 
  22  |     test("LGN-011: 403 — registered but not yet verified", async ({
  23  |       registerUnverifiedUser,
  24  |       api,
  25  |     }: UserFixtures) => {
  26  |       const u = await registerUnverifiedUser();
  27  |       const res = await api.post(ENDPOINTS.LOGIN, {
  28  |         data: { email: u.email, password: u.password },
  29  |       });
  30  |       expect(res.status()).toBe(403);
  31  |       const body = await res.json();
  32  |       expect(body.code).toBe("EMAIL_NOT_VERIFIED");
  33  |     });
  34  | 
  35  |     test("LGN-012: 422 — verified user, wrong password", async ({ api }: UserFixtures) => {
  36  |       const res = await api.post(ENDPOINTS.LOGIN, {
  37  |         data: { email: sharedUser.email, password: "AbsolutelyWrongPass99!" },
  38  |       });
  39  |       expect(res.status()).toBe(422);
  40  |     });
  41  | 
  42  |     test("LGN-016: anti-enumeration — non-existent vs wrong password return same message", async ({
  43  |       api,
  44  |     }: UserFixtures) => {
  45  |       const [resGhost, resWrong] = await Promise.all([
  46  |         api.post(ENDPOINTS.LOGIN, {
  47  |           data: {
  48  |             email: "ghost_antienum@example.com",
  49  |             password: "SomePass123!",
  50  |           },
  51  |         }),
  52  |         api.post(ENDPOINTS.LOGIN, {
  53  |           data: { email: sharedUser.email, password: "WrongPass123!" },
  54  |         }),
  55  |       ]);
> 56  |       expect(resGhost.status()).toBe(resWrong.status());
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  57  |       const bodyA = await resGhost.json();
  58  |       const bodyB = await resWrong.json();
  59  |       expect(bodyA.message).toBe(bodyB.message);
  60  |     });
  61  |   });
  62  | 
  63  |   test.describe("3. ECP — Email Field Partitions", () => {
  64  |     const emailPartitions = [
  65  |       { id: "LGN-020", value: "", note: "empty string" },
  66  |       { id: "LGN-021", value: null as any, note: "null" },
  67  |     ];
  68  | 
  69  |     for (const { id, value, note } of emailPartitions) {
  70  |       test(`${id}: email='${note}' → 422`, async ({ api }: UserFixtures) => {
  71  |         const res = await api.post(ENDPOINTS.LOGIN, {
  72  |           data: { email: value, password: "SomePassword123!" },
  73  |         });
  74  |         expect(res.status()).toBe(422);
  75  |       });
  76  |     }
  77  |   });
  78  | 
  79  |   test.describe("4. ECP — Password Field Partitions", () => {
  80  |     const passwordPartitions = [
  81  |       { id: "LGN-040", value: "", note: "empty string" },
  82  |       { id: "LGN-041", value: null as any, note: "null" },
  83  |     ];
  84  | 
  85  |     for (const { id, value, note } of passwordPartitions) {
  86  |       test(`${id}: password='${note}' → 422`, async ({ api }: UserFixtures) => {
  87  |         const res = await api.post(ENDPOINTS.LOGIN, {
  88  |           data: { email: "test@example.com", password: value },
  89  |         });
  90  |         expect(res.status()).toBe(422);
  91  |       });
  92  |     }
  93  |   });
  94  | 
  95  |   test.describe("5. BVA — Email Length Boundaries", () => {
  96  |     test("LGN-060: 6-char email — valid, not 422 validation error", async ({
  97  |       api,
  98  |     }: UserFixtures) => {
  99  |       const res = await api.post(ENDPOINTS.LOGIN, {
  100 |         data: { email: "a@b.cd", password: "SomePassword123!" },
  101 |       });
  102 |       const body = await res.json();
  103 |       expect(body).not.toHaveProperty("errors");
  104 |     });
  105 |   });
  106 | };
  107 | 
```