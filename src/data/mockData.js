// The lending partner catalogue used to be hardcoded here and had to be manually
// kept in sync with the backend every time the partner roster or eligibility terms
// changed — which drifted out of sync more than once. It's now fetched live from
// the backend at runtime instead: see fetchActivePartners() in src/services/api.js
// (GET {API_BASE_URL}/public/partners) and `partners` / `partnersLoading` /
// `partnersError` / `reloadPartners` on AppContext (src/context/AppContext.jsx),
// which every component that needs the partner list reads from via useApp().

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
