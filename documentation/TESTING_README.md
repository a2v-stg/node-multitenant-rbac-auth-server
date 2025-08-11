# Testing Guide for Admin UI Server

This document explains the testing strategy and organization for the Admin UI Server.

## 🏗️ Test Organization

### **Jest Unit Tests** (`tests/`)
- **Location**: `src/server/tests/`
- **Purpose**: Fast, isolated unit tests for individual functions and modules
- **Framework**: Jest + Vitest
- **Files**:
  - `tests/unit/mfa.test.js` - MFA service unit tests
  - `tests/unit/logger.test.js` - Logger utility unit tests
  - `tests/test-route-rate-limit.js` - Rate limiting functionality tests
  - `tests/test-rate-limit.js` - Comprehensive rate limiting tests

### **Integration & Functional Tests** (`scripts/`)
- **Location**: `src/server/scripts/`
- **Purpose**: End-to-end functionality tests, data setup, and validation
- **Framework**: Node.js scripts (not Jest)
- **Categories**:
  - `scripts/data-setup/` - Database initialization and test data
  - `scripts/user-management/` - User creation and management tests
  - `scripts/tenant-management/` - Tenant-related functionality tests
  - `scripts/mfa/` - Multi-factor authentication tests
  - `scripts/` - General integration tests

## 🚀 Test Commands

### **Quick Test Commands**
```bash
# Run Jest unit tests only
npm test

# Run Jest tests with coverage
npm run test:coverage

# Run rate limiting tests
npm run test:rate-limit

# Run comprehensive rate limiting tests
npm run test:rate-limit:full

# Run integration tests
npm run test:integration
```

### **Pipeline & CI/CD Commands**
```bash
# Run ALL tests (recommended for CI/CD)
npm run test:all

# Alternative pipeline command
npm run test:pipeline

# Direct script execution
node scripts/run-all-tests.js
```

### **Individual Script Commands**
```bash
# Data setup
npm run init-db
npm run create-migration

# Database operations
npm run migrate
npm run migrate:status
npm run migrate:rollback
npm run migrate:reset
```

## 🔧 Test Runner Script

The main test runner (`scripts/run-all-tests.js`) provides:

- **Comprehensive testing** across all phases
- **CI/CD pipeline integration** with proper exit codes
- **Colored output** for better readability
- **Phase-by-phase execution** with detailed reporting
- **Command-line options** for selective testing

### **Usage Examples**
```bash
# Run all tests (default)
node scripts/run-all-tests.js

# Run only unit tests
node scripts/run-all-tests.js --unit-only

# Run only integration tests
node scripts/run-all-tests.js --integration-only

# Run only rate limiting tests
node scripts/run-all-tests.js --rate-limit-only

# Show help
node scripts/run-all-tests.js --help
```

## 📋 Test Phases

### **Phase 1: Unit Tests (Jest)**
- Tests individual functions and modules
- Fast execution (< 1 second)
- No external dependencies
- Perfect for CI/CD pipelines

### **Phase 2: Rate Limiting Tests**
- Tests rate limiting functionality
- Validates middleware configuration
- Ensures security features work

### **Phase 3: Integration Tests**
- Tests end-to-end functionality
- Validates API endpoints
- Tests user flows and authentication

### **Phase 4: Code Quality**
- ESLint validation
- Code style consistency
- Potential issues detection

## 🐳 Docker & CI/CD Integration

### **Dockerfile Example**
```dockerfile
# ... other Dockerfile content ...

# Run tests during build
RUN npm run test:all

# ... continue with build ...
```

### **CI/CD Pipeline Example**
```yaml
# GitHub Actions, GitLab CI, etc.
- name: Run Tests
  run: |
    cd src/server
    npm run test:all
```

### **Exit Codes**
- **0**: All tests passed ✅
- **1**: One or more tests failed ❌

## 🛠️ Development Workflow

### **Local Development**
```bash
# Quick unit test during development
npm test

# Test specific functionality
npm run test:rate-limit

# Full test suite before commit
npm run test:all
```

### **Before Deployment**
```bash
# Ensure all tests pass
npm run test:all

# Check code quality
npm run lint

# Verify database migrations
npm run migrate:status
```

## 📁 Directory Structure

```
src/server/
├── tests/                          # Jest unit tests
│   ├── unit/                      # Pure unit tests
│   │   ├── mfa.test.js           # MFA service tests
│   │   └── logger.test.js        # Logger utility tests
│   ├── test-route-rate-limit.js  # Rate limiting tests
│   └── test-rate-limit.js        # Comprehensive rate tests
├── scripts/                       # Integration & functional tests
│   ├── data-setup/               # Database & data scripts
│   ├── user-management/          # User-related tests
│   ├── tenant-management/        # Tenant-related tests
│   ├── mfa/                      # MFA functionality tests
│   ├── migrate.js                # Migration utility
│   └── run-all-tests.js         # Main test runner
└── package.json                  # Test scripts configuration
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Rate Limiting Tests Fail**
   - Check if server is running on port 3000
   - Verify rate limiting middleware is configured
   - Check environment variables

2. **Integration Tests Fail**
   - Ensure database is accessible
   - Check authentication configuration
   - Verify API endpoints are working

3. **Jest Tests Fail**
   - Check for syntax errors
   - Verify test dependencies
   - Check test environment setup

### **Debug Mode**
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test -- tests/unit/mfa.test.js

# Run tests in watch mode
npm test -- --watch
```

## 📚 Best Practices

1. **Write Unit Tests First**
   - Focus on isolated functionality
   - Keep tests fast and reliable
   - Use Jest for unit testing

2. **Use Integration Tests Sparingly**
   - Test critical user flows
   - Validate API contracts
   - Keep execution time reasonable

3. **Maintain Test Data**
   - Use consistent test data
   - Clean up after tests
   - Document test requirements

4. **CI/CD Integration**
   - Run tests on every commit
   - Use proper exit codes
   - Provide clear failure messages

## 🎯 Summary

The testing strategy provides:

- **Fast unit tests** for development feedback
- **Comprehensive testing** for deployment confidence
- **CI/CD integration** with proper exit codes
- **Clear organization** separating unit tests from integration tests
- **Single command** (`npm run test:all`) for complete validation

For CI/CD pipelines, use `npm run test:all` or `npm run test:pipeline` to ensure all functionality works correctly before deployment. 