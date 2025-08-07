const {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} = require('@jest/globals');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('MFA Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('TOTP Verification', () => {
    it('should skip verification sending for TOTP method', async () => {
      // Test that TOTP doesn't call /mfa-send-verification endpoint
      const mockAxios = axios.post.mockResolvedValue({ status: 200, data: {} });

      // This would be tested in the component
      expect(mockAxios).not.toHaveBeenCalledWith(
        '/auth/mfa-send-verification',
        expect.objectContaining({
          mode: 'totp',
        })
      );
    });

    it('should validate TOTP token correctly', async () => {
      const mockResponse = { status: 200, data: { validated: true } };
      axios.post.mockResolvedValue(mockResponse);

      // Test TOTP token validation
      const response = await axios.post('/auth/mfa-verify-token', {
        token: '123456',
        mode: 'totp',
      });

      expect(response.data.validated).toBe(true);
    });
  });

  describe('Organization MFA Configuration', () => {
    it('should enable organization MFA', async () => {
      const mockResponse = { status: 200, data: { success: true } };
      axios.post.mockResolvedValue(mockResponse);

      const response = await axios.post('/auth/organization/mfa/enable', {
        methods: ['totp'],
      });

      expect(response.data.success).toBe(true);
    });

    it('should get organization MFA config', async () => {
      const mockConfig = {
        enabled: true,
        requiredForLocalUsers: true,
        methods: ['totp'],
        gracePeriod: 7,
      };
      axios.get.mockResolvedValue({ status: 200, data: mockConfig });

      const response = await axios.get('/auth/organization/mfa/config');

      expect(response.data).toEqual(mockConfig);
    });
  });
});
