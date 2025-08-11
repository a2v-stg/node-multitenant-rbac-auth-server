const log4js = require('log4js');

// Mock log4js before requiring the logger
jest.mock('log4js', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };

  const mockAuthLogger = {
    info: jest.fn(),
    error: jest.fn()
  };

  const mockMfaLogger = {
    info: jest.fn(),
    error: jest.fn()
  };

  const mockErrorLogger = {
    error: jest.fn()
  };

  return {
    configure: jest.fn(),
    getLogger: jest.fn((category) => {
      switch (category) {
      case 'error':
        return mockErrorLogger;
      case 'auth':
        return mockAuthLogger;
      case 'mfa':
        return mockMfaLogger;
      default:
        return mockLogger;
      }
    })
  };
});

// Now require the logger after mocking log4js
const logger = require('../../utils/logger');

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('General logging methods', () => {
    it('should have info method', () => {
      expect(typeof logger.info).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof logger.error).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof logger.warn).toBe('function');
    });

    it('should have debug method', () => {
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Domain-specific logging methods', () => {
    it('should have auth logging methods', () => {
      expect(typeof logger.auth).toBe('function');
      expect(typeof logger.authError).toBe('function');
    });

    it('should have mfa logging methods', () => {
      expect(typeof logger.mfa).toBe('function');
      expect(typeof logger.mfaError).toBe('function');
    });

    it('should have database logging methods', () => {
      expect(typeof logger.db).toBe('function');
      expect(typeof logger.dbError).toBe('function');
    });

    it('should have API logging methods', () => {
      expect(typeof logger.api).toBe('function');
      expect(typeof logger.apiError).toBe('function');
    });
  });

  describe('Method signatures', () => {
    it('should accept message and optional meta parameter', () => {
      // Test that methods can be called with just a message
      expect(() => logger.info('Simple message')).not.toThrow();

      // Test that methods can be called with message and meta
      expect(() => logger.info('Message with meta', { key: 'value' })).not.toThrow();
    });
  });

  describe('Functionality', () => {
    it('should call log4js logger methods', () => {
      // These tests verify that the logger functions exist and can be called
      // In a real scenario, you'd verify that log4js methods are called
      expect(() => {
        logger.info('Test message');
        logger.error('Test error');
        logger.warn('Test warning');
        logger.debug('Test debug');
      }).not.toThrow();
    });

    it('should format messages with metadata correctly', () => {
      const mockLogger = log4js.getLogger();
      logger.info('Test message', { key: 'value' });
      expect(mockLogger.info).toHaveBeenCalledWith('Test message {"key":"value"}');
    });

    it('should format messages without metadata correctly', () => {
      const mockLogger = log4js.getLogger();
      logger.info('Test message');
      expect(mockLogger.info).toHaveBeenCalledWith('Test message');
    });
  });
});
