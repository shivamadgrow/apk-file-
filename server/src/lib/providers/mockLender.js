const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockLenderProvider {
  async apply(application) {
    // simulate async application with random outcome
    return { success: true, externalId: 'mock-app-' + application.id, status: 'APPLIED' };
  }
}

module.exports = new MockLenderProvider();
