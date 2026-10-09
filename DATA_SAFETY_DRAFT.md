# Data Safety Form — Draft Inventory (code-verified facts only)

This is a draft to help whoever fills out Google Play Console's Data Safety form. It
distinguishes what's **verified by reading the actual code** (this engagement) from
what **needs business confirmation** (retention periods, third-party legal terms,
etc.). It is not a substitute for actually filling out and submitting the form, which
this engagement does not do.

## Data collected and sent off-device

| Data type | Collected where | Sent to | Purpose | Shared with a third party? | Encrypted in transit? |
|---|---|---|---|---|---|
| Phone number | OTP login (`AuthModal.jsx`) | Backend (`api.paisainminutes.tech`) | Account identity, OTP verification | No (not sent to the partner lender by this app — see note below) | Yes (HTTPS) |
| Name, email, city, state, pincode | Profile edit, loan enquiry | Backend | Account profile, loan enquiry | Yes — with the lending partner selected, only after the user's explicit consent checkbox | Yes |
| PAN (optional) | Profile edit, loan enquiry | Backend | Loan enquiry prefill | Yes — same as above | Yes |
| Income/salary, loan amount, tenure, employment, purpose | Loan application wizard | Backend | Loan enquiry / partner matching | Yes — same as above | Yes |
| Credit score | Credit Score screen, **only after an explicit separate consent checkbox** | Backend → credit bureau | Show the user their own score | No — bureau response is not shared onward to any lending partner by this app | Yes |

**Note on partner sharing:** this app never sends the phone number, name, or any
profile field directly to a partner lender's URL (confirmed — the partner redirect
URL only ever contains a backend-generated lead reference code, see
`buildPartnerRedirectUrl` in `src/services/api.js`). The backend may share the
underlying lead record with the partner through its own server-to-server integration
once the user is redirected — that's a backend/business relationship, not something
this Android client does directly, and the exact mechanics of what the backend sends
each partner were not re-verified in this pass (see `paisa/server/src/lib/delivery.js`
if that needs independent confirmation).

## Data NOT collected (confirmed by code, not assumed)

- Contacts, SMS content, call logs, precise or coarse location, camera/photos,
  installed-app list, device identifiers (IMEI etc.) — none of these are requested,
  read, or have any corresponding manifest permission (confirmed: the manifest only
  declares `INTERNET` and `ACCESS_NETWORK_STATE`).
- No advertising ID, no analytics SDK, no crash-reporting SDK, no third-party
  attribution SDK — `package.json` has no such dependency.
- Aadhaar number/OTP — not collected by this app (the in-app privacy disclosures were
  corrected this session to stop claiming otherwise; Aadhaar KYC happens on the
  partner's own site after redirect).

## Deletion

- In-app: `DELETE /api/users/me`, OTP-reauthenticated — deletes/scrubs profile PII,
  saved bank accounts, and all sessions.
- Public web path: **not yet built** — see `ACCOUNT_DELETION_WEB_REQUIREMENTS.md`.
  The Data Safety form's account-deletion section cannot be marked complete until
  that page exists.

## Retention

- Loan applications and credit-score history are retained after account deletion as
  financial/compliance records. **The specific retention period is not defined
  anywhere in the code and needs a business/legal decision** — do not state a number
  on the Data Safety form until one is confirmed.

## Items requiring business confirmation before submitting the form

1. Exact retention period for retained financial records (see above).
2. Whether the backend's server-to-server partner integration (`delivery.js`) sends
   any additional fields to partners beyond what's described here — recommend an
   independent review of that file specifically for the Data Safety form, since it
   wasn't the focus of this Android-side session.
3. Whether any partner or infrastructure provider (hosting, SMS gateway) should be
   separately disclosed as a data processor on the form — this needs the business's
   vendor list, not something inferable from this codebase.
