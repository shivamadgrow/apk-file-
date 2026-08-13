const request = require('supertest');
const app = require('../src/index');

describe('Auth', () => {
  it('sends otp and verifies', async () => {
    const phone = '9999999999';
    const send = await request(app).post('/api/auth/send-otp').send({ phone });
    expect(send.statusCode).toBe(200);
    const debug = send.body.debug;
    expect(debug.code).toBeDefined();
    const verify = await request(app).post('/api/auth/verify-otp').send({ phone, code: debug.code });
    expect(verify.statusCode).toBe(200);
    expect(verify.body.token).toBeDefined();
  }, 20000);
});
