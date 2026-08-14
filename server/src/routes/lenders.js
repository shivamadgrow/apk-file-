const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOCK_LENDERS = [
  { id: '1', name: 'Aditya Birla Capital', maxAmount: 500000, minTenure: 6, maxTenure: 60, interestRate: 10.99, processingFeePercent: 1.5 },
  { id: '2', name: 'Bajaj Finserv Direct', maxAmount: 400000, minTenure: 12, maxTenure: 48, interestRate: 11.49, processingFeePercent: 1.2 },
  { id: '3', name: 'Tata Capital Finance', maxAmount: 350000, minTenure: 6, maxTenure: 36, interestRate: 11.99, processingFeePercent: 1.0 },
  { id: '4', name: 'L&T Finance Holding', maxAmount: 250000, minTenure: 3, maxTenure: 24, interestRate: 12.50, processingFeePercent: 1.8 }
];

router.get('/', async (req, res) => {
  try {
    const lenders = await prisma.lender.findMany();
    return res.json({ lenders: lenders.length > 0 ? lenders : MOCK_LENDERS });
  } catch (err) {
    return res.json({ lenders: MOCK_LENDERS });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lender = await prisma.lender.findUnique({ where: { id: req.params.id } });
    if (lender) return res.json({ lender });
  } catch (err) {}
  const lender = MOCK_LENDERS.find(l => l.id === req.params.id) || MOCK_LENDERS[0];
  return res.json({ lender });
});

router.get('/offers', async (req, res) => {
  const amount = parseInt(req.query.amount || '100000', 10);
  const tenure = parseInt(req.query.tenure || '12', 10);
  let lenders = MOCK_LENDERS;
  try {
    const dbLenders = await prisma.lender.findMany();
    if (dbLenders.length > 0) lenders = dbLenders;
  } catch (err) {}

  const offers = lenders.map(l => ({
    lenderId: l.id,
    name: l.name,
    amount,
    interestRate: l.interestRate,
    tenureMonths: tenure,
    processingFee: Math.round((amount * l.processingFeePercent) / 100),
    applyUrl: l.outboundUrl || '#'
  }));
  return res.json({ offers });
});

module.exports = router;
