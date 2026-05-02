# Partner Registration — Refactor + Test Hardening Plan

Scope: review the new partner-registration logic across controller / model / route, then deliver a senior-QA-grade test pass that proves behavior end-to-end (DB + API + i18n), not just status codes. Add physical-person (INDIVIDUAL) coverage, kill non-deterministic real-email tests, then refactor twice — once after first green, and once after coverage is added.

Working files (verified to exist):
- [src/controllers/partners/registerPartner.ts](src/controllers/partners/registerPartner.ts)
- [src/modules/organization.modules.ts](src/modules/organization.modules.ts)
- [src/routes/partner.routes.ts](src/routes/partner.routes.ts)
- [src/validations/schemas/partner/partnerAuth.schema.ts](src/validations/schemas/partner/partnerAuth.schema.ts)
- [tests/api/partner/auth/suites/](tests/api/partner/auth/suites/)
- [tests/constants/endpoints.ts](tests/constants/endpoints.ts)

---

## Phase 0 — Snapshot the current state (don't trust, verify)

Before changing anything, run the full partner suite and capture which tests *currently* pass, fail, or flake. A "passing" test on top of broken logic is the failure mode we are trying to prevent.

- `npx playwright test tests/api/partner/auth --reporter=list` (record output)
- `npx playwright test tests/api/admin/partners --reporter=list`
- Note any tests that pass for the wrong reason (assert only `res.status()` with no body/DB check) — list them in `PLAN.md` as "tests to harden in Phase 4".

Exit criteria: a written baseline of green/red, with the suspect-but-green tests flagged.

---

## Phase 1 — Review the registration stack (controller / model / route)

