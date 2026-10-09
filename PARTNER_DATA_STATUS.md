# Partner Financial Data — Verification Status

This tracks exactly which figures `src/data/mockData.js` needs per lending partner
before the app can display loan-term disclosures (interest rate, repayment period,
fees, total-cost example) as verified facts rather than the current honest
placeholder ("Set by partner" / no figure shown at all).

**As of 2026-10-09, none of the 9 partners have a documented, sourced figure for any
of these columns.** The values that previously existed in `mockData.js`
(`interestRate`, `processingFeePercent`, `minTenureMonths`/`maxTenureMonths`,
`rating`, `approvalChance`) were not traceable to any partner agreement, document, or
other evidence found in this codebase, the backend, or the website — they were
removed from display (not deleted from the file, so the shape is preserved for when
real data arrives) because presenting them as fact would violate Google Play's
personal-loan disclosure policy (which requires real min/max APR, min/max repayment
period, and a representative total-cost example) and the "never fabricate loan terms"
rule for this engagement.

| Partner (slug) | Legal entity / lender identity | Max APR | Min/max repayment period | Processing fee & other charges | Representative total-cost example | Source document | Status |
|---|---|---|---|---|---|---|---|
| ticket2loan | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| jhatpatloans | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| shubhcash | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| udhaarnow | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| instarupees | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| borrowera | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| easyfincare | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| loanwithin | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |
| rupay91 | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | Unconfirmed | None on file | **Missing** |

## What's needed from each partner

For each row above, replace "Unconfirmed" with:
1. The partner's exact registered legal entity name (for the "Legal entity" column — a
   brand name like "Rupay91" is not necessarily the registered lender).
2. Their maximum APR (annualized), as a number they've confirmed in writing — not a
   conversion we compute from a daily/monthly rate ourselves.
3. Their minimum and maximum repayment period, in days or months.
4. Processing fee percentage/flat amount, and any other charges (late fee, bounce
   charge, foreclosure charge) they want disclosed.
5. One representative example (e.g., "₹50,000 borrowed for 90 days costs ₹X total")
   computed the way they actually compute it — not something we construct ourselves
   from a rate we weren't given.
6. A document we can point to if Google Play asks for evidence (a rate card, a signed
   term sheet, a public rate-disclosure page on the partner's own site, etc.).

## What the app does in the meantime

- `MultiLenderComparison.jsx` shows `interestRateDisplay: "Set by partner"` instead of
  a number, and doesn't render `rating`/`approvalChance` (removed from the UI — they
  were unverifiable fabricated-looking "star rating" and "approval chance %" figures).
- Partner cards still show `maxAmount`/`minSalary` as **eligibility-matching
  thresholds** (used to decide which partners to show as eligible for a given salary),
  not as a loan-term disclosure — this is a different legal category and is lower risk,
  but it is also unverified and should eventually be confirmed too.
- The EMI calculator's preview figure is explicitly labeled "Indicative only — your
  actual rate is set by the lending partner you choose."
- The support chatbot's canned replies about rates/fees/tenure now point the user to
  the partner's own offer instead of stating a number.
- (2026-10-09 follow-up) Each partner's `tag` and `features` strings in `mockData.js`
  previously asserted unverified speed/ranking claims directly — "Instant 5 Mins",
  "Most Popular", "Lowest Interest Rate @ upto 1.0%/day", "Pre-Approved Sanction",
  "VIP Disbursal in 6 Minutes", etc. These were neutralized to describe the mechanism
  (e.g., "Digital Sanction Letter") without asserting a specific unverified time,
  rate, or ranking. The Home screen's Business/Gold/Credit Card product tiles also
  previously claimed specific unverified loan amounts (₹50L, ₹25L) and features
  ("Zero Collateral", "Lifetime Free") for loan types that have **no backing partner
  data at all** (only personal loans have real partner data) — these now say "Compare
  Partner Offers" instead of a specific figure.

## Next step

Send each partner the consent/disclosure request drafted separately (see the Phase 2
audit's Section G email template) — it asks for exactly the figures in the table above,
among other things. Until those come back, the app should keep showing "Set by
partner" rather than any number.
