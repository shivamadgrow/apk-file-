# External Services and APIs Needed Later

This document lists every third-party service or API the app will eventually need, what it is for, and which part of the product it supports.

Important:
- These are future integrations only.
- The current codebase is intentionally built to work locally with mock providers.
- No real credentials, SDK wiring, or live external calls are required right now.

---

## 1) SMS and OTP Service

Purpose:
- Send OTPs during login/signup.
- Support resend flow and delivery status tracking.

Used by:
- Authentication flow
- Account verification
- Login security

Examples of real providers later:
- Twilio
- MSG91
- Exotel
- Textlocal
- Fast2SMS

Future API responsibilities:
- Send OTP to mobile number
- Track delivery status
- Rate limit OTP requests
- Retry failed attempts

Current local mock:
- `MockSMSProvider`

---

## 2) PAN Verification Service

Purpose:
- Validate PAN format and, later, verify PAN against official records.

Used by:
- User registration
- KYC onboarding
- Loan application details

Examples of real providers later:
- PAN verification bureau or KYC platform
- Government-connected verification APIs (if licensed)

Future API responsibilities:
- Validate PAN format
- Confirm name / tax record status
- Return verification status: VERIFIED / FAILED / PENDING

Current local mock:
- `MockPanProvider`

---

## 3) Aadhaar / KYC Provider

Purpose:
- Verify identity through Aadhaar-based onboarding if legally allowed.
- Handle OTP verification, document checks, liveness, facial comparison, and consent flows.

Used by:
- Loan application onboarding
- KYC workflow
- User identity verification

Examples of real providers later:
- Aadhaar/KYC compliance vendor
- Identity verification platform
- Facial liveness / document verification platform

Future API responsibilities:
- Generate KYC session
- Send Aadhaar OTP
- Verify OTP
- Liveness check
- Document verification
- Return session status and final result

Current local mock:
- `MockKYCProvider`

---

## 4) Credit Bureau / Credit Score Provider

Purpose:
- Fetch official credit score and score factors from a bureau or authorized provider.

Used by:
- Credit score section
- Loan eligibility checks
- Risk analysis

Examples of real providers later:
- CIBIL-compatible bureau provider
- Credit reporting API provider
- Credit assessment vendor

Future API responsibilities:
- User consent capture
- Pull latest credit report / score
- Return score factors and summary
- Provide history and score insights

Current local mock:
- `MockCreditProvider`

---

## 5) Bank Verification Service

Purpose:
- Validate bank account details and account ownership.

Used by:
- Bank account screen
- Payout verification
- Loan disbursal / refund flows

Examples of real providers later:
- Account verification API
- UPI / bank account validation service
- Banking partner service

Future API responsibilities:
- Validate IFSC + account number
- Check account holder name consistency
- Return status: VERIFIED / PENDING / FAILED

Current local mock:
- `MockBankProvider`

---

## 6) Lender / NBFC / Loan Partner APIs

Purpose:
- Match users to lenders and send loan applications.
- Retrieve live offers and partner application IDs.

Used by:
- Loan application wizard
- Lender comparison page
- Lead distribution to NBFCs

Examples of real providers later:
- NBFC APIs
- Digital lender APIs
- Affiliate/partner marketplace APIs

Future API responsibilities:
- Get lender list
- Get loan offers based on amount and tenure
- Submit application to lender
- Return lender application ID and status

Current local mock:
- `MockLenderProvider`

---

## 7) Document Storage Service

Purpose:
- Store user documents securely.
- Support uploads, downloads, and authorization checks.

Used by:
- Document vault
- PAN, Aadhaar, bank, and loan document storage

Examples of real providers later:
- AWS S3
- Cloudflare R2
- Azure Blob Storage
- Google Cloud Storage

Future API responsibilities:
- Generate signed upload URLs or secure upload tokens
- Save metadata in Postgres
- Store file in private object storage
- Restrict access by user and permission role

Current local mock:
- Local filesystem upload in `server/src/routes/documents.js`

---

## 8) Push Notification / In-App Notification Service

Purpose:
- Notify users about OTPs, KYC updates, application status, and payout events.

Used by:
- Loan status updates
- Support notifications
- Security notifications

Examples of real providers later:
- Firebase Cloud Messaging
- OneSignal
- Push provider or email service

Future API responsibilities:
- Send push notifications
- Send email notifications
- Store notification metadata in DB
- Track read/unread state

