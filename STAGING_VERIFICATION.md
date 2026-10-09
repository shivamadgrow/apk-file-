# Staging / Production Verification Checklist

Everything in Batches 1–3 has been verified at one of these three levels. They are not
the same thing, and none of them substitutes for the others:

- **Mocked/unit test** — backend route tested against a real, disposable local test
  database (see `paisa/server/tests/`), with real SMS/bureau providers swapped for
  mocks. Proves the route's own logic is correct in isolation.
- **Source-level verification** — the Android client's request shape was read and
  compared line-by-line against the backend's actual route/validation code. Proves
  the two *should* agree, assuming the deployed backend matches the checked-out source.
- **Staging verification** — nobody has done this yet. It means actually running the
  Android app (or equivalent HTTP calls) against the real `https://api.paisainminutes.tech`
  deployment and observing real responses.

No staging or production verification has been performed in this session, by design —
no real OTP has been sent, no real lead created, no real bureau call triggered. The
checklist below is what to run, in order, before trusting the live integration.

## Setting up a safe staging environment (2026-10-09 addition)

**Confirmed from source: no staging environment exists today.** `api.paisainminutes.tech`
is production; the only other configured environment is the local `.env.test` used by
automated unit tests (a disposable database on `127.0.0.1`, deliberately refused to run
anywhere else — see `scripts/test-db-setup.js`'s safety guard). Building real staging
infrastructure is a deploy/ops decision outside this engagement's scope — this section
documents exactly what it needs, based on what the code actually supports today.

**1. Separate backend + database.** Deploy another copy of `paisa/server` pointed at its
own `DATABASE_URL` (a separate MongoDB, ideally also a replica set — Prisma's Mongo
connector needs one for transactions, same as the local test setup). Never point a
staging deployment at the production `DATABASE_URL`.

**2. Avoid real SMS without inventing a sandbox.** The code already has a built-in test
double for this: when `NODE_ENV=test`, `src/routes/auth.js`'s `sendProvider()` swaps in a
mock that always "succeeds" with no real SMS, and the OTP response includes
`debug: { code }` so a script can read the code without a real phone. **Caveat:** that
same flag also disables the persisted rate limiters by default (`skipInTest` in
`src/middleware/rateLimit.js`, overridable with `TEST_RATE_LIMIT=1`) — so a staging run
under `NODE_ENV=test` verifies logic correctly but is not a faithful rehearsal of
production rate-limiting unless `TEST_RATE_LIMIT=1` is also set. There is no dedicated
`NODE_ENV=staging` mode in the code today; introducing one (to get the OTP mock without
disabling rate limits) would be a small, safe backend change if this matters to you —
not made here, since it wasn't asked for and is a judgment call about test fidelity.
If a real sandbox/test credential exists with the actual SMS provider (Pinnacle), that
is the more faithful option and needs no code change — just different env values.

**3. Avoid real credit-bureau inquiries.** There is no test/sandbox mode for the CIBIL
integration (`src/lib/providers/cibil.js`) — it always attempts a real call if
`Cibil_Auth_Key`/`CIBIL_API_URL` are set. **Recommendation: leave those two variables
unset in staging.** The provider's own error-mapping already treats a missing/
unconfigured key as `providerStatus 404` → "not configured," which the intake code
whitelists as a non-error ("Pending Bureau Whitelist") rather than a loud failure — so
this safely exercises every *error-handling* path (which is what Task 2 actually asks
to verify) without ever reaching the real bureau. Getting a genuine bureau-sandbox
credential (if SmartAuth/CIBIL offers one) is a business conversation, not something
this session can arrange.

**4. Avoid real partner webhooks.** `AffiliatePartner.apiEnabled`/`apiEndpoint` control
whether a click triggers a server-to-server push to a partner (`src/routes/
partnerPublic.js`'s `handleClick`). **For a staging database, simply don't set these
fields on any seeded partner row** (they default to `apiEnabled: false`), or seed
staging with partner rows that have a harmless `redirectUrl` (e.g., pointing at a
request-inspection URL like webhook.site) instead of copying the real partner URLs from
`config/partners.php`. Never run `scripts/seed-config.js --apply` against a staging DB
using the real website's files unless you first edit the resulting rows to disable
`apiEnabled` and point `redirectUrl` somewhere harmless — otherwise a "staging" click
could really reach a partner.

**5. Android device/emulator.** None was available in this sandbox (no `emulator`
binary, no connected device). A real test needs either a physical Android device
(API 22–36, matching `minSdkVersion`/`targetSdkVersion`) or an emulator image — install
one via `sdkmanager "system-images;android-36;google_apis_playstore;x86_64"` plus
`avdmanager create avd` (both tools are already present in this environment's SDK, just
no image was fetched, since no test in this round needed to run the actual app).
Point the Android build at the staging backend via `VITE_API_URL` (see `src/services/
api.js` — it already reads this env var with the production URL as fallback).

**6. Test accounts.** A staging run needs: at least one fresh phone number with no prior
`User` row in the staging DB (to test new-user signup), one phone number with an
existing profile (to test returning-user login), and — if testing account deletion's
`reactivatedAt` protection meaningfully — the ability to manipulate `createdAt`
timestamps directly in the staging DB (same technique the backend's own tests use).

## Before you start

- Use a test phone number you control, not a real customer's number.
- Watch the CRM (or ask whoever operates it) to confirm each step below actually shows
  up there — the backend's `recordAudit` calls and CRM dashboards are the simplest way
  to confirm server-side state without needing direct DB access.
- Do **not** run the credit-score or callback steps against a real person's data.

## Checklist

1. **OTP send** — Request an OTP from the Android app's login screen. Confirm an SMS
   actually arrives (this exercises the real Pinnacle SMS integration, which the test
   suite mocks out — this is the first time it's genuinely tested end to end).
2. **OTP verify** — Enter the code. Confirm you land on a logged-in state, and that
   `GET /users/me` (visible in Profile) shows the expected (initially blank) profile.
3. **Token refresh** — Leave the app logged in; force an access-token expiry (wait 15+
   minutes or manually clear just the access token in a debug build) and perform any
   authenticated action. Confirm it succeeds transparently (the silent-refresh-and-retry
   logic in `api.js` should mean you never see a failure).
4. **Logout** — Log out, then confirm the old refresh token is dead: attempting the app's
   refresh flow with it afterward should fail (fine to confirm this in a REST client
   instead of the app).
5. **Profile update** — Edit your name/email/city/PAN from the new Edit Profile screen.
   Confirm the change is visible on next login and in the CRM.
6. **Loan application submission** — Go through the loan wizard to the "Submit & View
   NBFC Offers" step. Confirm a lead actually appears in the CRM with the fields you
   entered, and that submitting twice in a row does not create two separate leads
   (the backend's documented dedupe window is 2 minutes).
7. **Application history** — Confirm the Track tab's new history list shows that real
   submission with its real status and leadCode, not a placeholder.
8. **Partner redirect** — From either the wizard or the standalone "9 Lending Partners"
   tab, tap Apply Now on a partner. Confirm the new tab actually lands on that partner's
   real site (not a 404 from the backend's redirect endpoint — a 404 there means the
   slug in `src/data/mockData.js` doesn't match a real `AffiliatePartner.slug` in the
   production database, which would need reconciling before this can be trusted further).
9. **Credit score consent + error handling** — Tick the consent checkbox and run a real
   check. Confirm a real score (or an honest "no record found" / rate-limited message)
   appears — never a plausible-looking fallback number.
10. **Callback submission** — Submit a call-back request from the support chat. Confirm
    it actually appears in the CRM's contact/lead inbox.
11. **Account deletion** — On a throwaway test account, go through Delete Account.
    Confirm in the CRM/DB that the profile fields are scrubbed, refresh tokens are
    revoked (the app should be logged out everywhere), and that any loan application
    that test account submitted is still present (retained, not deleted).

## What's still outside this checklist's reach

- Whether the live `CORS_ORIGINS` configuration actually allows the Android app's
  runtime origin (flagged since Batch 1 as unverifiable from source).
- Whether the production `AffiliatePartner` table's slugs actually match the 9 slugs
  hardcoded in `src/data/mockData.js` (step 8 above is the only way to find out).
- Legal/business facts (lender licensing, data retention periods) — not verifiable by
  running the app at all.
