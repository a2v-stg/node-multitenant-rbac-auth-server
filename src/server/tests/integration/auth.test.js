const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../../app');

describe('Authentication Integration Tests', () => {
  let server;

  beforeAll(() => {
    server = app.listen(0); // Use random port for testing
  });

  afterAll(done => {
    server.close(done);
  });

  describe('Login Flow', () => {
    it('should redirect to MFA setup for new users', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.redirectUrl).toContain('/mfa-setup');
    });

    it('should redirect to MFA verification for existing users', async () => {
      const response = await request(server)
        .post('/auth/login')
        .send({
          username: 'local1@email.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.redirectUrl).toContain('/mfa');
    });
  });

  describe('MFA Verification', () => {
    it('should reject invalid TOTP tokens', async () => {
      const response = await request(server)
        .post('/auth/mfa-verify-token')
        .send({
          token: '000000',
          mode: 'totp',
        })
        .expect(200);

      expect(response.body.validated).toBe(false);
    });
  });

  describe('Organization MFA', () => {
    it('should get organization MFA configuration', async () => {
      const response = await request(server)
        .get('/auth/organization/mfa/config')
        .expect(401); // Should require authentication

      expect(response.status).toBe(401);
    });
  });
});
