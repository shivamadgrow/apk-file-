const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { encrypt, decrypt } = require('../lib/crypto');

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.patch('/me', requireAuth, async (req, res) => {
  const data = req.body;
  const updated = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json({ user: updated });
});

router.get('/me/bank-accounts', requireAuth, async (req, res) => {
  const accounts = await prisma.bankAccount.findMany({ where: { userId: req.user.id } });
  // decrypt account numbers before sending
  const mapped = accounts.map(a => ({ ...a, accountNumber: (() => { try { return decrypt(a.accountNumberEncrypted); } catch { return null; } })() }));
  res.json({ accounts: mapped });
});

router.post('/me/bank-accounts', requireAuth, [body('bankName').isString(), body('ifsc').isString(), body('accountNumber').isString()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { bankName, ifsc, accountNumber } = req.body;
  const encrypted = encrypt(accountNumber);
  const rec = await prisma.bankAccount.create({ data: { userId: req.user.id, bankName, ifsc, accountNumberEncrypted: encrypted } });
  res.json({ account: { id: rec.id, bankName: rec.bankName, ifsc: rec.ifsc, status: rec.status } });
});

router.post('/me/bank-accounts/:id/verify', requireAuth, async (req, res) => {
  const id = req.params.id;
  const acc = await prisma.bankAccount.findUnique({ where: { id } });
  if (!acc || acc.userId !== req.user.id) return res.status(404).json({ error: 'not found' });
  const mockBank = require('../lib/providers/mockBank');
  const decrypted = (() => { try { return require('../lib/crypto').decrypt(acc.accountNumberEncrypted); } catch { return null; } })();
  const result = await mockBank.verifyAccount({ accountNumber: decrypted || '', ifsc: acc.ifsc, name: req.user.name });
  const status = result.status === 'VERIFIED' ? 'VERIFIED' : 'FAILED';
  await prisma.bankAccount.update({ where: { id }, data: { status } });
  res.json({ result });
});

module.exports = router;
