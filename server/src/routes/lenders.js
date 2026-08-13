const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const lenders = await prisma.lender.findMany();
  res.json({ lenders });
});

router.get('/:id', async (req, res) => {
  const lender = await prisma.lender.findUnique({ where: { id: req.params.id } });
  if (!lender) return res.status(404).json({ error: 'not found' });
  res.json({ lender });
});

router.get('/offers', async (req, res) => {
  const amount = parseInt(req.query.amount || '0', 10);
  const tenure = parseInt(req.query.tenure || '0', 10);
  const lenders = await prisma.lender.findMany();
  const offers = lenders
    .filter(l => amount <= l.maxAmount && (tenure === 0 || (tenure >= l.minTenure && tenure <= l.maxTenure)))
    .map(l => ({
      lenderId: l.id,
      name: l.name,
      amount,
      interestRate: l.interestRate,
      tenureMonths: tenure || l.maxTenure,
      processingFee: Math.round((amount * l.processingFeePercent) / 100),
      applyUrl: l.outboundUrl
    }));
  res.json({ offers });
});

module.exports = router;
