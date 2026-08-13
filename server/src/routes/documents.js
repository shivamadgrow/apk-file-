const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireAuth } = require('../middleware/auth');

const uploadDir = process.env.FILES_DIR || path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', requireAuth, async (req, res) => {
  const docs = await prisma.document.findMany({ where: { userId: req.user.id } });
  res.json({ documents: docs });
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'file required' });
  const doc = await prisma.document.create({ data: { userId: req.user.id, filename: file.originalname, path: file.filename, mimeType: file.mimetype } });
  res.json({ document: doc });
});

router.get('/:id/download', requireAuth, async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc || doc.userId !== req.user.id) return res.status(404).json({ error: 'not found' });
  const file = path.join(uploadDir, doc.path);
  res.download(file, doc.filename);
});

module.exports = router;
