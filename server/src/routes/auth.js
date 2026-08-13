const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const mockSms = require('../lib/providers/mockSms');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const OTP_TTL = 5 * 60; // 5 minutes

router.post('/send-otp', [body('phone').isString().isLength({ min: 8 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { phone } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  // rate limiting naive: check recent OTPs
  const recent = await prisma.oTPCode.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' } });
  if (recent && (new Date() - recent.createdAt) / 1000 < 30) {
    return res.status(429).json({ error: 'Too many requests, please wait' });
  }
  await mockSms.sendOTP({ phone, code, ttlSeconds: OTP_TTL });
  return res.json({ ok: true, debug: { code } });
});

router.post('/verify-otp', [body('phone').isString(), body('code').isString()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { phone, code } = req.body;
  const record = await prisma.oTPCode.findFirst({ where: { phone, code }, orderBy: { createdAt: 'desc' } });
  if (!record) return res.status(400).json({ error: 'invalid' });
  if (record.used) return res.status(400).json({ error: 'already used' });
  if (new Date() > record.expiresAt) return res.status(400).json({ error: 'expired' });
  await prisma.oTPCode.update({ where: { id: record.id }, data: { used: true } });

  // create or find user
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  // create refresh token
  const refreshToken = uuidv4();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10) * 24 * 60 * 60 * 1000));
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });
  return res.json({ ok: true, token, refreshToken });
});

router.post('/refresh', [body('refreshToken').isString()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { refreshToken } = req.body;
  const rec = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!rec || rec.revoked || new Date() > rec.expiresAt) return res.status(401).json({ error: 'invalid refresh token' });
  // rotate: revoke old and create new
  await prisma.refreshToken.update({ where: { id: rec.id }, data: { revoked: true } });
  const newToken = uuidv4();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10) * 24 * 60 * 60 * 1000));
  await prisma.refreshToken.create({ data: { token: newToken, userId: rec.userId, expiresAt } });
  const access = jwt.sign({ sub: rec.userId }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '15m' });
  return res.json({ token: access, refreshToken: newToken });
});

router.post('/logout', [body('refreshToken').isString()], async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  const rec = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (rec) await prisma.refreshToken.update({ where: { id: rec.id }, data: { revoked: true } });
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
});

module.exports = router;
