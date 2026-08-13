const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockCreditProvider {
  async generateScore(userId) {
    // deterministic pseudo-random based on id hash
    let n = 0;
    for (let i = 0; i < userId.length; i++) n += userId.charCodeAt(i);
    const score = 300 + (n % 551); // 300-850
    const factors = { paymentHistory: 90, utilization: 30, inquiries: 1 };
    const rec = await prisma.creditScore.create({ data: { userId, score, factors } });
    return rec;
  }

  async latest(userId) {
    const rec = await prisma.creditScore.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return rec;
  }
}

module.exports = new MockCreditProvider();
