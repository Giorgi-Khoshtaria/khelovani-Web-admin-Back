# Senior Backend Code Review — Khelovani API
> Reviewed as of 2026-05-12 · Branch: develop

---

## Executive Summary

The architecture is solid. You have proper RBAC, Zod validation, Redis caching, role-separation, and centralised error handling. The issues below are not "beginner mistakes" — they are the gaps that separate a good project from a production-hardened one. Work through them in priority order.

---

## Priority 1 — Critical Security (Fix Before Any Public Launch)

### 1.1 `isMalicious()` is dead code — XSS risk
- **File:** `src/utils/isMalicious.ts` (utility exists), every controller that writes text fields (descriptions, addresses, website links)
- **Problem:** The helper was written but never called. Any user-supplied `description`, `address`, `website`, `tags`, `location` can contain `<script>` payloads that will render on the frontend.
- **Fix:** Call `isMalicious(value)` inside the Zod `.refine()` on every `z.string()` field that ends up in MongoDB. Do it in the schema, not the controller — then it's impossible to forget.

```ts
// validations/product.validation.ts
descriptionGe: z.string().refine(v => !isMalicious(v), 'Invalid content'),
```

### 1.2 Partner registration sends plaintext password via email
- **File:** `src/controllers/partners/registerPartner.ts`, `src/utils/email/sendPartnerEmail.ts`
- **Problem:** You generate a random password and email it in plaintext. If the email is intercepted (or stored in Brevo logs), the account is compromised before the partner logs in.
- **Fix:** Do not generate a password at all. Instead:
  1. Create the account with a locked/unusable password (e.g., a bcrypt of a random UUID).
  2. Send a "Set your password" link (same flow as user forgot-password).
  3. Partner sets their own password on first login.

### 1.3 No CSRF protection on state-changing endpoints
- **File:** `src/app.ts`
- **Problem:** CORS alone does not protect against CSRF from same-origin browser attacks or subdomain takeover. Any `POST`/`PATCH`/`DELETE` authenticated with a cookie is vulnerable.
- **Note:** If you are exclusively using `Authorization: Bearer` headers (not cookies), this is lower risk. Confirm your frontend never stores the JWT in a cookie. If it does, add `csurf` or switch to `SameSite=Strict` cookies with a token.

### 1.4 Test bypass header in production code
- **File:** `src/middleware/rateLimiter.ts`
- **Problem:** The header `x-test-bypass: khelovani-test-2026` disables rate limiting. If this code ships to production, anyone who finds the header can bypass all auth-endpoint rate limits.
- **Fix:** Wrap the bypass in a hard `process.env.NODE_ENV === 'test'` guard that is stripped at build time, or move it to a test-only middleware file that is never imported in `app.ts` in production.

---

## Priority 2 — High Impact Bugs & Missing Features

### 2.1 No pagination cap — DoS via large limit
- **Files:** All list controllers (products, partners, users, logs, etc.)
- **Problem:** A user can send `?limit=1000000` and exhaust your MongoDB cursor + memory.
- **Fix:** Add a utility and use it everywhere:

```ts
// src/utils/pagination.ts
export function parsePagination(query: { skip?: string; limit?: string }) {
  const skip = Math.max(0, parseInt(query.skip ?? '0', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
  return { skip, limit };
}
```

### 2.2 Race condition in email uniqueness check
- **Files:** `registerUser.ts`, `registerPartner.ts`
- **Problem:** You query `Model.findOne({ email })` then create. Two parallel requests at the same millisecond will both pass the check and hit the DB insert — one will throw an uncaught E11000.
- **Fix:** Remove the pre-check entirely. Just call `Model.create()` and let the unique index do its job. Catch `code === 11000` in the global error handler (you already have this) and return `409 EMAIL_ALREADY_EXISTS`. This is atomic and correct.

### 2.3 No admin action audit trail
- **Problem:** You log HTTP requests, but you cannot answer "who approved partner X on what date?" or "which admin deleted user Y?" This is a compliance and debugging gap.
- **Fix:** Add a lightweight `AdminAuditLog` collection:

```ts
// src/modules/adminAuditLog.ts
{
  adminId: ObjectId,
  action: string,        // 'PARTNER_APPROVED', 'USER_DELETED', etc.
  targetModel: string,   // 'Organisation', 'User', 'Product'
  targetId: ObjectId,
  meta: Mixed,           // before/after snapshot of changed fields
  createdAt: Date        // TTL: 90 days
}
```

Add a `logAdminAction(req, action, target)` helper and call it in every admin controller that mutates data.

### 2.4 No password reset for partners
- **File:** routes and controllers for partners
- **Problem:** Partners can be locked out with no recovery path except admin intervention.
- **Fix:** Add `POST /api/partner/forgot-password` and `POST /api/partner/reset-password` mirroring the user flow. Reuse the same token generation utility.

