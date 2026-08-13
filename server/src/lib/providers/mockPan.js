class MockPanProvider {
  async verifyPAN(pan) {
    // basic format check
    const ok = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);
    if (!ok) return { status: 'INVALID_FORMAT' };
    // deterministic behavior for testing
    if (pan.endsWith('0001')) return { status: 'VERIFIED', detail: 'test verified' };
    if (pan.endsWith('9999')) return { status: 'FAILED', detail: 'test failed' };
    return { status: 'PENDING', detail: 'mock pending' };
  }
}

module.exports = new MockPanProvider();
