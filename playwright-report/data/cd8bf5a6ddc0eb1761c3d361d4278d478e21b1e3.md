# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/user/auth/login.api.spec.ts >> User Login API >> 14. Rate Limiting >> LGN-160: 429 — burst of requests triggers rate limiting
- Location: tests/api/user/auth/suites/loginSecurity.suite.ts:11:5

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected value: 429
Received array: [422, 422, 422, 422, 422, 422, 422, 422, 422, 422, …]
```

# Test source

```ts
  1  | import {
  2  |   test,
  3  |   expect,
  4  |   CreatedUser,
  5  |   UserFixtures,
  6  | } from "../../../../fixtures/auth.fixture.js";
  7  | import { ENDPOINTS } from "../../../../constants/endpoints.js";
  8  | 
  9  | export const loginSecuritySuites = () => {
  10 |   test.describe("14. Rate Limiting", () => {
  11 |     test("LGN-160: 429 — burst of requests triggers rate limiting", async ({
  12 |       api,
  13 |     }: UserFixtures) => {
  14 |       const attempts = 60;
  15 |       const results = await Promise.all(
  16 |         Array.from({ length: attempts }, () =>
  17 |           api.post(ENDPOINTS.LOGIN, {
  18 |             data: {
  19 |               email: `qa_rate_limit_${Math.random()}@test.com`,
  20 |               password: "WrongPass123!",
  21 |             },
  22 |           }),
  23 |         ),
  24 |       );
  25 |       const statuses = results.map((r) => r.status());
> 26 |       expect(statuses).toContain(429);
     |                        ^ Error: expect(received).toContain(expected) // indexOf
  27 |     });
  28 |   });
  29 | 
  30 |   test.describe("19. Token Security & JWT Validation", () => {
  31 |     let sharedUser: CreatedUser;
  32 | 
  33 |     test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
  34 |       sharedUser = await createVerifiedUser();
  35 |     });
  36 | 
  37 |     test("LGN-203: token works on protected endpoint", async ({ api }: UserFixtures) => {
  38 |       const loginRes = await api.post(ENDPOINTS.LOGIN, {
  39 |         data: { email: sharedUser.email, password: sharedUser.password },
  40 |       });
  41 |       const { token } = await loginRes.json();
  42 |       const profileRes = await api.get(ENDPOINTS.PROFILE, {
  43 |         headers: { Authorization: `Bearer ${token}` },
  44 |       });
  45 |       expect(profileRes.status()).not.toBe(401);
  46 |     });
  47 |   });
  48 | 
  49 |   test.describe("21. Account Lockout & Recovery", () => {
  50 |     let sharedUser: CreatedUser;
  51 | 
  52 |     test.beforeAll(async ({ createVerifiedUser }: UserFixtures) => {
  53 |       sharedUser = await createVerifiedUser();
  54 |     });
  55 | 
  56 |     test("LGN-220: consecutive wrong passwords → 429 Too Many Requests", async ({
  57 |       api,
  58 |     }: UserFixtures) => {
  59 |       let lastStatus = 0;
  60 |       for (let i = 0; i < 60; i++) {
  61 |         const res = await api.post(ENDPOINTS.LOGIN, {
  62 |           data: { email: sharedUser.email, password: `Wrong${i}!` },
  63 |         });
  64 |         lastStatus = res.status();
  65 |         if (lastStatus === 429) break;
  66 |       }
  67 |       expect(lastStatus).toBe(429);
  68 |     });
  69 |   });
  70 | };
  71 | 
```