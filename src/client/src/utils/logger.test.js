import { describe, it, expect, vi, beforeEach } from 'vitest'
import logger from './logger'

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods
    global.console = mockConsole
  })

  it('should log info messages', () => {
    logger.info('Test info message')
    expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Test info message')
  })

  it('should log error messages', () => {
    logger.error('Test error message')
    expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error message')
  })

  it('should log warning messages', () => {
    logger.warn('Test warning message')
    expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warning message')
  })

  it('should log debug messages', () => {
    logger.debug('Test debug message')
    expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Test debug message')
  })

  it('should handle objects and arrays', () => {
    const testObj = { key: 'value' }
    const testArray = [1, 2, 3]
    
    logger.info('Object:', testObj)
    logger.info('Array:', testArray)
    
    expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Object:', testObj)
    expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Array:', testArray)
  })

  it('should log auth messages', () => {
    logger.auth('Test auth message')
    expect(mockConsole.info).toHaveBeenCalledWith('[AUTH] Test auth message')
  })

  it('should log mfa messages', () => {
    logger.mfa('Test mfa message')
    expect(mockConsole.info).toHaveBeenCalledWith('[MFA] Test mfa message')
  })
}) 