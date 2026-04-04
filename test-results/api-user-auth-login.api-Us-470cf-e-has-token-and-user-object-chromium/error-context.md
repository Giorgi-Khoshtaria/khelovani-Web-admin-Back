# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/user/auth/login.api.spec.ts >> User Login API >> 1. Happy Path >> LGN-002: 200 — response has token and user object
- Location: tests/api/user/auth/suites/loginHappyPath.suite.ts:19:5

# Error details

```
Error: expect(received).toHaveProperty(path)

Expected path: "token"
Received path: []

Received value: {"message": "Cannot populate path `role` because it is not in your schema. Set the `strictPopulate` option to false to override."}
```

# Test source

```ts
  1  | import { test, expect, CreatedUser, UserFixtures } from "../../../../fixtures/auth.fixture.js";
  2  | import { ENDPOINTS } from "../../../../constants/endpoints.js";
  3  | 
  4  | export const loginHappyPathSuites = () => {
  5  |   test.describe("1. Happy Path", () => {
  6  |     let sharedUser: CreatedUser;
  7  | 
  8  |     test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
  9  |       sharedUser = await createVerifiedUser();
  10 |     });
  11 | 
  12 |     test("LGN-001: 200 — verified user logs in successfully", async ({ api }: UserFixtures) => {
  13 |       const res = await api.post(ENDPOINTS.LOGIN, {
  14 |         data: { email: sharedUser.email, password: sharedUser.password },
  15 |       });
  16 |       expect(res.status()).toBe(200);
  17 |     });
  18 | 
  19 |     test("LGN-002: 200 — response has token and user object", async ({ api }: UserFixtures) => {
  20 |       const res = await api.post(ENDPOINTS.LOGIN, {
  21 |         data: { email: sharedUser.email, password: sharedUser.password },
  22 |       });
  23 |       const body = await res.json();
> 24 |       expect(body).toHaveProperty("token");
     |                    ^ Error: expect(received).toHaveProperty(path)
  25 |       expect(body).toHaveProperty("user");
  26 |     });
  27 | 
  28 |     test("LGN-003: 200 — token is valid JWT", async ({ api }: UserFixtures) => {
  29 |       const res = await api.post(ENDPOINTS.LOGIN, {
  30 |         data: { email: sharedUser.email, password: sharedUser.password },
  31 |       });
  32 |       const body = await res.json();
  33 |       expect(body.token).toMatch(
  34 |         /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
  35 |       );
  36 |     });
  37 | 
  38 |     test("LGN-004: 200 — email login is case-insensitive", async ({ api }: UserFixtures) => {
  39 |       const res = await api.post(ENDPOINTS.LOGIN, {
  40 |         data: {
  41 |           email: sharedUser.email.toUpperCase(),
  42 |           password: sharedUser.password,
  43 |         },
  44 |       });
  45 |       expect(res.status()).toBe(200);
  46 |     });
  47 | 
  48 |     test("LGN-005: 200 — email with leading/trailing whitespace is trimmed", async ({
  49 |       api,
  50 |     }: UserFixtures) => {
  51 |       const res = await api.post(ENDPOINTS.LOGIN, {
  52 |         data: {
  53 |           email: `  ${sharedUser.email}  `,
  54 |           password: sharedUser.password,
  55 |         },
  56 |       });
  57 |       expect(res.status()).toBe(200);
  58 |     });
  59 |   });
  60 | };
  61 | 
```