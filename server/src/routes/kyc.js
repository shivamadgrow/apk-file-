const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mockKyc = require('../lib/providers/mockKyc');
const mockPan = require('../lib/providers/mockPan');
const { requireAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.post('/session', requireAuth, async (req, res) => {
  // create kyc session in provider (mock)
  const { sessionId, status } = await mockKyc.createSession({ userId: req.user.id });
  const rec = await prisma.kycSession.create({ data: { userId: req.user.id, providerSessionId: sessionId, type: 'AADHAAR', status } });
  res.json({ session: rec });
});

router.post('/aadhaar/start', requireAuth, [body('aadhaar').isString()], async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // simulate starting aadhaar OTP
  const rec = await prisma.kycSession.create({ data: { userId: req.user.id, providerSessionId: 'mock-aadhaar-' + req.user.id, type: 'AADHAAR', status: 'OTP_SENT' } });
  res.json({ session: rec, debug: { otp: '123456' } });
});

router.post('/aadhaar/verify-otp', requireAuth, [body('sessionId').isString(), body('otp').isString()], async (req, res) => {
  const { sessionId, otp } = req.body;
  // accept only debug OTP for mock
  const k = await prisma.kycSession.findFirst({ where: { providerSessionId: sessionId } });
  if (!k) return res.status(404).json({ error: 'session not found' });
  if (otp !== '123456') {
    await prisma.kycSession.update({ where: { id: k.id }, data: { status: 'FAILED' } });
    return res.status(400).json({ error: 'invalid otp' });
  }
  await prisma.kycSession.update({ where: { id: k.id }, data: { status: 'VERIFIED' } });
  res.json({ ok: true });
});

router.post('/liveness/start', requireAuth, async (req, res) => {
  const rec = await prisma.kycSession.create({ data: { userId: req.user.id, providerSessionId: 'mock-liveness-' + req.user.id, type: 'LIVENESS', status: 'IN_PROGRESS' } });
  // simulate finished
  await prisma.kycSession.update({ where: { id: rec.id }, data: { status: 'VERIFIED' } });
  res.json({ session: rec });
});

router.get('/:sessionId/status', requireAuth, async (req, res) => {
  const k = await prisma.kycSession.findUnique({ where: { id: req.params.sessionId } });
  if (!k) return res.status(404).json({ error: 'not found' });
  res.json({ session: k });
});

router.post('/pan/verify', requireAuth, async (req, res) => {
  const { pan } = req.body;
  if (!pan) return res.status(400).json({ error: 'pan required' });
  const result = await mockPan.verifyPAN(pan);
  // store as part of kyc session for traceability
  const session = await prisma.kycSession.create({ data: { userId: req.user.id, providerSessionId: 'mock-pan-' + req.user.id, type: 'PAN', status: result.status, details: result } });
  // update user's PAN and pan verification status if verified
  if (result.status === 'VERIFIED') {
    await prisma.user.update({ where: { id: req.user.id }, data: { pan, kycStatus: 'PAN_VERIFIED' } });
  }
  res.json({ result, session });
});

module.exports = router;