### 2.5 Multi-document operations without transactions
- **Files:** `deleteUser.ts`, `deletePartner.ts`, `clearFavorites.ts`, bulk delete controllers
- **Problem:** If you delete a partner and then fail deleting their products (network blip, crash), the DB is in an inconsistent state — orphaned products with no owner.
- **Fix:** Wrap related mutations in a Mongoose session:

```ts
const session = await mongoose.startSession();
try {
  await session.withTransaction(async () => {
    await Organisation.deleteOne({ _id: id }, { session });
    await Product.deleteMany({ owner: id }, { session });
  });
} finally {
  session.endSession();
}
```

---

## Priority 3 — Code Quality & Architecture

### 3.1 Controllers are doing too much
- **Files:** Several controllers are 80-120 lines mixing validation, business logic, DB calls, and cache invalidation.
- **Fix pattern:** Extract a service layer:

```
src/
  controllers/   ← HTTP layer only (parse req, call service, send res)
  services/      ← business logic (new layer)
  modules/       ← Mongoose models (stays)
```

Example: `getProducts` controller calls `ProductService.list(filters)`. The service handles pagination, filtering, owner checking, cache. This makes unit testing possible without HTTP.

### 3.2 No API versioning
- **File:** `src/app.ts`, all route files
- **Problem:** All routes are `/api/...` with no version prefix. When you need a breaking change, you have no migration path.
- **Fix:** Prefix all routes with `/api/v1/...` now, before you have mobile clients. Add a redirect from `/api/...` → `/api/v1/...` temporarily.

### 3.3 JWT contains mutable data that can go stale
- **File:** `src/middleware/authenticate.ts`
- **Problem:** The token embeds `permissions[]` and `allowedPanels[]`. If an admin changes a role's permissions, the partner's old token still carries the old permissions for up to 7 days.
- **Fix (short-term):** Shorten partner token TTL to 1 day.
- **Fix (long-term):** Store only `{ id, role }` in the JWT. Fetch permissions from Redis/DB on each request (cache with 5-min TTL keyed by roleId). This is the standard approach for RBAC systems.

