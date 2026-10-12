# Partner Financial Data — Verification Status

This tracks exactly which figures `src/data/mockData.js` needs per lending partner
before the app can display loan-term disclosures (APR, repayment period, fees) as
verified facts rather than a placeholder ("Set by partner" / no figure shown at all).

**Update 2026-10-12 — resolved.** The website (`paisainminutescrm`'s
`config/partners.php`, read-only reference) was updated by the client with real,
per-partner disclosure data for the first time, and the partner roster itself
changed: Shubh Cash, Udhaar Now, Easy Fincare, and Loan Within were retired, and a
new app-based partner, MoneyDot, was added. `mockData.js` has been updated to match.

| Partner (slug) | Max Loan | Rate | APR | Tenure | Processing Fee | Min Salary | Min CIBIL | Source |
|---|---|---|---|---|---|---|---|---|
| rupay91 | ₹1,00,000 | Up to 1.0%/day | 14–24% p.a. | 30–90 Days | 1–3% + 18% GST | ₹50,000 | 700+ | Website `config/partners.php`, 2026-10-12 |
| jhatpatloans | ₹1,00,000 | Up to 0.8%/day | 14–24% p.a. | 30–90 Days | 1–3% + 18% GST | ₹30,000 | 600+ | Website `config/partners.php`, 2026-10-12 |
| instarupees | ₹1,00,000 | Up to 1.0%/day | 14–24% p.a. | 30–60 Days | 1–3% + 18% GST | ₹40,000 | 550+ | Website `config/partners.php`, 2026-10-12 |
| borrowera | ₹1,00,000 | Up to 1.0%/day | 14–24% p.a. | 30–90 Days | 1–3% + 18% GST | ₹45,000 | 600+ | Website `config/partners.php`, 2026-10-12 |
| ticket2loan | ₹1,00,000 | Up to 1.0%/day | 14–24% p.a. | 30–90 Days | 1–3% + 18% GST | ₹25,000 | 500+ | Website `config/partners.php`, 2026-10-12 |
| moneydot (app, `com.yrs.moneydot`) | ₹1,00,000 | N/A (not daily-rate) | 24–60% p.a. | 3–12 Months | Up to 5.1% + GST | Set by Partner | Set by Partner | Website `config/partners.php`, 2026-10-12 |
| ~~shubhcash~~ | — | — | — | — | — | — | — | Retired by website 2026-10-10/12 |
| ~~udhaarnow~~ | — | — | — | — | — | — | — | Retired by website 2026-10-10/12 |
| ~~easyfincare~~ | — | — | — | — | — | — | — | Retired by website 2026-10-10/12 |
| ~~loanwithin~~ | — | — | — | — | — | — | — | Retired by website 2026-10-10/12 |

## Known backend gap (not yet fixed, as of 2026-10-12)

The backend (`paisa/server`) has **not** been updated to match any of this:

1. `prisma/schema.prisma`'s `AffiliatePartner` model has no fields for `isApp`,
   `appPackage`, `apr`, `tenure`, `processingFee`, `minSalary`, or `minCibil`. The
   database cannot currently store any of the data in the table above.
2. `src/lib/seedConfig.js`'s `parsePartnerTargets()` regex only ever extracts `slug`
   and `target_url` from `config/partners.php` — it silently drops every other new
   field even if re-run.
3. `src/lib/partners.js`'s `buildTargetUrl()` appends UTM/ref/sub_id params as plain
   query-string params. If `moneydot` were ever seeded into `AffiliatePartner` and
   redirected through the normal backend endpoint, this would **not** wrap them in
   Play Store's required single `referrer=` parameter, breaking install attribution.
4. Because of (1)-(3), `moneydot` almost certainly does not exist as a row in the
   backend's `AffiliatePartner` table at all right now.

**Mitigation already applied in the Android app**: `MultiLenderComparison.jsx`
special-cases `nbfc.isApp` and calls `buildMoneyDotPlayStoreUrl()`
(`src/services/api.js`) to build the Play Store link with a correctly wrapped
`referrer=` param directly on-device, bypassing the backend's generic redirect
endpoint entirely for MoneyDot — mirroring the website's own `loan-offers.php`
`is_app` branch, which does the same thing. The other 5 (website-based) partners are
unaffected and still use the normal tracked backend redirect.

If the backend is ever updated to properly support app partners (schema fields +
seed script + a Play-Store-aware `buildTargetUrl()` path), this mitigation in the
Android app would become unnecessary but is not harmful to keep.
