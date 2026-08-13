What would you like me to do next — implement these APIs, scaffold a backend, or extract a prioritized API spec?

---

Status: I started scaffolding a local backend in `server/` with:
- Express server and routes
- Prisma schema and seed script
- Mock provider layer (SMS, PAN, KYC, Credit, Lender)
- Document upload using local filesystem
- Swagger UI at `/api/docs`
- Tests for auth flow

Run instructions (server root):

```bash
cd server
# install
npm install
# copy .env example
cp .env.example .env
# run prisma migrate (requires a local Postgres)
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

I will continue wiring more endpoints and provider docs if you want.
1. What the current scaffold contains

I found these major modules:

src/
├── context/
│   └── AppContext.jsx
├── components/
│   ├── auth/
│   │   └── AuthModal.jsx
│   ├── loan/
│   │   ├── LoanApplicationWizard.jsx
│   │   └── MultiLenderComparison.jsx
│   ├── credit/
│   │   └── CreditScoreDetail.jsx
│   ├── vault/
│   │   └── DocumentVault.jsx
│   ├── affiliate/
│   │   ├── AffiliateOnboarding.jsx
│   │   └── AffiliateDashboard.jsx
│   ├── referral/
│   │   └── ReferAndEarn.jsx
│   ├── profile/
│   │   └── ProfileSettings.jsx
│   ├── calculator/
│   │   └── EmiCalculator.jsx
│   ├── support/
│   │   └── SupportModal.jsx
│   └── home/
│       └── ...
└── data/
    └── mockData.js

The important finding is mockData.js. It contains hardcoded:

NBFC/lender offers
loan interest rates
lender limits
affiliate commission slabs
leads
testimonials
marketing kits
referral data

For example, lenders currently have hardcoded outboundUrl links.

2. Authentication API needed

Currently AuthModal.jsx has a fake OTP flow.

The UI literally uses:

Demo OTP: 1234

And registration collects information including:

full legal name
mobile number
PAN
other profile information
Backend APIs needed
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
Flow
User enters phone
       ↓
POST /auth/send-otp
       ↓
Your backend calls SMS provider
       ↓
User enters OTP
       ↓
POST /auth/verify-otp
       ↓
Backend creates/login user
       ↓
Return secure access token

Do not keep OTP 1234 logic in production.

3. User/Profile server APIs

Currently the user is basically represented by frontend state and localStorage.

You need something like:

GET   /api/users/me
PATCH /api/users/me
GET   /api/users/me/bank-account
POST  /api/users/me/bank-account
PATCH /api/users/me/bank-account

Data the frontend appears to need includes:

User
├── id
├── name
├── phone
├── email
├── PAN
├── KYC status
├── credit score
├── score category
├── last checked
├── bank details
├── affiliate status
└── created at
4. Loan application APIs

LoanApplicationWizard.jsx is one of the biggest areas requiring a backend.

The UI collects/handles things related to:

loan amount
tenure
PAN
Aadhaar
Aadhaar OTP
employment/income information
bank details
lender selection
KYC
e-sign consent

You need at minimum:

POST /api/loan-applications
GET  /api/loan-applications
GET  /api/loan-applications/:id
PATCH /api/loan-applications/:id
POST /api/loan-applications/:id/submit

Potential flow:

Create application
       ↓
PAN verification
       ↓
KYC
       ↓
Eligibility calculation
       ↓
Get lender offers
       ↓
User selects lender
       ↓
Send application/referral to lender
       ↓
Track status

A loan application record might look like:

LoanApplication
├── id
├── userId
├── amount
├── tenureMonths
├── purpose
├── employmentType
├── monthlyIncome
├── PAN verification status
├── KYC status
├── selectedLenderId
├── lenderApplicationId
├── status
└── timestamps
5. Lender/NBFC APIs

Currently all lender data comes from:

src/data/mockData.js

The frontend currently pretends to have lenders such as:

Rupay91
MoneyView
KreditBee
CASHe
mPokket
Bajaj Finserv

Each has hardcoded things like:

maxAmount
interestRate
minTenureMonths
maxTenureMonths
processingFeePercent
approvalChance
outboundUrl

You need to move this into your backend/database:

GET /api/lenders
GET /api/lenders/:id
GET /api/loan-offers

Example:

GET /api/loan-offers?amount=500000&tenure=36

Response:

{
  "offers": [
    {
      "lenderId": "xxx",
      "name": "Example Lender",
      "amount": 500000,
      "interestRate": 15.9,
      "tenureMonths": 36,
      "processingFee": 7500,
      "applyUrl": "..."
    }
  ]
}
Important

If this is an affiliate marketplace rather than a lender itself, you may not actually need direct loan-disbursal APIs initially.

Your MVP could be:

User enters details
       ↓
Your server stores lead
       ↓
Find matching partner
       ↓
Generate tracked affiliate link
       ↓
Redirect user to official partner
       ↓
Partner sends webhook/status update

That is much simpler than becoming involved in actual lending operations.

6. Credit score API

CreditScoreDetail.jsx presents a supposed:

Official Bureau Score
CIBIL Credit Score Analysis

But currently this is frontend data.

The component even shows detailed factors such as:

payment history
utilization
hard inquiries
score category

You need:

POST /api/credit-score/consent
POST /api/credit-score/check
GET  /api/credit-score/latest
GET  /api/credit-score/history

But the actual server would need integration with an authorized credit bureau/provider. You cannot just generate an "official CIBIL score" yourself.

So architecturally:

Frontend
    ↓
Your backend
    ↓
Authorized bureau/provider integration
    ↓
Store permitted result/metadata
    ↓
Return result to frontend
7. PAN verification

The scaffold asks for PAN in multiple places.

You'll need something along these lines:

POST /api/kyc/pan/verify

Example flow:

User submits PAN
       ↓
Backend validates format
       ↓
Backend calls authorized verification provider
       ↓
Return verification status

Do not put a PAN provider secret/API key inside React or the APK.

8. Aadhaar/KYC is a major missing backend

The current wizard has UI text suggesting:

Aadhaar OTP verification
document liveness check
facial match with Aadhaar photo
Aadhaar e-sign

These are not something you should fake as production features.

The current scaffold even displays a fake result like:

Facial match with Aadhaar photo: 99.4%

That needs replacing with actual provider-driven results if such verification is legally and technically supported for your business.

Potential internal API design:

POST /api/kyc/session
POST /api/kyc/aadhaar/start
POST /api/kyc/aadhaar/verify-otp
POST /api/kyc/liveness/start
GET  /api/kyc/:sessionId/status

Your architecture should be:

App
 ↓
Your Backend
 ↓
KYC Provider
 ↓
Provider webhook
 ↓
Your Backend updates KYC status

Never make the frontend directly own sensitive KYC provider secrets.

9. Bank account APIs

ProfileSettings.jsx expects bank information including:

bankName
accountNumber
ifsc

You need:

POST /api/bank-accounts
GET  /api/bank-accounts
DELETE /api/bank-accounts/:id
POST /api/bank-accounts/:id/verify

Potential database:

BankAccount
├── id
├── userId
├── accountHolderName
├── encryptedAccountNumber
├── IFSC
├── bankName
├── verificationStatus
└── createdAt

Account numbers should not be casually stored in plaintext.

10. Document Vault API

DocumentVault.jsx is currently completely mocked.

It shows documents such as:

PAN Card Document
Aadhaar e-KYC Offline Certificate
Loan Sanction Letter
e-Signed Loan Agreement & KFS

And clicking download currently just does an alert.

You need:

GET  /api/documents
POST /api/documents/upload
GET  /api/documents/:id
GET  /api/documents/:id/download
DELETE /api/documents/:id

Recommended architecture:

React App
    ↓
Backend creates upload authorization
    ↓
Encrypted/private object storage
    ↓
Document metadata in PostgreSQL

For example:

Storage:
S3 / Cloudflare R2 / equivalent private storage


Database:
document ID
owner ID
storage key
type
verification status
created time

Do not expose a public bucket containing PAN/Aadhaar documents.

11. Affiliate system API

This scaffold actually has a substantial affiliate section.

AffiliateOnboarding.jsx collects information for affiliate registration, including things such as:

personal/company information
PAN
bank account information

AffiliateDashboard.jsx displays partner offers.

mockData.js contains fake leads and commissions.

You need:

POST /api/affiliate/apply
GET  /api/affiliate/me
GET  /api/affiliate/leads
GET  /api/affiliate/earnings
GET  /api/affiliate/referral-link
GET  /api/affiliate/marketing-kits

Potential data:

Affiliate
├── id
├── userId
├── type
├── status
├── PAN verification
├── payout account
├── referralCode
└── createdAt


Lead
├── id
├── affiliateId
├── userId/referral identifier
├── lenderId
├── status
├── loanAmount
└── timestamps


Commission
├── id
├── affiliateId
├── leadId
├── amount
├── status
└── paidAt
12. Referral API

You have ReferAndEarn.jsx.

You need:

GET  /api/referrals/me
POST /api/referrals/generate
GET  /api/referrals/stats
GET  /api/referrals/history

Example:

https://yourapp.com/r/ABC123

When opened:

Referral link
     ↓
Backend records referral
     ↓
App opens
     ↓
User signs up
     ↓
Referral becomes associated

The referral relationship should be validated server-side, not trusted from the frontend.

13. Affiliate link tracking

This is particularly important because the current lender links contain parameters like:

utm_source
utm_medium
aff_id

Instead of directly hardcoding partner links in the React app, I recommend:

GET /api/out/rupay91

Your server:

GET /api/out/:partner
      ↓
Identify logged-in user/referrer
      ↓
Create click event
      ↓
Generate tracking information
      ↓
302 redirect to partner URL

Then you can track:

PartnerClick
├── id
├── userId
├── affiliateId
├── lenderId
├── referralCode
├── clickedAt
└── convertedAt
14. Support APIs

SupportModal.jsx currently appears mostly client-side with canned answers/chat.

It also includes callback functionality.

You need, depending on how real you want support to be:

POST /api/support/tickets
GET  /api/support/tickets
GET  /api/support/tickets/:id
POST /api/support/callback-requests

For the chatbot, either:

Simple MVP
POST /api/support/chat

Your backend searches FAQs.

Or:

User
 ↓
Your backend
 ↓
LLM/knowledge base
 ↓
Response

But I would not build AI chat first.

15. Feedback API

ProfileSettings.jsx currently stores feedback in:

localStorage

You need:

POST /api/feedback
GET  /api/feedback

Probably an admin-only moderation system before publicly displaying user feedback.

16. EMI calculator needs NO server

Good news: this one can remain entirely frontend.

EmiCalculator.jsx

does not need a database or API unless you want lender-specific dynamic rates.

My recommended backend architecture

For this project, do not start with microservices.

I recommend:

                    ┌──────────────────────┐
                    │ React + Capacitor App │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │      API Server      │
                    │ Node.js + TypeScript │
                    │ Express/Fastify      │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼──────────────────┐
             ▼                 ▼                  ▼
       PostgreSQL          Redis/Queue        Object Storage
        Users             OTP limits           Documents
        Loans             Jobs/webhooks
        Affiliates
        Referrals
             │
             ▼
    External Provider Layer
    ├── SMS/OTP
    ├── KYC/PAN provider
    ├── Credit bureau/provider
    ├── Lender/affiliate partners
    ├── eSign provider
    └── Notifications
Stack I would choose

Since you already work with JS/TS:

Backend:       Node.js + TypeScript
Framework:     Fastify or Express
Database:      PostgreSQL
ORM:           Prisma or Drizzle
Cache/queues:  Redis
File storage:  S3-compatible private storage
Auth:          JWT access + refresh tokens
API docs:      OpenAPI/Swagger
Deployment:    Docker
Database tables I think you need
Core
users
user_sessions
otp_requests
Verification
kyc_sessions
pan_verifications
bank_accounts
consents
Lending
lenders
loan_products
loan_applications
loan_offers
loan_status_events
Affiliate
affiliates
affiliate_referral_links
affiliate_clicks
affiliate_leads
commissions
commission_payouts
Documents
documents
document_access_logs
Other
referrals
notifications
support_tickets
callback_requests
feedback
audit_logs
What is fake right now vs what needs replacing
Current feature	Current implementation	Backend needed?
Login	Fake/localStorage	Yes
OTP	Demo OTP 1234	Yes
Users	localStorage	Yes
PAN	UI only	Yes
Aadhaar OTP	UI simulation	Yes
Liveness	Fake result	Yes
Credit score	Hardcoded	Yes
Loan offers	mockData.js	Yes
Loan application	Frontend state	Yes
Loan tracking	Mock state	Yes
Bank account	Frontend data	Yes
Documents	Hardcoded + alert	Yes
Affiliate leads	Mock data	Yes
Commissions	Mock data	Yes
Referral system	Frontend-oriented	Yes
Support chat	Local/canned	Optional
EMI calculator	Local math	No
Language switching	Local data	No
The most important discovery

This ZIP does not contain a backend at all.

I found:

React
Vite
Tailwind
Capacitor

But no:

Express server
FastAPI
NestJS
Django
Spring Boot
server/
api/
database/
Prisma schema
Docker backend

So our next job should be to turn this into a real architecture systematically.

I recommend this build order
Phase 1 — Make the scaffold talk to a real server

Build:

Backend project
├── auth
├── users
├── loans
├── lenders
├── affiliates
├── referrals
└── support

Initially, use our own database with mock providers.

Phase 2 — Replace frontend localStorage

Replace:

usersDb
localStorage OTP
mock loan applications
mock affiliate leads

with actual API calls.

Phase 3 — Build the lender/affiliate integration layer

Only after the core app works.

Phase 4 — Add real regulated integrations

KYC, credit bureau, lender APIs, e-sign, etc., subject to the necessary legal/commercial approvals.