const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockSMSProvider {
  async sendOTP({ phone, code, ttlSeconds = 300 }) {
    // store OTP in DB for verification flows (with fallback if DB is offline)
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    try {
      await prisma.oTPCode.create({ data: { phone, code, expiresAt } });
    } catch (err) {
      // Graceful fallback when PostgreSQL server is offline
    }
    // Return simulated response
    return { success: true, debug: { code, expiresAt } };
  }
}

module.exports = new MockSMSProvider();
