# Public Account-Deletion Web Page — Requirements for the Website Owner

Google Play's account-deletion policy requires a publicly accessible web path for
requesting account deletion, reachable **without reinstalling the app**, in addition
to the in-app path already built (`DELETE /api/users/me` in the Android app's Profile
screen). This document specifies the smallest page/flow that satisfies it, written
for whoever implements it on the website — **no website/CRM files were touched by
this engagement**, and no backend changes are needed either (see below).

## The good news: no new backend endpoint is required

The backend already exposes everything this page needs:
- `POST /api/auth/send-otp` — public, sends an OTP to a phone number.
- `POST /api/auth/verify-otp` — public, verifies the code and returns a short-lived
  access token for that account.
- `DELETE /api/users/me` — requires that access token, plus a second fresh OTP code as
  reauthentication (see "Identity verification" below), and performs the actual
  deletion.

All three already exist and are tested (`paisa/server/tests/account-deletion.test.js`).
The website only needs a new **page**, not a new API.

## Suggested URL

`https://paisainminutes.com/delete-account` (or `/account-deletion`) — linked from the
Privacy Policy page and from the app's own Profile screen, per Google's "readily
discoverable" requirement.

## Page flow

1. **Enter phone number.** The page calls `POST https://api.paisainminutes.tech/api/auth/send-otp` with `{ phone }`.
2. **Enter the OTP.** The page calls `POST .../api/auth/verify-otp` with `{ phone, code }`. On success, it receives `{ token, refreshToken }` — hold `token` in memory only (never in localStorage/a cookie that outlives this page), since it's only needed for the next step.
3. **Confirm deletion.** Show the same disclosure the Android app shows (see below), require an explicit "Yes, delete my account" action (not pre-checked), then:
   - Call `POST .../api/auth/send-otp` again (a second, fresh OTP — this is the reauthentication step `DELETE /api/users/me` requires).
   - Prompt for that second code.
   - Call `DELETE .../api/users/me` with `Authorization: Bearer <token from step 2>` and body `{ code: <second OTP> }`.
4. **Show the result.** On `{ ok: true, deletedAt }`, show a confirmation screen with no further action needed. On an error (expired/wrong code, rate-limited — `429` after 5 attempts/hour, or a `503` if the backend is temporarily down), show the backend's `error` message and let the user retry.

## Identity verification and abuse prevention

- Already handled server-side: OTP send is rate-limited (30/10min), OTP verify requires the correct code within 10 minutes and ≤5 attempts, and the deletion endpoint itself is separately rate-limited to 5 attempts/hour per account.
- The page itself needs no additional abuse prevention beyond standard bot mitigation on the phone-entry step (e.g., a CAPTCHA if abuse is observed) — that's a website-team decision, not something the backend requires.

## What gets deleted vs. retained (and why)

Exactly what the in-app flow does, because it's the same endpoint:
- **Deleted immediately:** name, email, PAN, city, state, pincode, saved bank account details, and every active login session (all refresh tokens revoked).
- **Retained:** loan applications and credit-score check history, as financial/compliance records — **this retention policy is a business/legal decision, not something this documentation asserts is legally required; it should be confirmed with counsel**, but the code already implements "retain the transaction record, scrub the personal profile" as the current behavior.
- If this phone number is used to log in again later, it starts fresh (no old profile data reappears) — the backend has a specific protection (`User.reactivatedAt`) ensuring a different person who later gets this phone number reassigned to them can never see the previous owner's retained records.

## User communication

- Immediately after deletion: on-screen confirmation (see above). No email is sent automatically today — if the business wants an email receipt, that would need the account's email captured before deletion (it's deleted as part of the process) or a separate notification step added before the delete call.
- No further communication exists today for the retained records — if the business wants to tell users how long records are retained, that number needs to come from the business/legal decision noted above, not invented by this page.

## Error states to design for

| Situation | Backend response | Suggested page behavior |
|---|---|---|
| Phone not found / never registered | `send-otp` still returns `ok:true` (it doesn't reveal whether an account exists) | Proceed normally — if the OTP verify then fails because there's truly no account, the subsequent step will fail cleanly |
| Wrong/expired OTP | `400` | "That code is incorrect or expired — request a new one" |
| Too many attempts | `429` | "Too many attempts — try again in an hour" |
| Backend temporarily down | `503` | "Something went wrong on our end — try again shortly" |
| Already deleted / no active session | `401` on the DELETE call | Treat as already-deleted; show the confirmation screen |

## Testing before this is considered done

Per the audit's instruction, this requirement is **not satisfied until the page
actually exists and has been tested** — this document is preparatory work, not a
substitute for building and testing the page.
