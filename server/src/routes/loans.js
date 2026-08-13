const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, async (req, res) => {
  const data = req.body;
  const application = await prisma.loanApplication.create({ data: { ...data, userId: req.user.id } });
  res.json({ application });
});

router.get('/', requireAuth, async (req, res) => {
  const applications = await prisma.loanApplication.findMany({ where: { userId: req.user.id } });
  res.json({ applications });
});

router.get('/:id', requireAuth, async (req, res) => {
  const app = await prisma.loanApplication.findUnique({ where: { id: req.params.id } });
  if (!app || app.userId !== req.user.id) return res.status(404).json({ error: 'not found' });
  res.json({ application: app });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const app = await prisma.loanApplication.findUnique({ where: { id: req.params.id } });
  if (!app || app.userId !== req.user.id) return res.status(404).json({ error: 'not found' });
  const updated = await prisma.loanApplication.update({ where: { id: req.params.id }, data: req.body });
  res.json({ application: updated });
});

router.post('/:id/submit', requireAuth, async (req, res) => {
  // simulate sending to lender via mock provider
  const app = await prisma.loanApplication.update({ where: { id: req.params.id }, data: { status: 'SUBMITTED', lenderApplicationId: 'mock-' + req.params.id } });
  res.json({ application: app });
});

module.exports = router;
