#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Admin UI Server
 *
 * This script runs all tests and validation checks to ensure the application
 * is working correctly. It can be used in CI/CD pipelines, Docker builds,
 * or local development.
 *
 * Usage:
 *   node scripts/run-all-tests.js
 *   npm run test:all
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting comprehensive test suite for Admin UI Server...\n');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.cyan}▶ ${description}...${colors.reset}`);
    log(`${colors.yellow}Running: ${command}${colors.reset}`);

    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: __dirname
    });

    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return { success: true, output: result };
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (error.stdout) log(`${colors.yellow}Output: ${error.stdout}${colors.reset}`);
    if (error.stderr) log(`${colors.red}Error Output: ${error.stderr}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const results = [];
  let overallSuccess = true;

  // 1. Run Jest unit tests
  log(`\n${  '='.repeat(60)}`, 'bright');
  log('🧪 PHASE 1: Unit Tests (Jest)', 'bright');
  log('='.repeat(60), 'bright');

  const jestResult = runCommand('npm test', 'Jest Unit Tests');
  results.push({ phase: 'Unit Tests', ...jestResult });
  if (!jestResult.success) overallSuccess = false;

  // 2. Run Rate Limiting Tests
  log(`\n${  '='.repeat(60)}`, 'bright');
  log('🚦 PHASE 2: Rate Limiting Tests', 'bright');
  log('='.repeat(60), 'bright');

  const rateLimitResult = runCommand('npm run test:rate-limit', 'Rate Limiting Tests');
  results.push({ phase: 'Rate Limiting', ...rateLimitResult });
  if (!rateLimitResult.success) overallSuccess = false;

  // 3. Run Integration Tests
  log(`\n${  '='.repeat(60)}`, 'bright');
  log('🔗 PHASE 3: Integration Tests', 'bright');
  log('='.repeat(60), 'bright');

  const integrationResult = runCommand('npm run test:integration', 'Integration Tests');
  results.push({ phase: 'Integration', ...integrationResult });
  if (!integrationResult.success) overallSuccess = false;

  // 4. Run Linting
  log(`\n${  '='.repeat(60)}`, 'bright');
  log('🔍 PHASE 4: Code Quality Checks', 'bright');
  log('='.repeat(60), 'bright');

  const lintResult = runCommand('npm run lint', 'ESLint Code Quality Check');
  results.push({ phase: 'Linting', ...lintResult });
  if (!lintResult.success) overallSuccess = false;

  // 5. Summary
  log(`\n${  '='.repeat(60)}`, 'bright');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(60), 'bright');

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${status} - ${result.phase}`, color);
  });

  log(`\n${  '='.repeat(60)}`, 'bright');
  if (overallSuccess) {
    log('🎉 ALL TESTS PASSED! Application is ready for deployment.', 'green');
    log('='.repeat(60), 'green');
    process.exit(0);
  } else {
    log('💥 SOME TESTS FAILED! Please fix issues before deployment.', 'red');
    log('='.repeat(60), 'red');
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.bright}Admin UI Server - Test Runner${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/run-all-tests.js [options]

${colors.cyan}Options:${colors.reset}
  --help, -h     Show this help message
  --unit-only     Run only Jest unit tests
  --integration-only  Run only integration tests
  --rate-limit-only   Run only rate limiting tests

${colors.cyan}Examples:${colors.reset}
  node scripts/run-all-tests.js                    # Run all tests
  node scripts/run-all-tests.js --unit-only        # Run only unit tests
  node scripts/run-all-tests.js --integration-only # Run only integration tests

${colors.yellow}Note:${colors.reset} This script is designed for CI/CD pipelines and comprehensive testing.
  For development, use individual npm scripts like 'npm test' or 'npm run test:rate-limit'.
`);
  process.exit(0);
}

// Run specific test phases based on arguments
if (args.includes('--unit-only')) {
  log('🧪 Running Unit Tests Only...', 'cyan');
  const result = runCommand('npm test', 'Jest Unit Tests');
  process.exit(result.success ? 0 : 1);
}

if (args.includes('--integration-only')) {
  log('🔗 Running Integration Tests Only...', 'cyan');
  const result = runCommand('npm run test:integration', 'Integration Tests');
  process.exit(result.success ? 0 : 1);
}

if (args.includes('--rate-limit-only')) {
  log('🚦 Running Rate Limiting Tests Only...', 'cyan');
  const result = runCommand('npm run test:rate-limit', 'Rate Limiting Tests');
  process.exit(result.success ? 0 : 1);
}

// Run all tests by default
runTests().catch(error => {
  log(`\n${colors.red}💥 Unexpected error during test execution:${colors.reset}`, 'red');
  log(`${colors.red}${error.message}${colors.reset}`, 'red');
  process.exit(1);
});
