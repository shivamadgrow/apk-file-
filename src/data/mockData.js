// Lending partner catalogue for Paisa in Minutes — Personal Loan Marketplace.
// `slug` matches the AffiliatePartner.slug values the website's own partners.php
// config uses (verified against /home/primordic/projects/adgrow/paisainminutescrm,
// re-checked 2026-10-12 after the website's partner roster change). The actual
// outbound URL is never hardcoded here — for website-based partners it is always
// resolved through the backend's tracked redirect endpoint,
// GET {API_BASE_URL}/public/redirect/:slug (same endpoint the website's
// loan-offers.php uses). The one exception is `moneydot` (isApp: true), which is a
// Play Store app, not a website — see buildMoneyDotPlayStoreUrl() in
// src/components/loan/MultiLenderComparison.jsx, which builds its Play Store link
// directly on-device (mirroring the website's own loan-offers.php is_app branch)
// instead of calling the backend redirect endpoint. As of 2026-10-12 the backend's
// AffiliatePartner table has no row and no schema support for moneydot at all, so it
// must not be routed through the generic backend redirect/click-tracking endpoints.
//
// CONFIRMED real data as of 2026-10-12 (read directly from the website's
// config/partners.php, which now carries per-partner APR/tenure/processing-fee
// disclosure for the first time): 6 approved partners, each capped at
// `maxAmount: 100000` (₹1,00,000). Values below (apr, tenure, processing fee, min
// salary, min CIBIL) are taken verbatim from that config. The 4 previously-listed
// partners (Shubh Cash, Udhaar Now, Easy Fincare, Loan Within) have been retired by
// the website and are removed here too.
export const PARTNER_NBFCS = [
  {
    id: "rupay91",
    slug: "rupay91",
    name: "Rupay91",
    logo: "/partners/rupay91.png",
    isApp: false,
    minSalary: 50000,
    minSalaryDisplay: "₹50,000 /mo",
    minCibilDisplay: "700+",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: "Up to 1.0% / day",
    aprDisplay: "14% – 24% p.a.",
    tenureDisplay: "30 - 90 Days",
    processingFeeDisplay: "1% – 3% of loan amount + 18% GST",
    tag: "Highest Loan Amount",
    features: ["Min Salary ₹50,000 Required", "CIBIL Score 700+ Required", "Disbursal Timeline Set by Partner"],
  },
  {
    id: "jhatpat",
    slug: "jhatpatloans",
    name: "Jhatpat Loans",
    logo: "/partners/jhatpat.png",
    isApp: false,
    minSalary: 30000,
    minSalaryDisplay: "₹30,000 /mo",
    minCibilDisplay: "600+",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: "Up to 0.8% / day",
    aprDisplay: "14% – 24% p.a.",
    tenureDisplay: "30 - 90 Days",
    processingFeeDisplay: "1% – 3% of loan amount + 18% GST",
    tag: "Lower Salary Threshold",
    features: ["Min Salary ₹30,000 Required", "CIBIL Score 600+ Required", "Fully Digital Documentation"],
  },
  {
    id: "instarupees",
    slug: "instarupees",
    name: "Insta Rupees",
    logo: "/partners/instarupees.png",
    isApp: false,
    minSalary: 40000,
    minSalaryDisplay: "₹40,000 /mo",
    minCibilDisplay: "550+",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: "Up to 1.0% / day",
    aprDisplay: "14% – 24% p.a.",
    tenureDisplay: "30 - 60 Days",
    processingFeeDisplay: "1% – 3% of loan amount + 18% GST",
    tag: "",
    features: ["Min Salary ₹40,000 Required", "CIBIL Score 550+ Required", "Online Application Process"],
  },
  {
    id: "borrowera",
    slug: "borrowera",
    name: "Borrowera",
    logo: "/partners/borrowera.png",
    isApp: false,
    minSalary: 45000,
    minSalaryDisplay: "₹45,000 /mo",
    minCibilDisplay: "600+",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: "Up to 1.0% / day",
    aprDisplay: "14% – 24% p.a.",
    tenureDisplay: "30 - 90 Days",
    processingFeeDisplay: "1% – 3% of loan amount + 18% GST",
    tag: "Premium Lender",
    features: ["Min Salary ₹45,000 Required", "CIBIL Score 600+ Required", "Digital Sanction Letter"],
  },
  {
    id: "ticket2loan",
    slug: "ticket2loan",
    name: "Ticket 2 Loan",
    logo: "/partners/ticket2loan.png",
    isApp: false,
    minSalary: 25000,
    minSalaryDisplay: "₹25,000 /mo",
    minCibilDisplay: "500+",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: "Up to 1.0% / day",
    aprDisplay: "14% – 24% p.a.",
    tenureDisplay: "30 - 90 Days",
    processingFeeDisplay: "1% – 3% of loan amount + 18% GST",
    tag: "Lowest CIBIL Requirement",
    features: ["Min Salary ₹25,000 Required", "CIBIL Score 500+ Required", "Online Application Process"],
  },
  {
    id: "moneydot",
    slug: "moneydot",
    name: "MoneyDot",
    logo: "/partners/moneydot.png",
    isApp: true,
    appPackage: "com.yrs.moneydot",
    // The website displays "Partner Criteria" instead of a raw number, but both its
    // own sources (config/partners.php's min_salary_val and the CRM's
    // affiliatePartners.js minSalary) use a real ₹15,000 threshold for eligibility
    // filtering — it is not actually unconditional. Match that here.
    minSalary: 15000,
    minSalaryDisplay: "Partner Criteria",
    minCibilDisplay: "Partner Criteria",
    maxAmount: 100000,
    maxLoanDisplay: "₹1,00,000",
    interestRateDisplay: null,
    aprDisplay: "24% – 60% p.a.",
    tenureDisplay: "3 - 12 Months",
    processingFeeDisplay: "Up to 5.1% of loan amount + GST",
    tag: "App-Based Partner",
    features: ["Apply via the MoneyDot Android App", "Eligibility & KYC Set by Partner", "Tenure 3–12 Months"],
  },
];