Current local mock:
- Notification logic is still local / not yet fully implemented

---

## 9) Email Service

Purpose:
- Send registration emails, OTPs, support notices, and verification notifications.

Used by:
- Registration and account actions
- Business communication
- Support workflows

Examples of real providers later:
- SendGrid
- Mailgun
- Resend
- SES

Future API responsibilities:
- Send transactional emails
- Track delivery status
- Support templates

Current local mock:
- Not yet implemented, intended to be mocked later

---

## 10) E-Sign / Digital Signature Provider

Purpose:
- Facilitate loan agreement signing and document consent.

Used by:
- Final loan agreement flow
- Digital signing consent

Examples of real providers later:
- E-sign platform
- Digital agreement platform

Future API responsibilities:
- Create signing request
- Send signing URL
- Confirm completion
- Return signed document metadata

Current local mock:
- Not yet implemented, provider ready for future interface work

---

## 11) Affiliate / Referral / Lead Network Services

Purpose:
- Track referral activity and send partners conversion data.

Used by:
- Referral and affiliate modules
- Lead generation / commissions
- Partner conversion tracking

Examples of real providers later:
- Affiliate network platform
- Partner tracking service
- Lead marketplace API

Future API responsibilities:
- Create affiliate link
- Track click / conversion
- Record partner status
- Pay out commission when conversion occurs

Current local mock:
- Logic should be simulated locally in the backend

---

## 12) Payment and Payout Gateway

Purpose:
- Handle payouts, refunds, or collections if required by the product.

Used by:
- Commission disbursal
- Refund flows
- Payout modules

Examples of real providers later:
- Razorpay
- Stripe
- Cashfree
- Plaid-like payout partners

Future API responsibilities:
- Create payout
- Verify transfer status
- Handle refund callback
- Store transaction metadata

Current local mock:
- Not implemented yet; should be added as a future provider interface

---

## 13) Monitoring and Observability Services

Purpose:
- Track app health, API performance, logs, and alerts.

Used by:
- Production monitoring
- Error tracking
- Performance dashboards

Examples of real providers later:
- Sentry
- Datadog
- New Relic
- CloudWatch
- Grafana / Prometheus stack

Future API responsibilities:
- Collect application logs
- Monitor latency and errors
- Alert on outages or abnormal usage

Current local mock:
- Winston logger + Prometheus metrics are included locally

---

## 14) Database / Hosting / Cloud Infrastructure

Purpose:
- Run Postgres and application services in a cloud environment.

Used by:
- Production backend deployment
- Database persistence and backups
- App hosting and scaling

Examples of real providers later:
- Railway
- Render
- DigitalOcean
- AWS EC2 / RDS
- Azure App Service / Postgres
- Vercel / Supabase / Neon / Fly.io

Future responsibilities:
- Managed Postgres
- Automated backups
- Scaling and uptime management
- CI/CD deployment

Current local mock:
- Local Postgres with Prisma is used for dev setup

---

## 15) Backup and Disaster Recovery Tools

Purpose:
- Preserve database backups and critical files.

Used by:
- Production resilience
- Recovery in case of outage or accidental data loss

Examples of real providers later:
- Managed DB backups
- Object storage backup buckets
- Snapshot-based backup providers

Future responsibilities:
- Daily/weekly dumps
- Secure offsite storage
- Restore verification

Current local mock:
- `server/scripts/backup.sh` is a local database backup script

---

## Summary of future external dependencies

The app will eventually need these categories of external services:

1. SMS / OTP delivery
2. PAN verification
3. Aadhaar / KYC identity verification
4. Credit bureau score provider
5. Bank verification provider
6. Lender / NBFC APIs
7. Object storage for documents
8. Push/email notification provider
9. E-sign provider
10. Affiliate/referral partner integration
11. Payment / payout gateway
12. Monitoring / observability tool
13. Cloud hosting + Postgres management
14. Backup and disaster recovery system

---

## Current architecture principle

The backend is intentionally designed around provider interfaces so future real providers can be swapped in without rewriting core business logic.

Examples:
- `SMSProvider`
- `PANVerificationProvider`
- `KYCProvider`
- `CreditScoreProvider`
- `BankVerificationProvider`
- `LenderProvider`
- `StorageProvider`
- `NotificationProvider`
- `ESignProvider`

The current app uses only local mock implementations and is fully functional without internet or provider accounts.
