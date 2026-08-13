const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY = (process.env.ENCRYPTION_KEY || '').slice(0, 32);

function encrypt(text) {
  if (!KEY || KEY.length < 32) throw new Error('ENCRYPTION_KEY must be set and 32 bytes');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(data) {
  if (!KEY || KEY.length < 32) throw new Error('ENCRYPTION_KEY must be set and 32 bytes');
  const b = Buffer.from(data, 'base64');
  const iv = b.slice(0, 12);
  const tag = b.slice(12, 28);
  const encrypted = b.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