export const BILINGUAL_TEXT = {
  en: {
    tagline: "Paisa Milega, Minutes Mein",
    headlineMain: "Credit Limit & Loans...",
    headlineSub: "Minutes Mein.",
    checkCreditScore: "Check Free Credit Score",
    applyNow: "Apply Now",
    personalLoan: "Personal Loan",
    businessLoan: "Business Loan",
    goldLoan: "Gold Loan",
    creditCard: "Credit Card",
    becomeAffiliate: "Become an Affiliate",
    trackApplication: "Track Application",
    homeTab: "Home",
    loansTab: "Loans",
    calculatorTab: "Calculator",
    trackTab: "Track",
    profileTab: "Profile",
    rbiPartnerText: "Loans provided by NBFC-registered lending partners",
    emiCalculator: "EMI Calculator",
    documentVault: "Document Vault",
    notifications: "Notifications",
    supportHelp: "24x7 Support & Help"
  },
  hi: {
    tagline: "पैसा मिलेगा, मिनट्स में",
    headlineMain: "क्रेडिट लिमिट और लोन...",
    headlineSub: "मिनट्स में।",
    checkCreditScore: "फ्री क्रेडिट स्कोर जांचें",
    applyNow: "अभी आवेदन करें",
    personalLoan: "पर्सनल लोन",
    businessLoan: "बिजनेस लोन",
    goldLoan: "गोल्ड लोन",
    creditCard: "क्रेडिट कार्ड",
    becomeAffiliate: "एफिलिएट पार्टनर बनें",
    trackApplication: "आवेदन ट्रैक करें",
    homeTab: "होम",
    loansTab: "लोन",
    calculatorTab: "कैलकुलेटर",
    trackTab: "ट्रैक",
    profileTab: "प्रोफाइल",
    rbiPartnerText: "100% आरबीआई-रजिस्टर्ड एनबीएफसी पार्टनर्स द्वारा लोन",
    emiCalculator: "ईएमआई कैलकुलेटर",
    documentVault: "डॉक्यूमेंट वॉल्ट",
    notifications: "सूचनाएं",
    supportHelp: "24x7 सहायता और सपोर्ट"
  }
};
