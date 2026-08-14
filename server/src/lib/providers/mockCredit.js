const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MockCreditProvider {
  async generateScore(userId) {
    let n = 0;
    for (let i = 0; i < (userId || 'user').length; i++) n += (userId || 'user').charCodeAt(i);
    const score = 650 + (n % 200); // 650-850
    const factors = { paymentHistory: '98%', utilization: '15%', inquiries: 1 };
    try {
      const rec = await prisma.creditScore.create({ data: { userId, score, factors } });
      return rec;
    } catch (err) {
      return { id: 'mock-score-1', userId, score, factors, createdAt: new Date() };
    }
  }

  async latest(userId) {
    try {
      const rec = await prisma.creditScore.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      return rec;
    } catch (err) {
      return null;
    }
  }
}

module.exports = new MockCreditProvider();
