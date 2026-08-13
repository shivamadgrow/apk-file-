const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function main() {
  console.log('Seeding lenders...');
  const lenders = [
    {
      id: uuidv4(),
      name: 'Rupay91',
      maxAmount: 500000,
      minTenure: 6,
      maxTenure: 48,
      interestRate: 16.5,
      processingFeePercent: 1.0,
      outboundUrl: 'https://example.com/rupay91'
    },
    {
      id: uuidv4(),
      name: 'MoneyView',
      maxAmount: 300000,
      minTenure: 3,
      maxTenure: 36,
      interestRate: 18.9,
      processingFeePercent: 1.5,
      outboundUrl: 'https://example.com/moneyview'
    }
  ];

  for (const l of lenders) {
    await prisma.lender.upsert({
      where: { name: l.name },
      update: {},
      create: l
    });
  }

  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
