const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mockCredit = require('../lib/providers/mockCredit');
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.post('/consent', requireAuth, async (req, res) => {
  // record consent (simple implementation)
  // in prod, store consent metadata and signed document
  res.json({ ok: true });
});

router.post('/check', requireAuth, async (req, res) => {
  // generate and store credit score via mockCredit
  const rec = await mockCredit.generateScore(req.user.id);
  res.json({ creditScore: rec });
});

router.get('/latest', requireAuth, async (req, res) => {
  const rec = await prisma.creditScore.findFirst({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ creditScore: rec });
});

router.get('/history', requireAuth, async (req, res) => {
  const recs = await prisma.creditScore.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json({ history: recs });
});

module.exports = router;