Confirm each layer matches the contract in [partnerAuth.schema.ts:159-161](src/validations/schemas/partner/partnerAuth.schema.ts#L159-L161) (discriminated union on `partnerType`).

### 1.1 Controller — [registerPartner.ts](src/controllers/partners/registerPartner.ts)
Audit checklist:
- [ ] `data.email.toLowerCase()` runs before the duplicate check — but `data.email` comes from validated body; confirm zod has already trimmed. Currently the schema trims, so `.toLowerCase()` alone is enough. Remove the duplicate `.trim().toLowerCase()` on line 71 (already lower-cased).
- [ ] Branch on `PartnerTypeEnum.INDIVIDUAL` is correct, but the fallback "anything else → ORGANIZATION" ([line 34-36](src/controllers/partners/registerPartner.ts#L34-L36)) is dead code now that the schema is a `discriminatedUnion` — the request can't reach the controller without a valid `partnerType`. Replace with a strict equality.
- [ ] `data.contactPerson.trim()` ([line 67](src/controllers/partners/registerPartner.ts#L67)) will throw on INDIVIDUAL because contactPerson is undefined. Already guarded by the ternary, but assert with a unit-style assertion to make the invariant explicit.
- [ ] Random password is hashed but never returned or emailed. Confirm with product whether the partner is supposed to receive credentials — if yes, this is missing functionality and a hidden bug; flag in PLAN, do not silently fix.
- [ ] Error keys `org_code_exists` / `personal_number_exists` resolve in all three locales — verify in [src/utils/seeds/seedTranslation.ts](src/utils/seeds/seedTranslation.ts).

### 1.2 Model — [organization.modules.ts](src/modules/organization.modules.ts)
- [ ] `addressEn` is `required: true` ([line 65](src/modules/organization.modules.ts#L65)) but the *update* schema marks it optional — fine for create, but document the asymmetry.
- [ ] `identificationCode` and `personalNumber` both `unique + sparse` — good. Verify the index actually exists in Mongo (`db.organisations.getIndexes()`); a sparse unique index that wasn't built will let dupes through silently.
- [ ] No compound index on `(partnerType, status)` despite `getPublicPartners` likely filtering on both — flag for perf review, do not change in this PR.

### 1.3 Route — [partner.routes.ts](src/routes/partner.routes.ts)
- [ ] `validate(partnerRegistrationSchema)` runs before `twoMinutesLimiter`? It runs after — meaning rate-limit fires on malformed payloads too. Acceptable, but document.
- [ ] No `helmet`/CSRF concern at this layer (handled globally), but confirm `express.json` size limit is set so a 50 MB body can't OOM the process before zod sees it.

Exit criteria: a reviewed checklist with each item ✅ or "flagged-not-fixed" with a one-line reason.

---

## Phase 2 — Remove dynamic real-email logins from tests

Problem: [partnerRegistrationHappyPath.suite.ts:14](tests/api/partner/auth/suites/partnerRegistrationHappyPath.suite.ts#L14) and the user-registration suite both pull from `REAL_EMAILS` at random and rely on `DbHelper.deletePartnerByEmail` to clean up. This is non-deterministic and couples test outcomes to a shared DB. It also leaks PII into the test fixtures.

Action:
- [ ] Replace every `REAL_EMAILS[…]` pick in tests with `randomEmail()` from [tests/helpers/utils/generators.ts](tests/helpers/utils/generators.ts).
- [ ] Delete the `REAL_EMAILS` export from [tests/constants/endpoints.ts:29-35](tests/constants/endpoints.ts#L29-L35) once no test imports it (`grep -r REAL_EMAILS tests/` must be empty).
- [ ] Keep the email-sending integration test (if any) behind an opt-in env flag (`E2E_REAL_EMAIL=1`), default skipped.
- [ ] In `registration.helpers.ts`, the `randomEmail()` default is already correct — no change needed there.

Senior-QA note: a test that depends on a real inbox is not a unit/API test — it's a manual smoke. Move it out of CI or gate it explicitly.

Exit criteria: full partner+user auth suite passes 10× in a row (`for i in {1..10}; do npx playwright test tests/api/partner/auth tests/api/user/auth || break; done`). Flake = 0.

---

## Phase 3 — Add INDIVIDUAL (physical-person) registration

The schema and controller already branch on `PartnerTypeEnum.INDIVIDUAL` but there is **no happy-path or validation coverage** for it. This is the highest-value gap.

### 3.1 Test fixture
- [ ] Add `DEFAULT_INDIVIDUAL_PARTNER` to `tests/constants/endpoints.ts`: same shape as `DEFAULT_PARTNER` but `partnerType: "individual"`, `personalNumber: "12345678901"` (11 digits), no `identificationCode`, no `contactPerson`.
- [ ] Extend `registerPartnerAndTrack` to accept a `kind: "org" | "individual"` selector that picks the right defaults and the right unique-id field (`identificationCode` vs `personalNumber`).
- [ ] Extend `CreatedPartner` cleanup in the fixture to delete by `personalNumber` too.

### 3.2 New suite — `partnerIndividualRegistration.suite.ts`
Cover (one assertion per behavior, no mega-tests):
1. `201` happy path — body returns `partner._id` and lowercased email.
2. DB row was actually created with `partnerType === "individual"`, `personalNumber` set, `identificationCode` undefined, `password` is a bcrypt hash (`/^\$2[aby]\$/`), `status === "PENDING"`, `role` populated to ORGANISATION role. **This is the senior-QA bit — assert the persisted row, not just the response.**
3. Duplicate `personalNumber` returns `409` with i18n key `personal_number_exists` in `ge` and `en`.
4. Duplicate `email` across an existing ORGANIZATION returns `409` (cross-type email uniqueness).
5. Sending `identificationCode` on an INDIVIDUAL payload is rejected by zod with `400` (discriminated union strictness).
6. Sending `contactPerson` on an INDIVIDUAL payload is rejected (or stripped — assert whichever the schema actually does; current schema does not list `contactPerson` on `individualBranch`, so zod will pass it through unless `.strict()` is used — flag this and decide).
7. `personalNumber` validation: 10 digits → 400, 12 digits → 400, letters → 400, leading zeros allowed.

### 3.3 Wire into spec
- [ ] Import the new suite in `tests/api/partner/auth/registration.api.spec.ts`.

Exit criteria: new suite green, and a deliberate one-character mutation in the controller's INDIVIDUAL branch turns at least one test red (mutation test by hand).

---

## Phase 4 — Validation tests (organization + individual)

Audit existing [partnerRegistrationValidation.suite.ts](tests/api/partner/auth/suites/partnerRegistrationValidation.suite.ts) and [partnerFieldValidation.suite.ts](tests/api/partner/auth/suites/partnerFieldValidation.suite.ts). For each rule in [partnerAuth.schema.ts](src/validations/schemas/partner/partnerAuth.schema.ts), there must be:

- one **negative** test (the rule rejects bad input → 400 with the exact zod message key), and
- one **boundary** test (one char under min, one over max, exactly at the limit).

Matrix to fill (mark ✅ = covered, ❌ = missing — fill in during Phase 0 audit):

| Field            | Negative | Boundary | i18n key asserted |
|------------------|----------|----------|-------------------|
| companyNameGe    |          |          | name_ge_*         |
| companyNameEn    |          |          | companyNameEn_*   |
| phone            |          |          | phone_invalid     |
| city enum        |          |          | (zod default)     |
| email format     |          |          | email_invalid     |
| address GE regex |          |          | address_needs_georgian |
| addressEn regex  |          |          | addressEn_needs_english |
| identificationCode regex | |          | id_code_invalid_org |
| personalNumber regex |     |          | id_number_invalid |
| categories min/max |       |          | category_required / category_too_many |
| terms === true   |          |          | terms_required    |
| website https    |          |          | website_invalid   |

Senior-QA rule: assert on `body.errors[i].message` (the i18n key), not just `res.status() === 400`. A schema rename that breaks the contract must turn a test red. Status-only assertions are why "tests pass but logic is broken" happens.

Exit criteria: every row has ✅ in both columns; every test asserts the specific message key.

---

## Phase 5 — Refactor pass #1 (after Phase 2-4 are green)

Now that behavior is locked by tests, refactor with a safety net:

- [ ] Extract the unique-field check in `registerPartner.ts` into a small helper: `assertUniqueIdentity(partnerType, data, t)` — single source of truth, easy to extend.
- [ ] Move random-password generation into `src/utils/auth/generateTempPassword.ts` (currently inline crypto). Reuse in admin "create partner" flow if it exists.
- [ ] Replace the `... data.x?.trim()` ladder with a `pickPartnerFields(data)` helper that the schema-validated input shapes; the controller should not be doing field plumbing.
- [ ] Tighten zod with `.strict()` on both branches so `contactPerson` on INDIVIDUAL is a 400, not silently dropped — only do this if Phase 3.2 test #6 confirms current behavior.

Run the full partner suite after each extraction. Any red = revert that specific extraction.

---

## Phase 6 — Refactor pass #2 (final polish)

- [ ] Re-read the diff with fresh eyes. Delete dead code (the old fallback on [registerPartner.ts:34-36](src/controllers/partners/registerPartner.ts#L34-L36)).
- [ ] Re-run the 10× flake check.
- [ ] Re-run `npx tsc --noEmit` and `npm run lint`.
- [ ] Manually hit `POST /api/partner/register` once for each partnerType against a local server with curl, inspect the Mongo doc, confirm the password hash decodes with bcrypt.

---

## Acceptance criteria (definition of done)

1. ✅ Phase 0 baseline written into PR description.
2. ✅ No test imports `REAL_EMAILS`; `grep -r REAL_EMAILS tests/` returns empty.
3. ✅ INDIVIDUAL happy path + 409 + 400 cases all assert on the persisted DB row, not just the response.
4. ✅ Validation matrix has 100% ✅, every assertion checks the i18n message key.
5. ✅ Full `tests/api/partner` + `tests/api/admin/partners` suite green 10 consecutive runs.
6. ✅ A manual mutation in `registerPartner.ts` (e.g., swap `INDIVIDUAL` and `ORGANIZATION` in the type guard) turns ≥3 tests red — proves the suite has teeth.
7. ✅ `tsc --noEmit` and lint clean.
8. ✅ No production code change is unprotected by at least one test asserting *behavior* (DB state or i18n message), not just HTTP status.

## Anti-patterns to avoid (what "passes but doesn't work" looks like)

- Asserting only `res.status()`. A 201 means nothing if the row wasn't written.
- Re-using a global email — one parallel run flakes the whole suite.
- `expect(body).toBeDefined()` — passes for `{}`. Always assert specific fields.
- `try { ... } catch { /* ignore */ }` in test cleanup — masks the real failure on the next run.
- Snapshot tests against a translated message string — couples tests to copy. Assert the i18n key instead, then translate at the boundary.
- Mocking Mongoose in registration tests — defeats the purpose. These are API/integration tests; hit the real test DB.
