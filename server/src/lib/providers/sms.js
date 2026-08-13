class SMSProvider {
  async sendOTP({ phone, code, ttlSeconds }) {
    throw new Error('Not implemented');
  }
}

module.exports = SMSProvider;
