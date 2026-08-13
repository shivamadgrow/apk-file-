const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockKycProvider {
  async createSession({ userId }) {
    const session = await prisma.document.create({ data: { userId, filename: 'kyc-session', path: 'kyc-session', mimeType: 'application/json' } }).catch(()=>null);
    // create a fake session object
    return { sessionId: 'mock-' + userId, status: 'PENDING' };
  }

  async checkStatus(sessionId) {
    // simulate progression
    return { sessionId, status: 'VERIFIED' };
  }
}

module.exports = new MockKycProvider();
