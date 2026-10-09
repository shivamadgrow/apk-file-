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
