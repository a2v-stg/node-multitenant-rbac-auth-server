#!/usr/bin/env node

/**
 * Build Sample-App Client Script
 * 
 * This script builds the sample-app client application independently of the server startup.
 * Use this during Docker image builds or when you want to pre-build the client.
 * 
 * Usage:
 *   node scripts/build-client.js
 *   npm run build:client:standalone
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function buildClient() {
  const clientPath = path.join(__dirname, '..', 'client');
  const clientDistPath = path.join(clientPath, 'dist');
  
  try {
    console.log('🔨 Building sample-app client application...');
    
    // Check if client directory exists
    if (!fs.existsSync(clientPath)) {
      throw new Error('Client directory not found');
    }
    
    // Check if package.json exists in client directory
    const clientPackagePath = path.join(clientPath, 'package.json');
    if (!fs.existsSync(clientPackagePath)) {
      throw new Error('Client package.json not found');
    }
    
    // Change to client directory
    process.chdir(clientPath);
    
    // Install dependencies if node_modules doesn't exist
    if (!fs.existsSync(path.join(clientPath, 'node_modules'))) {
      console.log('📦 Installing client dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Build the client
    console.log('🔨 Running client build...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Verify build output
    if (!fs.existsSync(clientDistPath)) {
      throw new Error('Client build failed - dist directory not created');
    }
    
    console.log('✅ Sample-app client built successfully');
    console.log(`📁 Build output: ${clientDistPath}`);
    
    // List build contents
    const buildContents = fs.readdirSync(clientDistPath);
    console.log('📋 Build contents:', buildContents);
    
    return clientDistPath;
  } catch (error) {
    console.error('❌ Failed to build sample-app client:', error.message);
    process.exit(1);
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  buildClient();
}

module.exports = { buildClient }; 