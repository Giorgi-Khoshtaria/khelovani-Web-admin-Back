# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: User/registration/registration.api.spec.ts >> User Registration API >> 10. Response Shape Contract >> SHP-003: 409 response body has message property
- Location: tests/User/registration/registration.api.spec.ts:341:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 409
Received: 429
```

# Test source

```ts
  259 |         dateOfBirth: dob,
  260 |       });
  261 |       expect(res.status()).toBe(201);
  262 |     });
  263 |   });
  264 | 
  265 |   // 7. Bad Request / Protocol (400)
  266 |   test.describe("7. Bad Request / Protocol (400)", () => {
  267 |     test("ERR-001: 400 — empty object body {}", async ({ api }) => {
  268 |       const res = await api.post(ENDPOINTS.REGISTER, { data: {} });
  269 |       expect(res.status()).toBe(400);
  270 |     });
  271 | 
  272 |     test("ERR-003: 400 — malformed JSON", async ({ api }) => {
  273 |       const res = await api.post(ENDPOINTS.REGISTER, {
  274 |         headers: { "Content-Type": "application/json" },
  275 |         data: '{ "email": "broken" ',
  276 |       });
  277 |       expect(res.status()).toBe(400);
  278 |     });
  279 |   });
  280 | 
  281 |   // 8. Security & Injection
  282 |   test.describe("8. Security & Injection", () => {
  283 |     test("SEC-001: 422 — SQL injection in email", async ({ api }) => {
  284 |       for (const payload of ["' OR '1'='1", "'; DROP TABLE users; --"]) {
  285 |         const res = await register(api, { email: payload });
  286 |         expect(res.status()).toBe(422);
  287 |       }
  288 |     });
  289 | 
  290 |     test("SEC-006: password never echoed in success response", async ({
  291 |       api,
  292 |       createdUsers,
  293 |     }) => {
  294 |       const { res } = await registerAndTrack(api, createdUsers);
  295 |       const text = await res.text();
  296 |       expect(text).not.toContain(DEFAULT_USER.password);
  297 |     });
  298 |   });
  299 | 
  300 |   // 9. Rate Limiting
  301 |   test.describe("9. Rate Limiting", () => {
  302 |     test("RTE-001: 429 triggered after rapid burst", async ({ api }) => {
  303 |       const BURST = 100; // test limit of 100
  304 |       const results = await Promise.all(
  305 |         Array.from({ length: BURST }, () =>
  306 |           api.post(ENDPOINTS.REGISTER, {
  307 |             data: {
  308 |               ...DEFAULT_USER,
  309 |               email: randomEmail(),
  310 |               password: "", // ❌ Missing/Empty password = Invalid (counts as 422, not skipped)
  311 |               idNumber: randomId(),
  312 |             },
  313 |           }),
  314 |         ),
  315 |       );
  316 |       const statuses = results.map((r) => r.status());
  317 |       const has429 = statuses.some((s) => s === 429);
  318 |       expect(has429, "Expected at least one 429 status during burst").toBe(
  319 |         true,
  320 |       );
  321 |     });
  322 |   });
  323 | 
  324 |   // 10. Response Shape Contract
  325 |   test.describe("10. Response Shape Contract", () => {
  326 |     test("SHP-001: 201 response has correct Content-Type", async ({
  327 |       api,
  328 |       createdUsers,
  329 |     }) => {
  330 |       const { res } = await registerAndTrack(api, createdUsers);
  331 |       expect(res.headers()["content-type"]).toContain("application/json");
  332 |     });
  333 | 
  334 |     test("SHP-002: 422 response includes errors array", async ({ api }) => {
  335 |       const res = await register(api, { email: "bad" });
  336 |       const body = await res.json();
  337 |       expect(res.status()).toBe(422);
  338 |       expect(Array.isArray(body.errors)).toBe(true);
  339 |     });
  340 | 
  341 |     test("SHP-003: 409 response body has message property", async ({
  342 |       api,
  343 |       createdUsers,
  344 |     }) => {
  345 |       const sharedId = randomId();
  346 |       const email1 = randomEmail();
  347 |       await register(api, { email: email1, idNumber: sharedId });
  348 |       createdUsers.push({
  349 |         email: email1,
  350 |         idNumber: sharedId,
  351 |         password: DEFAULT_USER.password,
  352 |       });
  353 | 
  354 |       const r2 = await register(api, {
  355 |         email: randomEmail(),
  356 |         idNumber: sharedId,
  357 |       });
  358 |       const body = await r2.json();
> 359 |       expect(r2.status()).toBe(409);
      |                           ^ Error: expect(received).toBe(expected) // Object.is equality
  360 |       expect(typeof body.message).toBe("string");
  361 |     });
  362 |   });
  363 | });
  364 | 
```