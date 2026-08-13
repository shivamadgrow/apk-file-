# Future Plan for APIs and Production Readiness

This document lists short-term and long-term tasks needed before moving the backend to production.

## Security & Auth
- Replace mock OTP with real SMS provider integration via `SMSProvider` implementation.
- Store refresh tokens securely; consider rotating refresh token storage and using hashed tokens.
- Implement refresh token revocation list / device sessions.
- Add rate-limiting across critical endpoints (already present), increase rules for auth endpoints.
- Harden JWT secrets and use asymmetric signing if needed.
- Implement MFA if required.

Required env vars:
- `JWT_SECRET` (required)
- `REFRESH_TOKEN_SECRET` (optional if hashing)
- `ENCRYPTION_KEY` (32 bytes) for encrypting sensitive fields

## Providers (Mock -> Real)
For each provider choose provider, obtain credentials, and implement under `server/src/lib/providers/{provider}/`.
- SMSProvider: env `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_API_SECRET`
- PANVerificationProvider: `PAN_API_KEY`
- KYCProvider: `KYC_API_KEY`, `KYC_WEBHOOK_SECRET`
- CreditScoreProvider: provider credentials
- LenderProvider: API credentials and webhooks
- StorageProvider: S3/R2 credentials

## Data & DB
- Add migrations, backups, and automated DB snapshots.
- Encrypt sensitive fields at rest (account numbers, PAN) and limit access.
- Implement data retention and deletion policies.

## Monitoring & Logging
- Integrate centralized logging (ELK / Datadog / Seq) — replace console winston transports.
- Configure Prometheus scraping for `/metrics` and set alerts.

## Backups
- Automated pg_dump or filesystem backups; store encrypted backups offsite.

## CI/CD and Deployment
- Add Dockerfile and docker-compose for local/dev.
- Add GitHub Actions workflows to run tests and migrations.
- Add infra IaC (Terraform) for cloud resources.

## Handoff Notes
- All provider interfaces are in `server/src/lib/providers/`. Replace `mock*` with real implementations.
- See `server/.env.example` for required env vars.
