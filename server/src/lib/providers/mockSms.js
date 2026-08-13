const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockSMSProvider {
  async sendOTP({ phone, code, ttlSeconds = 300 }) {
    // store OTP in DB for verification flows
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await prisma.oTPCode.create({ data: { phone, code, expiresAt } });
    // Do NOT send any external SMS. Return a simulated response.
    return { success: true, debug: { code, expiresAt } };
  }
}

module.exports = new MockSMSProvider();
