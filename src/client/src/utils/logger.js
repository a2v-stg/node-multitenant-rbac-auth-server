const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  constructor() {
    this.level =
      process.env.NODE_ENV === 'production'
        ? LOG_LEVELS.ERROR
        : LOG_LEVELS.DEBUG
  }

  error(message, ...args) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args)
    }
  }

  warn(message, ...args) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  }

  info(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  debug(message, ...args) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  // Special method for authentication flow logs
  auth(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[AUTH] ${message}`, ...args)
    }
  }

  // Special method for MFA flow logs
  mfa(message, ...args) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[MFA] ${message}`, ...args)
    }
  }
}

export default new Logger()
