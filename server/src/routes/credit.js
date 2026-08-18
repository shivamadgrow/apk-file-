const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mockCredit = require('../lib/providers/mockCredit');
const { requireAuth } = require('../middleware/auth');

const MOCK_SCORE = {
  score: 765,
  category: 'EXCELLENT',
  lastUpdated: '2026-08-14',
  factors: {
    paymentHistory: '100% On-Time',
    creditUtilization: '14%',
    creditAge: '4 Yrs 8 Mos',
    totalAccounts: 6
  }
};

router.post('/consent', requireAuth, async (req, res) => {
  res.json({ ok: true });
});

router.post('/check', requireAuth, async (req, res) => {
  try {
    const rec = await mockCredit.generateScore(req.user.id);
    return res.json({ creditScore: rec });
  } catch (err) {
    return res.json({ creditScore: MOCK_SCORE });
  }
});

router.get('/', async (req, res) => {
  return res.json({ creditScore: MOCK_SCORE });
});

router.get('/latest', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user';
    const rec = await prisma.creditScore.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (rec) return res.json({ creditScore: rec });
  } catch (err) {}
  return res.json({ creditScore: MOCK_SCORE });
});

router.get('/history', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo-user';
    const recs = await prisma.creditScore.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    if (recs.length > 0) return res.json({ history: recs });
  } catch (err) {}
  return res.json({ history: [MOCK_SCORE] });
});

module.exports = router;