### 3.4 Hardcoded secrets in seed files
- **File:** `src/utils/seeds/seedAdmin.ts`
- **Problem:** Default admin credentials may be hardcoded as fallbacks.
- **Fix:** Require `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars. Throw at startup if they are missing. Never have a default.

### 3.5 `deleteUserByEmail` route is unauthenticated
- **File:** Public routes → `DELETE /api/user/delete-by-email`
- **Problem:** This endpoint has no auth and no rate limit. Anyone who knows or guesses an email can delete the account. This looks like a development convenience that was never removed.
- **Fix:** Either delete this route entirely, or gate it behind admin authentication + `users.delete` permission.

### 3.6 Error messages partially hardcoded in English
- **Files:** Several controllers use hardcoded strings like `"Partner not found"` instead of `t('alerts.partner_not_found')`.
- **Fix:** Run a grep for `throw new AppError(` and verify every message routes through the translation system. The API already has the infrastructure — use it consistently.

### 3.7 `sharp` imported but image processing not applied server-side
- **File:** `package.json` (sharp is a dependency), upload controllers
- **Problem:** You're uploading original unprocessed images to Cloudinary. Sharp is installed but does the transformation happen before or after upload? If not at all, large raw uploads hit your Cloudinary bandwidth quota.
- **Fix:** Run images through Sharp before upload — resize to max dimensions (e.g., 1920px wide), convert to WebP, strip EXIF metadata (privacy).

---

## Priority 4 — Performance & Scalability

### 4.1 Cache invalidation is too broad
- **File:** `src/utils/cache/invalidators.ts`
- **Problem:** `invalidateProducts()` deletes all `products:*` keys. If you have 10,000 cached pages of products, one edit wipes everything and causes a thundering herd of DB queries.
- **Fix:** Invalidate specifically: `products:byId:{id}`, `products:list:*` (only list caches need clearing on create/delete, not on single-item edits).

### 4.2 No database indexes documented or verified
- **Problem:** Mongoose models define some indexes but there is no script to verify all required indexes exist in production. A missing index on a filtered/sorted field causes collection scans.
- **Fix:** Add an `ensureIndexes.ts` script run at startup (after connection) that calls `Model.syncIndexes()` and logs index creation. Critical indexes to verify:
  - `Product`: `{ category: 1 }`, `{ owner: 1 }`, `{ isShown: 1, pinSection: 1 }`, `{ createdAt: -1 }`
  - `Organisation`: `{ status: 1 }`, `{ isPinned: 1 }`
  - `RequestLog`: `{ createdAt: 1 }` (TTL index)
  - `Translation`: compound `{ namespace: 1, key: 1 }` (already exists — verify)

### 4.3 Request logger writes to MongoDB on every request
- **File:** `src/middleware/requestLogger.ts`
- **Problem:** Every HTTP request does a `RequestLog.create()`. Under load (1000 req/min), this is 1000 extra DB writes per minute. MongoDB can handle it, but it adds latency on the hot path.
- **Fix:** Buffer logs in memory (array) and flush to DB every 5 seconds, or use `insertMany`. Alternatively, log to stdout and use a log aggregator (Datadog, Logtail) to avoid coupling observability to your primary DB.

---

## Priority 5 — Developer Experience & Ops

### 5.1 No health check endpoint
- **Fix:** Add `GET /health` that returns `{ status: 'ok', db: 'connected', redis: 'connected', uptime: ... }`. Required for Docker/Kubernetes liveness probes and monitoring.

### 5.2 No API documentation
- **Fix:** Add `swagger-jsdoc` + `swagger-ui-express`. Document every route with request/response schemas. With Zod already in place, use `zod-to-openapi` to auto-generate schemas from your existing validators.

### 5.3 Docker start command is fragile
- **File:** `Dockerfile` CMD or `package.json` start script
- **Problem:** `tsx src/utils/seeds/seedRoles.ts && tsx index.ts` — if the seed fails (e.g., duplicate key on second deploy), the server never starts.
- **Fix:** Make seeds idempotent (upsert, not insert) and exit with code 0 on "already exists." Or separate seeding into a one-time init job, not the main startup.

### 5.4 No graceful shutdown
- **File:** `index.ts`
- **Problem:** `SIGTERM` (sent by Docker/Kubernetes on scale-down) kills the process immediately, dropping in-flight requests and open DB connections.
- **Fix:**

```ts
process.on('SIGTERM', async () => {
  server.close(async () => {
    await mongoose.connection.close();
    await redis.quit();
    process.exit(0);
  });
});
```

---

## Checklist Summary

| # | Issue | Priority | Effort |
|---|-------|----------|--------|
| 1.1 | Apply `isMalicious()` to all text fields | P1 | 1h |
| 1.2 | Remove plaintext password email → send set-password link | P1 | 3h |
| 1.3 | Confirm JWT-only auth (not cookies) or add CSRF | P1 | 1h |
| 1.4 | Guard test bypass header behind `NODE_ENV=test` | P1 | 30m |
| 2.1 | Cap `limit` at 100 on all list endpoints | P2 | 1h |
| 2.2 | Remove duplicate email pre-check, rely on unique index | P2 | 1h |
| 2.3 | Add `AdminAuditLog` collection + `logAdminAction` helper | P2 | 4h |
| 2.4 | Add partner forgot/reset password endpoints | P2 | 2h |
| 2.5 | Wrap multi-document deletes in Mongoose transactions | P2 | 3h |
| 3.1 | Extract service layer from controllers | P3 | 8h |
| 3.2 | Add `/api/v1/` versioning prefix | P3 | 2h |
| 3.3 | Store only `{id, role}` in JWT, fetch permissions from cache | P3 | 4h |
| 3.4 | Require seed admin credentials from env (no defaults) | P3 | 30m |
| 3.5 | Delete or protect `DELETE /api/user/delete-by-email` | P3 | 30m |
| 3.6 | Use translation system in all `throw new AppError()` calls | P3 | 2h |
| 3.7 | Process images with Sharp before Cloudinary upload | P3 | 2h |
| 4.1 | Targeted cache invalidation instead of pattern wipe | P4 | 2h |
| 4.2 | Verify and document all DB indexes | P4 | 1h |
| 4.3 | Buffer request logs, use `insertMany` | P4 | 1h |
| 5.1 | Add `GET /health` endpoint | P5 | 30m |
| 5.2 | Add Swagger/OpenAPI docs via `zod-to-openapi` | P5 | 4h |
| 5.3 | Make seed scripts idempotent | P5 | 1h |
| 5.4 | Add SIGTERM graceful shutdown | P5 | 30m |

---

## What Is Already Good (Don't Change)

- bcrypt with 10 rounds — correct
- Zod validation on every endpoint — correct
- `express-mongo-sanitize` — correct
- Helmet + Permissions-Policy — correct
- Rate limiting on auth endpoints — correct
- `asyncHandler` wrapper pattern — correct
- Global error handler catching all error types — correct
- Redis cache with `getOrSet` read-through pattern — correct
- Separate public/admin route files — correct
- `RequestLog` auto-TTL after 3 days — correct
- `isOperational` flag on AppError — correct

---

*Total estimated effort: ~45 hours of focused work. P1 items (~6h) should ship before your next public deploy.*
