#!/usr/bin/env node

/**
 * Test script for reverse proxy configuration
 * Run with: node scripts/test-reverse-proxy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function checkEnvironmentVariables() {
  log('\n🔍 Checking Environment Variables...', 'blue');

  const requiredVars = [
    'PREPYATRA_APP_URL',
    'QUIZ_APP_URL',
    'NEXT_PUBLIC_ONBOARDING_APP_URL',
  ];

  const envFile = path.join(process.cwd(), '.env.local');
  const hasEnvFile = fs.existsSync(envFile);

  if (!hasEnvFile) {
    log('  ⚠️  No .env.local file found', 'yellow');
    log('  💡 Create .env.local with your environment variables', 'blue');
  } else {
    log('  ✅ .env.local file exists', 'green');
  }

  let allSet = true;

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value || value === 'undefined') {
      log(`  ❌ ${varName}: Not set`, 'red');
      allSet = false;
    } else {
      // Validate URL format
      try {
        new URL(value);
        log(`  ✅ ${varName}: ${value}`, 'green');
      } catch (error) {
        log(`  ⚠️  ${varName}: Invalid URL format - ${value}`, 'yellow');
        allSet = false;
      }
    }
  });

  return allSet;
}

function checkNextConfigSyntax() {
  log('\n🔍 Checking next.config.js syntax...', 'blue');

  try {
    const nextConfig = require('../next.config.js');
    log('  ✅ next.config.js loads successfully', 'green');

    // Check if rewrites function exists
    if (typeof nextConfig.rewrites === 'function') {
      log('  ✅ rewrites function defined', 'green');
      return true;
    } else {
      log('  ❌ rewrites function not found', 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ next.config.js syntax error: ${error.message}`, 'red');
    return false;
  }
}

function checkVercelConfigSyntax() {
  log('\n🔍 Checking vercel.json syntax...', 'blue');

  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

  if (!fs.existsSync(vercelConfigPath)) {
    log('  ❌ vercel.json not found', 'red');
    return false;
  }

  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    log('  ✅ vercel.json is valid JSON', 'green');

    // Check for rewrites
    if (vercelConfig.rewrites && Array.isArray(vercelConfig.rewrites)) {
      log(`  ✅ Found ${vercelConfig.rewrites.length} rewrite rules`, 'green');

      // Check for environment variable usage
      const hasEnvVars = vercelConfig.rewrites.some(
        (rule) => rule.destination && rule.destination.includes('$')
      );

      if (hasEnvVars) {
        log('  ✅ Environment variables used in rewrites', 'green');
      } else {
        log('  ⚠️  No environment variables found in rewrites', 'yellow');
      }

      return true;
    } else {
      log('  ❌ No rewrites configuration found', 'red');
      return false;
    }
  } catch (error) {
    log(`  ❌ vercel.json syntax error: ${error.message}`, 'red');
    return false;
  }
}

function testHealthEndpoints() {
  log('\n🔍 Testing Health Check Endpoints...', 'blue');

  if (process.env.NODE_ENV === 'production') {
    log('  ⚠️  Skipping health checks in production', 'yellow');
    return true;
  }

  // This would require the dev server to be running
  log('  💡 To test health endpoints, run: npm run dev', 'blue');
  log('  Then visit: http://localhost:3000/api/env-check', 'blue');
  log('  And: http://localhost:3000/api/health', 'blue');

  return true;
}

function showRecommendations() {
  log('\n💡 Recommendations:', 'blue');
  log('  1. Set environment variables in Vercel dashboard', 'reset');
  log('  2. Test locally with .env.local file', 'reset');
  log('  3. Use different URLs for dev/prod environments', 'reset');
  log('  4. Monitor /api/health endpoint after deployment', 'reset');
  log('  5. Check Vercel function logs for any issues', 'reset');
}

function main() {
  log(colors.bold + '🚀 TBE Reverse Proxy Configuration Test' + colors.reset);
  log('==========================================');

  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Next.js Config', fn: checkNextConfigSyntax },
    { name: 'Vercel Config', fn: checkVercelConfigSyntax },
    { name: 'Health Endpoints', fn: testHealthEndpoints },
  ];

  let allPassed = true;

  checks.forEach((check) => {
    const passed = check.fn();
    if (!passed) allPassed = false;
  });

  log('\n==========================================');

  if (allPassed) {
    log('🎉 All checks passed! Your reverse proxy setup looks good.', 'green');
    log('Ready to deploy to Vercel!', 'green');
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }

  showRecommendations();
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the tests
main();
