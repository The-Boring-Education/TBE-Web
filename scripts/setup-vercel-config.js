#!/usr/bin/env node

/**
 * Setup script to copy the correct vercel.json based on environment
 * This runs before deployment to ensure the right configuration is used
 */

const fs = require('fs');
const path = require('path');

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

function setupVercelConfig() {
  // Determine environment
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production';
  const environment = isProd ? 'production' : 'development';

  const sourceFile = path.join(process.cwd(), `vercel.${environment}.json`);
  const targetFile = path.join(process.cwd(), 'vercel.json');

  log(`\n🔧 Setting up Vercel config for ${environment} environment`, 'blue');

  if (!fs.existsSync(sourceFile)) {
    log(`❌ Source file not found: vercel.${environment}.json`, 'red');
    process.exit(1);
  }

  try {
    // Copy the environment-specific config
    fs.copyFileSync(sourceFile, targetFile);
    log(`✅ Copied vercel.${environment}.json → vercel.json`, 'green');

    // Verify the copied file
    const config = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    log(`✅ Configuration verified`, 'green');
  } catch (error) {
    log(`❌ Error setting up Vercel config: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the setup
setupVercelConfig();
