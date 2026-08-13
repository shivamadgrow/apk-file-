class MockBankProvider {
  async verifyAccount({ accountNumber, ifsc, name }) {
    // simulate verification
    if (accountNumber.endsWith('0')) return { status: 'FAILED', reason: 'invalid' };
    return { status: 'VERIFIED', accountHolderName: name || 'Test User', masked: 'XXXX' + accountNumber.slice(-4) };
  }
}

module.exports = new MockBankProvider();
