This directory contains provider interfaces and mock implementations used by the backend.

Each provider has:
- Interface file (e.g. `sms.js`) exporting the expected methods.
- Mock implementation (e.g. `mockSms.js`) used in development.

Replace mocks by adding real provider files under a new directory (e.g. `sms/`), then update DI wiring.

Providers included:
- SMSProvider: `sms.js` / `mockSms.js`
- PANVerificationProvider: `pan.js` / `mockPan.js`
- KYCProvider: `kyc.js` / `mockKyc.js`
- CreditScoreProvider: `credit.js` / `mockCredit.js`
- BankVerificationProvider: `bank.js` / `mockBank.js`
- LenderProvider: `lender.js` / `mockLender.js`
- StorageProvider: `storage.js` / `mockStorage.js`
- NotificationProvider: `notification.js` / `mockNotification.js`
- ESignProvider: `esign.js` / `mockEsign.js`

NOTE: All implementations are mocks and must not call external services.
